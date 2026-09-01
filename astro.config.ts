import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import pagefind from 'astro-pagefind';
import tailwindcss from '@tailwindcss/vite';
import { siteConfig } from './src/config/site';

// SITE_URL / BASE_PATH allow CI (e.g. the GitHub Pages workflow) to override
// the deploy target without editing source. Locally they fall back to site.ts.
const site = process.env.SITE_URL ?? siteConfig.url;
const base = process.env.BASE_PATH ?? '/';
const normalizedBase = base.replace(/\/$/, '');

export default defineConfig({
  site,
  base,
  // Components handle the base prefix via the url() helper; markdown content
  // can't, so on subpath deploys a Sätteri plugin rewrites root-relative
  // links and images in rendered markdown. At base '/', the default pipeline
  // is used untouched.
  ...(normalizedBase
    ? {
        markdown: {
          processor: satteri({
            hastPlugins: [
              {
                name: 'prefix-internal-links-with-base',
                element: {
                  filter: ['a', 'img'],
                  visit(node, ctx) {
                    for (const key of ['href', 'src'] as const) {
                      const value = node.properties?.[key];
                      if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
                        ctx.setProperty(node, key, `${normalizedBase}${value}`);
                      }
                    }
                  },
                },
              },
            ],
          }),
        },
      }
    : {}),
  trailingSlash: 'never',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  integrations: [
    expressiveCode({
      themes: ['github-dark', 'github-light'],
      plugins: [pluginLineNumbers()],
      defaultProps: {
        showLineNumbers: false,
      },
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => (theme.type === 'dark' ? '.dark' : ':root:not(.dark)'),
      styleOverrides: {
        borderRadius: '0.625rem',
        borderColor: 'var(--border)',
        codeFontFamily: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, monospace",
        uiFontFamily: "'Inter Variable', ui-sans-serif, system-ui, sans-serif",
        codeFontSize: '0.8125rem',
        codeLineHeight: '1.7',
        codeBackground: 'var(--code-bg)',
        frames: {
          shadowColor: 'transparent',
          editorActiveTabIndicatorTopColor: 'var(--primary)',
          editorTabBarBackground: 'var(--muted)',
          editorActiveTabBackground: 'var(--code-bg)',
          terminalTitlebarBackground: 'var(--muted)',
          terminalBackground: 'var(--code-bg)',
        },
      },
    }),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/search') && !page.includes('/404'),
    }),
    pagefind(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
