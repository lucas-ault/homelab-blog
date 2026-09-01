# Astro Developer Theme

A modern, minimal Astro theme for developers — portfolio, blog, projects, and docs in one.
Dark-first design, ~5KB of JavaScript per page, Lighthouse-100 friendly.

![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

![Theme preview](.github/screenshots/preview.png)

<details>
<summary><strong>More screenshots</strong> — blog article, docs, projects, light mode</summary>

| Blog article | Docs |
| :---: | :---: |
| ![Blog article with code blocks and TOC](.github/screenshots/blog-post.png) | ![Docs with sidebar and TOC](.github/screenshots/docs.png) |

| Projects | Light mode |
| :---: | :---: |
| ![Projects grid with filter](.github/screenshots/projects.png) | ![Homepage in light mode](.github/screenshots/home-light.png) |

</details>

## Features

- **Dark-first, clean minimal design** — OKLCH design tokens, light mode included, system-preference aware with no flash
- **Blog** — Markdown/MDX, tags, pagination, reading time, related posts, prev/next, share buttons
- **Projects** — portfolio grid with client-side technology filter, status badges, detail pages
- **Docs** — grouped sidebar, table of contents with scroll-spy, prev/next navigation
- **Search** — [Pagefind](https://pagefind.app) static index; `Ctrl/⌘ K` or `/` opens a command-palette dialog
- **GitHub contribution heatmap** — fetched at build time, zero client JS, graceful offline fallback
- **Code blocks** — [Expressive Code](https://expressive-code.com): syntax highlighting, copy button, file names, line numbers, line highlighting, diffs
- **SEO** — canonical URLs, Open Graph, Twitter cards, JSON-LD (WebSite/Person/Article/Breadcrumb), sitemap, robots.txt
- **RSS** — full-content feed at `/rss.xml`
- **Extra pages** — About (experience timeline), Resume (print-friendly + PDF button), Uses, Contact, terminal-style 404
- **Accessible** — semantic HTML, keyboard navigation, visible focus states, reduced-motion support, WCAG-AA contrast
- **Config-driven** — one `site.ts` for every setting, feature flags to switch whole sections off

## Quick start

Requires **Node.js 22.12+**.

```bash
npm install
npm run dev        # http://localhost:4321
```

> **Search in dev:** Pagefind indexes the *built* site. Run `npm run build` once, then `npm run dev` — the dev server serves the index from your last build.

## Scripts

| Script | Purpose |
| ----------------- | -------------------------------------- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build |
| `npm run check` | Type-check (`astro check`) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Make it yours

1. **`src/config/site.ts`** — name, URL, author, socials, navigation, hero, stats, skills, feature flags. Set `url` to your production domain.
2. **`src/config/resume.ts`** — experience, education, certifications (drives About + Resume pages).
3. **`src/styles/global.css`** — design tokens. Swap the `--accent` hue to rebrand the whole site (see `/docs/customization/theming`).
4. **`src/content/`** — your posts (`blog/`), projects (`projects/`), and docs (`docs/`). Schemas live in `src/content.config.ts`.
5. **`public/`** — replace `favicon.svg`, `og.png`, `images/avatar.svg`, and project screenshots.

Full documentation ships inside the theme at [`/docs`](http://localhost:4321/docs).

## Project structure

```text
src/
├── config/          site.ts (all settings), resume.ts (career data)
├── content/         blog/, projects/, docs/ — md & mdx
├── content.config.ts
├── components/
│   ├── ui/          Button, Badge, Callout, Tabs, Icon, Pagination, ...
│   ├── layout/      Header, Footer, MobileNav, ThemeToggle, SearchDialog
│   ├── blog/        ArticleCard, TagBadge, TableOfContents, ShareButtons
│   ├── projects/    ProjectCard
│   ├── docs/        DocsSidebar
│   └── home/        ContributionGraph
├── layouts/         BaseLayout, BlogLayout, ProjectLayout, DocsLayout
├── pages/           file-based routes (+ rss.xml.ts, robots.txt.ts)
├── styles/          global.css (tokens), typography.css (prose)
└── lib/             content.ts, seo.ts, utils.ts
```

## Deployment

The build is fully static — no server, no environment variables:

```bash
npm run build      # deploy the dist/ folder
```

Works out of the box on Netlify, Vercel, and Cloudflare Pages (build command
`npm run build`, output directory `dist`).

**GitHub Pages:** a ready workflow is included. Set **Settings → Pages →
Source** to **GitHub Actions**, push to `main`, and the site deploys to
`https://<username>.github.io/<repo-name>/`. The workflow auto-detects the
repo name and passes it as the base path (`BASE_PATH`/`SITE_URL` env vars), so
all links, images, markdown content, and search work under the subpath —
user sites (`<username>.github.io` repos) and custom domains included.

## Tech

[Astro 7](https://astro.build) · [Tailwind CSS 4](https://tailwindcss.com) · [Expressive Code](https://expressive-code.com) · [Pagefind](https://pagefind.app) · [Fontsource](https://fontsource.org) (Inter + JetBrains Mono, self-hosted)

## License

[MIT](LICENSE) — free for personal and commercial use. Attribution appreciated but not required.
