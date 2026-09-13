import type { CanvasAtomPosition, CanvasClusterLabel } from '../../lib/api';

export interface Island {
  id: string;
  label: string;
  atomIds: string[];
  x: number;
  y: number;
  radius: number;
  index: number;
  isUnclustered: boolean;
}

export interface ClusterIslandLayout {
  positions: Map<string, { x: number; y: number }>;
  islands: Island[];
}

const ISLAND_GUTTER = 96;
const MIN_RADIUS = 130;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Turn PCA coordinates into deliberately separated semantic islands.
 *
 * PCA still supplies each island's internal shape, but a deterministic spiral
 * packer gives every community enough breathing room to be read independently.
 * This is intentionally pure so it can be tested without a WebGL renderer.
 */
export function computeClusterIslandLayout(
  atoms: CanvasAtomPosition[],
  clusters: CanvasClusterLabel[],
  scale = 500,
): ClusterIslandLayout {
  const atomById = new Map(atoms.map(atom => [atom.atom_id, atom]));
  const assigned = new Set<string>();
  const groups: Array<{ id: string; label: string; atomIds: string[]; isUnclustered: boolean }> = [];

  for (const cluster of clusters) {
    const atomIds = cluster.atom_ids.filter(id => atomById.has(id));
    if (atomIds.length === 0) continue;
    atomIds.forEach(id => assigned.add(id));
    groups.push({ id: cluster.id, label: cluster.label, atomIds, isUnclustered: false });
  }

  const unclustered = atoms
    .map(atom => atom.atom_id)
    .filter(id => !assigned.has(id));
  if (unclustered.length > 0) {
    groups.push({
      id: 'cluster:unclustered',
      label: 'Unclustered',
      atomIds: unclustered,
      isUnclustered: true,
    });
  }

  // Largest groups earn the clearest positions. The tie-breaker keeps a
  // visually stable order when cache invalidation rebuilds cluster arrays.
  groups.sort((a, b) =>
    b.atomIds.length - a.atomIds.length || a.id.localeCompare(b.id),
  );

  const islands: Island[] = [];
  const positions = new Map<string, { x: number; y: number }>();

  for (const [index, group] of groups.entries()) {
    const radius = Math.max(MIN_RADIUS, Math.sqrt(group.atomIds.length) * 42 + 56);
    const center = findOpenPosition(radius, islands);
    const island: Island = { ...group, ...center, radius, index };
    islands.push(island);

    const members = group.atomIds
      .map(id => atomById.get(id))
      .filter((atom): atom is CanvasAtomPosition => Boolean(atom));
    const centroid = members.reduce(
      (acc, atom) => ({ x: acc.x + atom.x, y: acc.y + atom.y }),
      { x: 0, y: 0 },
    );
    centroid.x /= Math.max(1, members.length);
    centroid.y /= Math.max(1, members.length);

    const extent = members.reduce((max, atom) => {
      const dx = atom.x - centroid.x;
      const dy = atom.y - centroid.y;
      return Math.max(max, Math.hypot(dx, dy));
    }, 0);
    // Singleton or identical PCA vectors still need an intentional placement.
    const localScale = extent > 0.0001 ? (radius * 0.68) / extent : 0;

    members.forEach((atom, memberIndex) => {
      let localX = (atom.x - centroid.x) * localScale;
      let localY = (atom.y - centroid.y) * localScale;
      if (localScale === 0 && members.length > 1) {
        const angle = memberIndex * GOLDEN_ANGLE;
        const distance = Math.sqrt(memberIndex + 1) * 13;
        localX = Math.cos(angle) * distance;
        localY = Math.sin(angle) * distance;
      }
      positions.set(atom.atom_id, {
        x: center.x + localX * (scale / 500),
        y: center.y + localY * (scale / 500),
      });
    });
  }

  return { positions, islands };
}

function findOpenPosition(radius: number, placed: Island[]): { x: number; y: number } {
  if (placed.length === 0) return { x: 0, y: 0 };

  for (let step = 1; step < 4000; step++) {
    const angle = step * GOLDEN_ANGLE;
    const distance = 85 * Math.sqrt(step);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const fits = placed.every(island =>
      Math.hypot(x - island.x, y - island.y) >= radius + island.radius + ISLAND_GUTTER,
    );
    if (fits) return { x, y };
  }

  // The deterministic fallback is intentionally far away rather than allowing
  // a rare dense graph to collapse back into the visual tangle this layout fixes.
  const fallback = placed.length * (radius * 3 + ISLAND_GUTTER);
  return { x: fallback, y: fallback * 0.25 };
}
