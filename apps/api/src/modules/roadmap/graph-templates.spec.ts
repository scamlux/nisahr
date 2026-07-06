import { GRAPH_TEMPLATES } from './graph-templates';

describe('GRAPH_TEMPLATES', () => {
  it('has exactly 6 templates', () => {
    expect(GRAPH_TEMPLATES).toHaveLength(6);
  });

  it('has unique slugs across templates', () => {
    const slugs = GRAPH_TEMPLATES.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  describe.each(GRAPH_TEMPLATES.map((t) => [t.slug, t] as const))(
    'template: %s',
    (_slug, template) => {
      it('has unique node keys', () => {
        const keys = template.nodes.map((n) => n.key);
        expect(new Set(keys).size).toBe(keys.length);
      });

      it('has every edge endpoint referencing an existing node key', () => {
        const keys = new Set(template.nodes.map((n) => n.key));
        for (const edge of template.edges) {
          expect(keys.has(edge.from)).toBe(true);
          expect(keys.has(edge.to)).toBe(true);
        }
      });

      it('has every non-first node reachable as a `to` of some edge', () => {
        const toKeys = new Set(template.edges.map((e) => e.to));
        const nonFirstNodes = template.nodes.slice(1);
        for (const node of nonFirstNodes) {
          expect(toKeys.has(node.key)).toBe(true);
        }
      });

      it('has at least 3 resources for every TOPIC node', () => {
        const topics = template.nodes.filter((n) => n.type === 'TOPIC');
        expect(topics.length).toBeGreaterThan(0);
        for (const topic of topics) {
          expect(topic.resources.length).toBeGreaterThanOrEqual(3);
        }
      });
    },
  );
});
