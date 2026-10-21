# AGENTS.md

Guidance for AI agents working in this repository.

## What this is

Personal site for Lucas Ault (Principal Specialist, AI/Cyber Defense at RTX). Static site built with
Astro 7, Tailwind CSS 4, and Pagefind search. Forked from
[astro-dev-theme](https://github.com/milinddethe15/astro-dev-theme) (MIT, by Milind Dethe).

Production URL: `https://lucas.ault.cc`
Repo: `https://github.com/lucas-ault/homelab-blog`

## Commands

```bash
npm run dev       # dev server at http://localhost:4321 (hot reload)
npm run build     # production build → dist/
npm run preview   # preview the built site
npm run check     # type-check (also validates content frontmatter via Zod)
npm run lint      # eslint
npm run format    # prettier
```

Always run `npm run check` after changing config files or content schemas.

A pre-commit hook (husky + lint-staged) runs ESLint and Prettier on staged files
automatically. You don't need to run lint/format manually before committing, but
you should run `npm run check` if you've changed TypeScript types or content schemas.

## Key files

| File                    | Purpose                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| `src/config/site.ts`    | All site settings: name, nav, hero, stats, skills, feature flags    |
| `src/config/resume.ts`  | Career data: experience, education, certifications                  |
| `src/content.config.ts` | Zod schemas for blog and projects collections                       |
| `src/styles/global.css` | OKLCH design tokens (change `--accent` to rebrand)                  |
| `astro.config.ts`       | Integrations, markdown plugins, base path, prefetch                 |
| `CONTENT.md`            | Content authoring guide (where to put files, frontmatter reference) |
| `AGENTS.md`             | Guide for AI agents working in this repo                            |
| `public/llms.txt`       | Machine-readable site summary served at `/llms.txt`                 |

## Content

Two collections in `src/content/`, all Markdown/MDX with Zod-validated frontmatter:

| Collection | Directory               | Template        |
| ---------- | ----------------------- | --------------- |
| Blog       | `src/content/blog/`     | `_template.mdx` |
| Projects   | `src/content/projects/` | `_template.md`  |

**To add content:** copy the template, rename, edit frontmatter and body.
Underscore-prefixed files are ignored by Astro's content loader.

### Blog frontmatter

```yaml
title: string # required
description: string # required
publishedAt: date # required, YYYY-MM-DD
tags: [string] # optional, default []
category: string # optional
image: string # optional, path in /public
featured: boolean # optional, default false
draft: boolean # optional, default false (hidden in prod, visible in dev)
```

### Projects frontmatter

```yaml
title: string # required
description: string # required
technologies: [string] # optional, default []
github: url # optional
demo: url # optional
type: enum # optional: Open Source | SaaS | Client Work | Personal | Experiment
status: enum # optional: active | maintained | archived | in-progress
year: number # required
featured: boolean # optional, default false
draft: boolean # optional, default false
```

## MDX components

Available without imports in `.mdx` files:

- `<Callout type="tip|note|warning|danger" title="...">...</Callout>`
- `<Tabs tabs={['a', 'b']}>...</Tabs>`

## Routes

File-based routing from `src/pages/`. Dynamic routes:

| Route                   | Source                            |
| ----------------------- | --------------------------------- |
| `/blog/[...page]`       | Paginated blog index              |
| `/blog/[slug]`          | Individual post                   |
| `/projects/[slug]`      | Individual project                |
| `/tags/[tag]/[...page]` | Tag-filtered, paginated blog list |

Static pages: `/`, `/about`, `/projects`, `/uses`, `/contact`, `/attributions`, `/search`, `/tags`, `/404`.

Generated files: `/rss.xml`, `/robots.txt`, `/sitemap-index.xml`.

## Gotchas

- **Pagefind search only works after a build.** In dev, the search index comes from the last `npm run build`. If search is broken in dev, run a build first.
- **`trailingSlash: 'never'`** is set in `astro.config.ts`. Internal links should not have trailing slashes.
- **Base path support:** `SITE_URL` and `BASE_PATH` env vars override `site.ts` for subpath deploys (e.g., GitHub Pages). The `url()` helper in `src/lib/utils.ts` prefixes internal paths with the base. Use it in components: `href={url('/blog')}`.
- **Drafts are visible in dev, hidden in production builds.** The filter is in `src/lib/content.ts` — it checks `import.meta.env.PROD`.
- **`prefetch: { prefetchAll: true, defaultStrategy: 'viewport' }`** — all links are prefetched when they enter the viewport. This is intentional.
- **Expressive Code is configured with `useDarkModeMediaQuery: false`** and a custom `themeCssSelector`. Dark theme applies when `.dark` class is on `<html>`, light theme when it's absent. The theme toggle in `ThemeToggle.astro` manages this.
- **Fonts are self-hosted** via Fontsource (Inter + JetBrains Mono). No Google Fonts requests. Don't add external font links.

## Conventions

- Use `@/*` path alias for imports (`@/config/site`, `@/lib/utils`, etc.)
- TypeScript strict mode is on — no `any` without justification
- Design tokens are OKLCH values in `src/styles/global.css` — use CSS variables (`var(--accent)`, `var(--border)`, etc.) rather than hardcoded colors
- Tailwind classes reference theme tokens via `text-accent`, `bg-muted`, `border-border`, etc.
- Static assets go in `public/`, referenced with root-relative paths (`/images/avatar.jpeg`)
- The footer links to `/attributions` — keep it updated when adding new dependencies

## What NOT to change unless asked

- `src/components/` — UI components are stable; customize via config and tokens instead
- `src/layouts/` — layouts are config-driven; change behavior via `site.ts` feature flags
- `src/lib/` — content queries and SEO helpers are stable
- `astro.config.ts` — unless adding/removing an integration
