---
title: 'Writing content'
description: 'How to add blog posts, projects, and docs pages with typed frontmatter.'
group: 'Content'
order: 20
---

## Blog posts

Add a `.md` or `.mdx` file to `src/content/blog/`. The filename becomes the URL slug.

```markdown title="src/content/blog/my-post.md"
---
title: 'My new post'
description: 'One or two sentences used in cards, SEO, and the RSS feed.'
publishedAt: 2026-08-01
tags: ['TypeScript', 'Web']
category: 'Engineering'
featured: false
draft: false
---

Your content here.
```

Schema notes:

- `publishedAt` is required; `updatedAt` is optional and shown when present
- `featured: true` surfaces the post on the homepage
- `draft: true` hides the post from production builds but keeps it visible in dev
- `image` (optional) is used for the cover, cards, and Open Graph
- Reading time is computed automatically — nothing to declare

## Projects

Add a file to `src/content/projects/`:

```markdown title="src/content/projects/my-tool.md"
---
title: 'My Tool'
description: 'What it is, in one sentence.'
technologies: ['TypeScript', 'Node.js']
github: 'https://github.com/you/my-tool'
demo: 'https://my-tool.example.com'
status: 'active' # active | maintained | archived | in-progress
year: 2026
featured: true
---

## Overview
...
```

The body supports the same markdown features as blog posts. A common structure: Overview → Technology stack → Challenges → Results.

The `image` field accepts any format the browser can render — PNG, JPG, SVG, WebP, or an **animated GIF** for a live demo (place the file in `public/images/projects/`). The sample BlazeKit project ships with an animated terminal GIF to copy from. Keep GIFs 16:9 (e.g. 800×450) so they fit the card crop, and under ~2MB so they don't drag down page weight.

## Docs pages

Add files to `src/content/docs/`. Sidebar structure comes from frontmatter, not folders:

```yaml
---
title: 'My guide'
group: 'Guides' # sidebar section heading
order: 30 # position (sorted ascending, globally)
---
```

Subfolders are fine and become part of the URL (`docs/customization/theming.md` → `/docs/customization/theming`).

## MDX

Use the `.mdx` extension when you need components. `Callout` and `Tabs` are pre-wired in all three collections — no imports needed:

```mdx
<Callout type="warning">Careful with this one.</Callout>
```

## Drafts

Every collection supports `draft: true`. Drafts build locally (so you can preview them) and are excluded from production builds, the sitemap, search, and RSS.
