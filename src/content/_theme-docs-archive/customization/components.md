---
title: 'Component reference'
description: 'The reusable building blocks: buttons, badges, callouts, tabs, cards, and more.'
group: 'Customization'
order: 11
---

## UI primitives (`src/components/ui/`)

### Button

```astro
<Button href="/projects">View projects</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button href="https://github.com" external>GitHub</Button>
```

Variants: `primary`, `secondary`, `ghost`, `accent`. Renders an `<a>` when `href` is set, a `<button>` otherwise. `external` adds `target="_blank"` with the right `rel`.

### Badge

```astro
<Badge variant="success" dot>Available for work</Badge>
```

Variants: `default`, `outline`, `accent`, `success`. The `dot` on `success` pulses gently (and respects reduced-motion preferences).

### Callout — for Markdown/MDX

```mdx
<Callout type="tip" title="Pro tip">
  Content with **markdown** support.
</Callout>
```

Types: `note`, `tip`, `warning`, `danger`. Available in all MDX content without imports.

### Tabs — for Markdown/MDX

```mdx
<Tabs tabs={['npm', 'pnpm']}>
  <div>npm install astro</div>
  <div>pnpm add astro</div>
</Tabs>
```

Fully keyboard-accessible (arrow keys switch tabs). Children map to labels by order.

### Icon

```astro
<Icon name="github" size={16} />
```

An inline SVG set — no icon font, no runtime. Add icons by extending the map in `Icon.astro`.

## Code blocks

Fenced code blocks support titles, line highlighting, diffs, and line numbers through [Expressive Code](https://expressive-code.com):

````text
```ts title="src/lib/example.ts" {2} ins={4} del={3} showLineNumbers
const config = loadConfig();
const highlighted = 'this line is highlighted';
const removed = 'this line shows as deleted';
const added = 'this line shows as inserted';
```
````

Every block gets a copy button and language label automatically.

## Layout components

`Header`, `Footer`, `MobileNav`, `ThemeToggle`, `SearchDialog`, and `SocialLinks` live in `src/components/layout/`. They all read from `siteConfig` — you should rarely need to edit them directly.

## Content components

- `ArticleCard` — blog list item (`row` and `compact` variants)
- `ProjectCard` — project grid card with status badge and quick links
- `TagBadge` — linked `#tag` chip
- `TableOfContents` — sidebar (scroll-spy) and mobile (collapsible) variants
- `ContributionGraph` — the build-time GitHub heatmap
- `Pagination`, `Breadcrumbs`, `ShareButtons`, `AuthorCard`, `CopyButton`
