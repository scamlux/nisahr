import type { ApiGraphEdge, ApiGraphNode } from './graph-canvas';

/** A roadmap stage as returned by GET /roadmaps. */
export interface StageLike {
  id: string;
  order?: number;
  title: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | string;
  milestone?: boolean;
  completion?: number;
  skills?: unknown[];
  tasks?: unknown[];
  resources?: unknown[];
}

const COL = 300; // horizontal spacing between stage nodes (roadmap.sh, left-to-right)

/**
 * Turn a roadmap's stages into a horizontal React Flow graph so EVERY roadmap
 * (including GPT-generated, stage-only ones) renders in the single graph engine.
 * Stages lay out left-to-right on one spine; sequential edges connect them.
 */
export function stagesToGraph(stages: StageLike[] = []): {
  nodes: ApiGraphNode[];
  edges: ApiGraphEdge[];
} {
  const ordered = [...stages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const nodes: ApiGraphNode[] = ordered.map((s, i) => ({
    id: s.id,
    title: s.title,
    group: s.milestone ? 'MILESTONE' : `STAGE_${i + 1}`,
    type: 'TOPIC',
    status: (['NOT_STARTED', 'IN_PROGRESS', 'DONE', 'SKIPPED'].includes(s.status)
      ? s.status
      : 'NOT_STARTED') as ApiGraphNode['status'],
    milestone: Boolean(s.milestone),
    x: i * COL,
    y: 0,
    resources: s.resources ?? [],
  }));

  const edges: ApiGraphEdge[] = [];
  for (let i = 1; i < ordered.length; i++) {
    edges.push({
      id: `${ordered[i - 1].id}->${ordered[i].id}`,
      fromId: ordered[i - 1].id,
      toId: ordered[i].id,
      kind: 'REQUIRED',
    });
  }

  return { nodes, edges };
}
