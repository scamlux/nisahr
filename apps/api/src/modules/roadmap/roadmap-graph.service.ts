import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  findGraphTemplate,
  GRAPH_TEMPLATES,
  RoadmapGraphTemplate,
} from './graph-templates';

/** roadmap.sh-style layout: central topic spine, subtopics fan out sideways. */
const SPINE_GAP_Y = 200;
const BRANCH_X = 380;
const BRANCH_GAP_Y = 96;

export function layoutTemplate(
  template: RoadmapGraphTemplate,
): Map<string, { x: number; y: number }> {
  const pos = new Map<string, { x: number; y: number }>();
  const topics = template.nodes.filter((n) => n.type === 'TOPIC');

  topics.forEach((topic, i) => {
    pos.set(topic.key, { x: 0, y: i * SPINE_GAP_Y });
  });

  // Attach every non-topic node to the topic that points at it.
  const parentOf = new Map<string, string>();
  for (const edge of template.edges) {
    const from = template.nodes.find((n) => n.key === edge.from);
    const to = template.nodes.find((n) => n.key === edge.to);
    if (from?.type === 'TOPIC' && to && to.type !== 'TOPIC' && !parentOf.has(to.key)) {
      parentOf.set(to.key, from.key);
    }
  }

  const childrenOf = new Map<string, string[]>();
  for (const node of template.nodes) {
    if (node.type === 'TOPIC') continue;
    const parent = parentOf.get(node.key) ?? topics[0]?.key;
    if (!parent) continue;
    const list = childrenOf.get(parent) ?? [];
    list.push(node.key);
    childrenOf.set(parent, list);
  }

  for (const [parent, children] of childrenOf) {
    const base = pos.get(parent) ?? { x: 0, y: 0 };
    children.forEach((childKey, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const slot = Math.floor(i / 2);
      pos.set(childKey, {
        x: side * BRANCH_X,
        y: base.y - BRANCH_GAP_Y / 2 + slot * BRANCH_GAP_Y,
      });
    });
  }

  // Anything unplaced (defensive) goes below the spine.
  template.nodes.forEach((n, i) => {
    if (!pos.has(n.key)) pos.set(n.key, { x: 0, y: (topics.length + i) * SPINE_GAP_Y });
  });
  return pos;
}

export function computeGraphCompletion(
  nodes: { type: string; status: string }[],
): number {
  const relevant = nodes.filter((n) => n.type !== 'OPTIONAL' && n.status !== 'SKIPPED');
  if (relevant.length === 0) return 0;
  const done = relevant.filter((n) => n.status === 'DONE').length;
  return Math.round((done / relevant.length) * 100);
}

@Injectable()
export class RoadmapGraphService {
  constructor(private readonly prisma: PrismaService) {}

  /** F2: catalog of ready-made roadmap templates. */
  catalog() {
    return GRAPH_TEMPLATES.map((t) => ({
      slug: t.slug,
      title: t.title,
      description: t.description,
      difficulty: t.difficulty,
      estimatedWeeks: t.estimatedWeeks,
      tags: t.tags,
      nodeCount: t.nodes.length,
      topicCount: t.nodes.filter((n) => n.type === 'TOPIC').length,
    }));
  }

  /** F2: pick a catalog roadmap → instantiate as the user's active roadmap. */
  async select(
    userId: string,
    dto: { slug: string; level?: string; weeklyHours?: number },
  ) {
    const template = GRAPH_TEMPLATES.find((t) => t.slug === dto.slug);
    if (!template) throw new NotFoundException(`Unknown roadmap "${dto.slug}"`);

    const roadmap = await this.instantiate(userId, template, {
      level: dto.level ?? 'BEGINNER',
      weeklyHours: dto.weeklyHours ?? 10,
    });
    await this.activate(userId, roadmap.id);
    return this.getGraph(userId, roadmap.id);
  }

  /** Multiple roadmaps per user; exactly one ACTIVE at a time. */
  async activate(userId: string, roadmapId: string) {
    await this.owned(userId, roadmapId);
    await this.prisma.$transaction([
      this.prisma.roadmap.updateMany({
        where: { userId, status: 'ACTIVE', NOT: { id: roadmapId } },
        data: { status: 'PAUSED' },
      }),
      this.prisma.roadmap.update({
        where: { id: roadmapId },
        data: { status: 'ACTIVE' },
      }),
    ]);
    return { activated: roadmapId };
  }

