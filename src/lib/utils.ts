/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/**
 * Prefix an internal absolute path with the configured `base`.
 * With the default base ('/') this is a no-op; on subpath deployments
 * (e.g. GitHub Pages project sites) it becomes '/repo-name/path'.
 */
export function url(path: string): string {
  return `${BASE}${path}`;
}

/** URL-safe slug from arbitrary text (used for tags). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

/** "May 12, 2025" */
export function formatDate(date: Date, locale = 'en-US'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** ISO date string (for <time datetime>) */
export function isoDate(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

/** Estimated reading time in whole minutes from raw markdown. */
export function readingTimeMinutes(body: string | undefined): number {
  if (!body) return 1;
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 215));
}
