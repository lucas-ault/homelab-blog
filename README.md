# Lucas Ault — Homelab Blog

Personal site for [Lucas Ault](https://github.com/lucas-ault) — Principal Specialist, AI/Cyber Defense
at RTX. Portfolio, blog, and projects covering enterprise AI, Zero Trust
architecture, SASE/Zscaler engineering, DevSecOps, and homelab experiments.

Built on [Astro 7](https://astro.build) · [Tailwind CSS 4](https://tailwindcss.com) ·
[Expressive Code](https://expressive-code.com) · [Pagefind](https://pagefind.app).

> **Forked from** [astro-dev-theme](https://github.com/milinddethe15/astro-dev-theme)
> by Milind Dethe (MIT). See [/attributions](https://github.com/lucas-ault/homelab-blog/blob/main/src/pages/attributions.astro)
> for full credits.

## Quick start

Requires **Node.js 22.12+**.

```bash
npm install
npm run dev        # http://localhost:4321
```

> **Search in dev:** Pagefind indexes the _built_ site. Run `npm run build` once,
> then `npm run dev` — the dev server serves the index from your last build.

## Writing content

See **[CONTENT.md](CONTENT.md)** for a complete guide — where to put files, what
frontmatter fields are required, and how to use MDX components.

The short version:

```bash
cp src/content/blog/_template.mdx src/content/blog/my-post.mdx      # new post
cp src/content/projects/_template.md src/content/projects/x.md      # new project
```

Each template has a frontmatter reference table at the bottom. Schemas are
defined in `src/content.config.ts` and validated at build time.

## Scripts

| Script            | Purpose                            |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Development server with hot reload |
| `npm run build`   | Production build → `dist/`         |
| `npm run preview` | Preview the production build       |
| `npm run check`   | Type-check (`astro check`)         |
| `npm run lint`    | ESLint                             |
| `npm run format`  | Prettier                           |

## Configuration

| File                    | What it controls                                                     |
| ----------------------- | -------------------------------------------------------------------- |
| `src/config/site.ts`    | Name, URL, author, socials, nav, hero, stats, skills, feature flags  |
| `src/config/resume.ts`  | Experience, education, certifications (About page)                   |
| `src/styles/global.css` | Design tokens (colors, fonts, spacing). Change `--accent` to rebrand |
| `src/content.config.ts` | Zod schemas for blog and projects collections                        |

## Project structure

```text
src/
├── config/              site.ts, resume.ts
├── content/             your content — blog/, projects/
│  ├── blog/_template.mdx       starter file (ignored by Astro)
│  └── projects/_template.md    starter file (ignored by Astro)
├── content.config.ts    collection schemas (Zod)
├── components/          UI, layout, blog, projects, home
├── layouts/             BaseLayout, BlogLayout, ProjectLayout
├── pages/               file-based routes (+ rss.xml.ts, robots.txt.ts)
├── styles/              global.css (tokens), typography.css (prose)
└── lib/                 content.ts, seo.ts, utils.ts
```

You only need to touch `src/content/` (write), `src/config/` (configure), and
`public/` (static assets). Everything else is infrastructure.

## Features

- **Dark-first, clean minimal design** — OKLCH design tokens, light mode included
- **Blog** — Markdown/MDX, tags, pagination, reading time, related posts, RSS
- **Projects** — portfolio grid with client-side technology filter, status badges
- **Docs** — grouped sidebar, table of contents with scroll-spy, prev/next nav
- **Search** — Pagefind static index; `Ctrl/⌘ K` or `/` opens command palette
- **GitHub contribution heatmap** — fetched at build time, zero client JS
- **Code blocks** — Expressive Code: syntax highlighting, copy button, line numbers, diffs
- **SEO** — canonical URLs, Open Graph, Twitter cards, JSON-LD, sitemap, robots.txt
- **RSS** — full-content feed at `/rss.xml`
- **Extra pages** — About (experience, certs, print-friendly + PDF), Uses, Contact, Attributions, 404

## Pre-commit hook

Husky + lint-staged runs on every commit:

- **ESLint** on staged `.ts`/`.tsx`/`.astro` files (with `--fix`)
- **Prettier** on staged `.md`/`.mdx`/`.json`/`.yaml`/`.css`/`.ts`/`.astro` files

This catches broken syntax and formatting before it hits git. No manual setup
needed — `npm install` triggers `husky init` via the `prepare` script.

## Deployment

Fully static — no server, no environment variables:

```bash
npm run build      # deploy the dist/ folder
```

Works on Netlify, Vercel, and Cloudflare Pages (build command `npm run build`,
output directory `dist`). For GitHub Pages, `astro.config.ts` supports `SITE_URL`
and `BASE_PATH` env vars for subpath deploys.

## Tech

[Astro 7](https://astro.build) · [Tailwind CSS 4](https://tailwindcss.com) ·
[Expressive Code](https://expressive-code.com) · [Pagefind](https://pagefind.app) ·
[Fontsource](https://fontsource.org) (Inter + JetBrains Mono, self-hosted)

## License

[MIT](LICENSE) — free for personal and commercial use. Attribution to the
original theme author appreciated.
