import { describe, expect, it } from 'vitest';
import type { TagWithCount } from '../../stores/tags';
import { buildTagCategoryIndex, categoryForAtom } from './tagCategories';

const tags: TagWithCount[] = [
  {
    id: 'topics', name: 'Topics', parent_id: null, created_at: '', is_autotag_target: true,
    autotag_description: '', atom_count: 0, children_total: 1,
    children: [{
      id: 'ai', name: 'AI', parent_id: 'topics', created_at: '', is_autotag_target: false,
      autotag_description: '', atom_count: 3, children_total: 1,
      children: [{
        id: 'agents', name: 'Agents', parent_id: 'ai', created_at: '', is_autotag_target: false,
        autotag_description: '', atom_count: 2, children_total: 0, children: [],
      }],
    }],
  },
  {
    id: 'people', name: 'People', parent_id: null, created_at: '', is_autotag_target: true,
    autotag_description: '', atom_count: 0, children_total: 0, children: [],
  },
];

describe('tag category encoding', () => {
  it('resolves descendants to their top-level category', () => {
    const categories = buildTagCategoryIndex(tags);
    expect(categories.get('topics')).toBe('Topics');
    expect(categories.get('ai')).toBe('Topics');
    expect(categories.get('agents')).toBe('Topics');
  });

  it('uses a stable fallback for custom and untagged atoms', () => {
    const categories = buildTagCategoryIndex(tags);
    expect(categoryForAtom(['people'], categories)).toBe('People');
    expect(categoryForAtom(['missing'], categories)).toBe('Other');
    expect(categoryForAtom([], categories)).toBe('Untagged');
  });
});
