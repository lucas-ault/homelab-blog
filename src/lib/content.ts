import { getCollection, type CollectionEntry } from 'astro:content';
import { slugify } from './utils';

export type Post = CollectionEntry<'blog'>;
export type Project = CollectionEntry<'projects'>;
export type Doc = CollectionEntry<'docs'>;

const isProd = import.meta.env.PROD;

/** All published posts, newest first. Drafts are excluded in production builds. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => (isProd ? !data.draft : true));
  return posts.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

export async function getFeaturedPosts(limit = 3): Promise<Post[]> {
  const posts = await getPosts();
  const featured = posts.filter((p) => p.data.featured);
  return (featured.length > 0 ? featured : posts).slice(0, limit);
}

/** All published projects: featured first, then by year descending. */
export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection('projects', ({ data }) => (isProd ? !data.draft : true));
  return projects.sort((a, b) => {
    if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1;
    return b.data.year - a.data.year;
  });
}

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  const projects = await getProjects();
  const featured = projects.filter((p) => p.data.featured);
  return (featured.length > 0 ? featured : projects).slice(0, limit);
}

export async function getDocs(): Promise<Doc[]> {
  const docs = await getCollection('docs', ({ data }) => (isProd ? !data.draft : true));
  return docs.sort((a, b) => a.data.order - b.data.order);
}

/** Docs grouped for the sidebar, preserving order within groups. */
export async function getDocsGroups(): Promise<Array<{ group: string; items: Doc[] }>> {
  const docs = await getDocs();
  const groups = new Map<string, Doc[]>();
  for (const doc of docs) {
    const list = groups.get(doc.data.group) ?? [];
    list.push(doc);
    groups.set(doc.data.group, list);
  }
  return [...groups.entries()].map(([group, items]) => ({ group, items }));
}

export interface TagInfo {
  tag: string;
  slug: string;
  count: number;
}

/** Unique tags across all posts with usage counts, most used first. */
export async function getAllTags(): Promise<TagInfo[]> {
  const posts = await getPosts();
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, slug: slugify(tag), count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function getPostsByTag(tagSlug: string): Promise<Post[]> {
  const posts = await getPosts();
  return posts.filter((p) => p.data.tags.some((t) => slugify(t) === tagSlug));
}

/** Previous (older) and next (newer) posts relative to the given post. */
export async function getAdjacentPosts(
  post: Post,
): Promise<{ prev: Post | null; next: Post | null }> {
  const posts = await getPosts();
  const index = posts.findIndex((p) => p.id === post.id);
  return {
    next: index > 0 ? (posts[index - 1] ?? null) : null,
    prev: index >= 0 && index < posts.length - 1 ? (posts[index + 1] ?? null) : null,
  };
}

/** Related posts ranked by number of shared tags. */
export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const posts = await getPosts();
  const tags = new Set(post.data.tags);
  return posts
    .filter((p) => p.id !== post.id)
    .map((p) => ({ post: p, score: p.data.tags.filter((t) => tags.has(t)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post: p }) => p);
}
