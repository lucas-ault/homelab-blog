---
title: 'Introduction'
description: 'What this theme is, what it includes, and how it is organized.'
group: 'Getting Started'
order: 1
---

## What is this theme?

A modern, minimal Astro theme for developers — a portfolio, blog, project showcase, and documentation site in one. It's built static-first: pages ship almost no JavaScript, and the few interactive pieces (theme toggle, search, mobile navigation) are small vanilla-JS islands.

## What's included

- **Blog** with tags, pagination, reading time, related posts, and RSS
- **Projects** portfolio with filtering, statuses, and detail pages
- **Docs** section with sidebar navigation and table of contents (you're reading it)
- **Search** powered by Pagefind — a static index, no server required
- **GitHub contribution graph** rendered at build time, no client JS
- **Dark/light mode** with system preference detection
- **SEO**: Open Graph, Twitter cards, JSON-LD, sitemap, canonical URLs
- **Accessibility**: keyboard navigation, focus states, reduced-motion support

## How it's organized

```text
src/
├── config/        site.ts (all settings) + resume.ts (career data)
├── content/       blog/, projects/, docs/ — markdown & MDX
├── components/    ui/, layout/, blog/, projects/, docs/, home/
├── layouts/       BaseLayout, BlogLayout, ProjectLayout, DocsLayout
├── pages/         file-based routes
├── styles/        global.css (design tokens) + typography.css
└── lib/           content queries, SEO helpers, utilities
```

The guiding rule: **content lives in `src/content/`, settings live in `src/config/site.ts`**, and you should rarely need to touch anything else.

## Next steps

Continue to [Installation](/docs/installation) to get the theme running locally, then read [Configuration](/docs/configuration) to make it yours.
