'use client';

import { useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import { BookOpen, Check, CircleDot, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GraphNodeData {
  title: string;
  group: string;
  nodeType: 'TOPIC' | 'SUBTOPIC' | 'OPTIONAL';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'SKIPPED';
  resourceCount: number;
  [key: string]: unknown;
}

export interface ApiGraphNode {
  id: string;
  title: string;
  group: string;
  type: 'TOPIC' | 'SUBTOPIC' | 'OPTIONAL';
  status: GraphNodeData['status'];
  x: number;
  y: number;
  resources: unknown[];
}

export interface ApiGraphEdge {
  id: string;
  fromId: string;
  toId: string;
  kind: 'REQUIRED' | 'OPTIONAL';
}

const STATUS_STYLES: Record<GraphNodeData['status'], string> = {
  NOT_STARTED: 'border-border bg-surface',
  IN_PROGRESS: 'border-primary/60 bg-primary/5 shadow-glow',
  DONE: 'border-success/60 bg-success/5',
  SKIPPED: 'border-border bg-surface opacity-50',
};

const STATUS_ICON: Record<GraphNodeData['status'], React.ReactNode> = {
  NOT_STARTED: null,
  IN_PROGRESS: <CircleDot className="h-3.5 w-3.5 text-primary" />,
  DONE: <Check className="h-3.5 w-3.5 text-success" />,
  SKIPPED: <SkipForward className="h-3.5 w-3.5 text-muted" />,
};

function RoadmapNodeCard({ data, selected }: NodeProps) {
  const d = data as GraphNodeData;
  const isTopic = d.nodeType === 'TOPIC';
  return (
    <div
      className={cn(
        'rounded-xl border-2 px-4 py-2.5 transition-all duration-150',
        isTopic ? 'min-w-[190px] max-w-[240px]' : 'min-w-[150px] max-w-[220px]',
        d.nodeType === 'OPTIONAL' && 'border-dashed',
        STATUS_STYLES[d.status],
        selected && 'ring-2 ring-primary/50',
        'cursor-pointer hover:-translate-y-0.5 hover:shadow-soft',
      )}
    >
      <Handle type="target" position={Position.Top} className="!h-1.5 !w-1.5 !border-0 !bg-[rgb(var(--border))]" />
      <Handle type="target" position={Position.Left} id="l" className="!h-1.5 !w-1.5 !border-0 !bg-[rgb(var(--border))]" />
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            'leading-snug',
            isTopic ? 'font-display text-sm font-bold' : 'text-xs font-medium',
            d.status === 'DONE' && 'text-muted line-through decoration-success/50',
          )}
        >
          {d.title}
        </p>
        {STATUS_ICON[d.status]}
      </div>
      {d.resourceCount > 0 && (
        <p className="mt-1 flex items-center gap-1 text-[10px] text-muted">
          <BookOpen className="h-3 w-3" /> {d.resourceCount}
        </p>
      )}
      <Handle type="source" position={Position.Bottom} className="!h-1.5 !w-1.5 !border-0 !bg-[rgb(var(--border))]" />
      <Handle type="source" position={Position.Right} id="r" className="!h-1.5 !w-1.5 !border-0 !bg-[rgb(var(--border))]" />
    </div>
  );
}

const nodeTypes = { roadmapNode: RoadmapNodeCard };

/** roadmap.sh-style interactive flowchart: zoom/pan, minimap, dashed optional edges. */
export function GraphCanvas({
  nodes,
  edges,
  onNodeClick,
  selectedNodeId,
}: {
  nodes: ApiGraphNode[];
  edges: ApiGraphEdge[];
  onNodeClick: (nodeId: string) => void;
  selectedNodeId: string | null;
}) {
  const rfNodes = useMemo<Node[]>(
    () =>
      nodes.map((n) => ({
        id: n.id,
        type: 'roadmapNode',
        position: { x: n.x, y: n.y },
        selected: n.id === selectedNodeId,
        data: {
          title: n.title,
          group: n.group,
          nodeType: n.type,
          status: n.status,
          resourceCount: n.resources?.length ?? 0,
        } satisfies GraphNodeData,
      })),
    [nodes, selectedNodeId],
  );

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const rfEdges = useMemo<Edge[]>(
    () =>
      edges.map((e) => {
        const from = byId.get(e.fromId);
        const to = byId.get(e.toId);
        // side branches connect via left/right handles for a roadmap.sh feel
        const horizontal = from && to && Math.abs(from.x - to.x) > 120;
        const optional = e.kind === 'OPTIONAL';
        const done = from?.status === 'DONE' && to?.status === 'DONE';
        return {
          id: e.id,
          source: e.fromId,
          target: e.toId,
          type: 'smoothstep',
          sourceHandle: horizontal ? 'r' : undefined,
          targetHandle: horizontal ? 'l' : undefined,
          animated: to?.status === 'IN_PROGRESS',
          style: {
            strokeWidth: optional ? 1.5 : 2,
            stroke: done ? 'rgb(var(--success) / 0.6)' : 'rgb(var(--muted) / 0.45)',
            strokeDasharray: optional ? '6 4' : undefined,
          },
        };
      }),
    [edges, byId],
  );

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => onNodeClick(node.id)}
      fitView
      fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
      minZoom={0.2}
      maxZoom={1.75}
      nodesDraggable={false}
      nodesConnectable={false}
      deleteKeyCode={null}
      proOptions={{ hideAttribution: true }}
      className="!bg-transparent"
    >
      <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="rgb(var(--border))" />
      <Controls showInteractive={false} position="bottom-right" />
      <MiniMap
        pannable
        zoomable
        position="bottom-left"
        nodeColor={(n) => {
          const s = (n.data as GraphNodeData).status;
          if (s === 'DONE') return 'rgb(var(--success))';
          if (s === 'IN_PROGRESS') return 'rgb(var(--primary))';
          return 'rgb(var(--border))';
        }}
        maskColor="rgb(var(--bg) / 0.75)"
        style={{ backgroundColor: 'rgb(var(--surface))' }}
      />
    </ReactFlow>
  );
}
