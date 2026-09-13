import { describe, expect, it } from 'vitest';
import { computeClusterIslandLayout } from './clusterIslands';

const atoms = [
  { atom_id: 'a', x: -0.8, y: -0.7, title: 'A', primary_tag: null, tag_count: 0, tag_ids: [] },
  { atom_id: 'b', x: -0.5, y: -0.4, title: 'B', primary_tag: null, tag_count: 0, tag_ids: [] },
  { atom_id: 'c', x: 0.6, y: 0.4, title: 'C', primary_tag: null, tag_count: 0, tag_ids: [] },
  { atom_id: 'd', x: 0.8, y: 0.7, title: 'D', primary_tag: null, tag_count: 0, tag_ids: [] },
  { atom_id: 'lonely', x: 0, y: 0, title: 'Lonely', primary_tag: null, tag_count: 0, tag_ids: [] },
];

const clusters = [
  { id: 'cluster:left', x: -0.6, y: -0.5, label: 'Left', atom_count: 2, atom_ids: ['a', 'b'] },
  { id: 'cluster:right', x: 0.7, y: 0.5, label: 'Right', atom_count: 2, atom_ids: ['c', 'd'] },
];

describe('computeClusterIslandLayout', () => {
  it('includes every atom exactly once, including unclustered atoms', () => {
    const layout = computeClusterIslandLayout(atoms, clusters);
    expect(layout.positions.size).toBe(atoms.length);
    expect(layout.islands.find(island => island.isUnclustered)?.atomIds).toEqual(['lonely']);
  });

  it('keeps islands separated with a readable gutter', () => {
    const layout = computeClusterIslandLayout(atoms, clusters);
    for (let i = 0; i < layout.islands.length; i++) {
      for (let j = i + 1; j < layout.islands.length; j++) {
        const a = layout.islands[i];
        const b = layout.islands[j];
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(a.radius + b.radius);
      }
    }
  });

  it('is deterministic for unchanged graph data', () => {
    const first = computeClusterIslandLayout(atoms, clusters);
    const second = computeClusterIslandLayout(atoms, clusters);
    expect([...first.positions.entries()]).toEqual([...second.positions.entries()]);
    expect(first.islands).toEqual(second.islands);
  });
});
