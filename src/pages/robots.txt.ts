import type { APIContext } from 'astro';
import { absoluteUrl } from '@/lib/seo';
import { url } from '@/lib/utils';

export function GET(_context: APIContext) {
  const body = [
    'User-agent: *',
    'Allow: /',
    `Disallow: ${url('/search')}`,
    '',
    `Sitemap: ${absoluteUrl('/sitemap-index.xml')}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
