---
title: 'Colors & fonts'
description: 'Change the entire look of the site by editing design tokens in one CSS file.'
group: 'Customization'
order: 10
---

## Design tokens

All colors are CSS custom properties defined in `src/styles/global.css`, in OKLCH color space. Light mode tokens live on `:root`, dark mode tokens on `.dark`:

```css title="src/styles/global.css"
:root {
  --background: oklch(0.99 0.002 286);
  --foreground: oklch(0.21 0.006 286);
  --accent: oklch(0.54 0.22 293); /* ← the violet */
  /* ... */
}

.dark {
  --background: oklch(0.148 0.004 286);
  --accent: oklch(0.71 0.17 293.5);
  /* ... */
}
```

Every component references these tokens through Tailwind utilities (`bg-background`, `text-accent`, `border-border`), so changing a token restyles the whole site consistently — including the contribution heatmap, code blocks, and focus rings.

## Changing the accent color

Swap the hue value (the third number) on both `--accent` definitions and `--ring`:

| Accent | Light mode | Dark mode |
| ------- | ----------------------- | ------------------------ |
| Violet | `oklch(0.54 0.22 293)` | `oklch(0.71 0.17 293.5)` |
| Blue | `oklch(0.55 0.2 258)` | `oklch(0.72 0.15 258)` |
| Emerald | `oklch(0.55 0.15 160)` | `oklch(0.74 0.14 160)` |
| Amber | `oklch(0.62 0.16 65)` | `oklch(0.78 0.14 70)` |

Keep lightness (first number) close to the values above to preserve WCAG contrast.

## Fonts

The theme self-hosts [Inter Variable](https://fontsource.org/fonts/inter) and [JetBrains Mono Variable](https://fontsource.org/fonts/jetbrains-mono) via Fontsource. To change fonts:

1. Install the replacement: `npm install @fontsource-variable/geist-sans`
2. Update the imports at the top of `global.css`
3. Update the `--font-sans` / `--font-mono` values in the `@theme` block

```css
@import '@fontsource-variable/geist-sans';

@theme inline {
  --font-sans: 'Geist Sans Variable', ui-sans-serif, system-ui, sans-serif;
}
```

## Dark mode behavior

The default is **system preference**, with a manual toggle that persists to `localStorage`. The inline script in `BaseLayout.astro` applies the class before first paint, so there is no flash of the wrong theme.

## Code block themes

Code blocks use [Expressive Code](https://expressive-code.com) with `github-dark` and `github-light`, switched automatically with the site theme. Change themes in `astro.config.ts` under the `expressiveCode()` integration options.