  /**
   * Create graph rows for a template. Optionally attaches the graph to an
   * existing roadmap (used by POST /roadmaps/generate to upgrade the legacy
   * stage roadmap with a flowchart, behind the useGraph flag).
   */
  async instantiate(
    userId: string,
    template: RoadmapGraphTemplate,
    opts: { level: string; weeklyHours: number; roadmapId?: string },
  ) {
    const positions = layoutTemplate(template);

    const roadmap = opts.roadmapId
      ? await this.prisma.roadmap.update({
          where: { id: opts.roadmapId },
          data: { useGraph: true, slug: template.slug },
        })
      : await this.prisma.roadmap.create({
          data: {
            userId,
            targetRole: template.title,
            level: opts.level as never,
            weeklyHours: opts.weeklyHours,
            estimatedWeeks: template.estimatedWeeks,
            isAiGenerated: false,
            useGraph: true,
            slug: template.slug,
          },
        });

    // Nodes one-by-one to collect ids for edges (20-ish inserts, acceptable).
    const idByKey = new Map<string, string>();
    let order = 0;
    for (const node of template.nodes) {
      const { x, y } = positions.get(node.key)!;
      const created = await this.prisma.roadmapNode.create({
        data: {
          roadmapId: roadmap.id,
          key: node.key,
          order: order++,
          title: node.title,
          description: node.description,
          group: node.group,
          type: node.type,
          x,
          y,
          resources: {
            create: node.resources.map((r) => ({
              kind: r.kind,
              provider: r.provider,
              url: r.url,
              title: r.title,
              durationMin: r.durationMin,
              lang: r.lang,
            })),
          },
        },
      });
      idByKey.set(node.key, created.id);
    }

    await this.prisma.nodeEdge.createMany({
      data: template.edges
        .filter((e) => idByKey.has(e.from) && idByKey.has(e.to))
        .map((e) => ({
          roadmapId: roadmap.id,
          fromId: idByKey.get(e.from)!,
          toId: idByKey.get(e.to)!,
          kind: e.kind,
        })),
      skipDuplicates: true,
    });

    return roadmap;
  }

  /** Attach a graph to a freshly generated roadmap when a template matches. */
  async attachGraphForRole(userId: string, roadmapId: string, targetRole: string) {
    const template = findGraphTemplate(targetRole);
    if (!template) return false;
    await this.instantiate(userId, template, {
      level: 'BEGINNER',
      weeklyHours: 10,
      roadmapId,
    });
    return true;
  }

  private async owned(userId: string, roadmapId: string) {
    const roadmap = await this.prisma.roadmap.findUnique({ where: { id: roadmapId } });
    if (!roadmap) throw new NotFoundException('Roadmap not found');
    if (roadmap.userId !== userId) throw new ForbiddenException();
    return roadmap;
  }

  async getGraph(userId: string, roadmapId: string) {
    const roadmap = await this.owned(userId, roadmapId);
    const [nodes, edges] = await Promise.all([
      this.prisma.roadmapNode.findMany({
        where: { roadmapId },
        orderBy: { order: 'asc' },
        include: { resources: true },
      }),
      this.prisma.nodeEdge.findMany({ where: { roadmapId } }),
    ]);
    return {
      ...roadmap,
      nodes,
      edges,
      completion: computeGraphCompletion(nodes),
    };
  }

  /** Node status update → ProgressEvent + fresh completion %. */
  async setNodeStatus(
    userId: string,
    roadmapId: string,
    nodeId: string,
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'SKIPPED',
  ) {
    await this.owned(userId, roadmapId);
    const node = await this.prisma.roadmapNode.findUnique({ where: { id: nodeId } });
    if (!node || node.roadmapId !== roadmapId) {
      throw new NotFoundException('Node not found');
    }

    const updated = await this.prisma.roadmapNode.update({
      where: { id: nodeId },
      data: { status },
    });

    if (status === 'DONE' && node.status !== 'DONE') {
      await this.prisma.progressEvent.create({
        data: {
          userId,
          type: 'NODE_DONE',
          refId: nodeId,
          hoursSpent: node.type === 'TOPIC' ? 2 : 1,
        },
      });
    }

    const nodes = await this.prisma.roadmapNode.findMany({
      where: { roadmapId },
      select: { type: true, status: true },
    });
    const completion = computeGraphCompletion(nodes);

    // Milestone: everything done → roadmap COMPLETED (reversible via activate).
    if (completion === 100) {
      await this.prisma.roadmap.update({
        where: { id: roadmapId },
        data: { status: 'COMPLETED' },
      });
    }

    return { node: updated, completion };
  }
}
