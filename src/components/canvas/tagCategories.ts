import type { TagWithCount } from '../../stores/tags';

export const TAG_CATEGORY_COLORS: Record<string, string> = {
  Topics: 'rgb(101, 145, 230)',
  People: 'rgb(218, 112, 154)',
  Locations: 'rgb(80, 174, 140)',
  Organizations: 'rgb(224, 155, 74)',
  Events: 'rgb(147, 110, 222)',
  Untagged: 'rgb(112, 122, 138)',
  Other: 'rgb(100, 160, 180)',
};

/** Resolve a tag ID to the root category shown in Atomic's tag tree. */
export function buildTagCategoryIndex(tags: TagWithCount[]): Map<string, string> {
  const categories = new Map<string, string>();

  const visit = (tag: TagWithCount, root: string) => {
    categories.set(tag.id, root);
    tag.children.forEach(child => visit(child, root));
  };

  tags.forEach(root => visit(root, root.name));
  return categories;
}

export function categoryForAtom(tagIds: string[], index: Map<string, string>): string {
  for (const tagId of tagIds) {
    const category = index.get(tagId);
    if (category) return category;
  }
  return tagIds.length === 0 ? 'Untagged' : 'Other';
}

export function categoryColor(category: string): string {
  return TAG_CATEGORY_COLORS[category] ?? TAG_CATEGORY_COLORS.Other;
}
