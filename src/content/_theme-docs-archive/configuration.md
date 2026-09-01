---
title: 'Configuration'
description: 'Every site-level setting lives in one file: src/config/site.ts.'
group: 'Getting Started'
order: 3
---

## The config file

Everything configurable lives in `src/config/site.ts`. Change values there — no component edits required.

```ts title="src/config/site.ts"
export const siteConfig: SiteConfig = {
  name: 'Alex Carter',
  title: 'Alex Carter — Full-stack Developer',
  description: 'Full-stack developer building fast, scalable web applications.',
  url: 'https://example.com',
  // ...
};
```

> **Important:** set `url` to your production domain before deploying — it drives canonical URLs, the sitemap, Open Graph tags, and the RSS feed.

## Key sections

### Author & socials

`author` controls the hero, about page, and structured data. `social` entries are optional — set any of them to `undefined` (or remove them) and the corresponding icons disappear everywhere automatically.

### Navigation

```ts
navigation: [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Projects', href: '/projects' },
],
```

The header and footer both read from this list.

### GitHub contribution graph

```ts
github: {
  username: 'your-github-username',
},
```

The heatmap on the homepage fetches this user's public contribution calendar **at build time** — no token, no client-side JavaScript. If the fetch fails (offline builds, rate limits) the theme renders deterministic sample data instead of breaking, and labels it as such.

### Feature flags

Turn whole sections on or off:

```ts
features: {
  blog: true,
  projects: true,
  docs: true,
  search: true,
  githubActivity: true,
  newsletter: false,
  comments: false,
},
```

Disabled features disappear from the homepage; remove their entries from `navigation` to hide them from the header too.

### Stats

Homepage stats are plain config values — no third-party API calls:

```ts
stats: [
  { label: 'GitHub stars', value: '4.2k' },
  { label: 'Years of experience', value: '8' },
],
```

## Career data

Experience, education, and certifications for the About and Resume pages live in `src/config/resume.ts`, typed and in one place.
