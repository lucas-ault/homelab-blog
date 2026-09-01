---
title: 'Installation'
description: 'Clone, install, and run the theme locally in under two minutes.'
group: 'Getting Started'
order: 2
---

## Requirements

- **Node.js** 22.12 or newer (required by Astro 7)
- **npm** (or pnpm/yarn/bun — the theme has no package-manager-specific behavior)

## Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/astro-dev-theme my-site
cd my-site
npm install
```

Start the dev server:

```bash
npm run dev
```

The site is now running at `http://localhost:4321` with hot reload.

## Available scripts

| Script | What it does |
| ------------------ | ---------------------------------------------- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the production site into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run check` | Type-check the project with `astro check` |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |

## A note on search in development

Search is powered by [Pagefind](https://pagefind.app), which indexes the **built** site. In dev mode the index from your last `npm run build` is served, so run a build once before testing search locally:

```bash
npm run build && npm run dev
```

## Deploying

The build output in `dist/` is fully static — deploy it to any static host:

```bash
npm run build
```

Netlify, Vercel, and Cloudflare Pages work with zero configuration beyond setting the build command to `npm run build` and the output directory to `dist`. No server or environment variables are required.

### GitHub Pages

The theme ships with a ready workflow at `.github/workflows/deploy.yml`. To use it:

1. In your repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Push to `main`.

The workflow deploys to `https://<username>.github.io/<repo-name>/` automatically — it detects the repository name and passes it as the base path, so every link, image, and the search index work under the subpath with no configuration. User/organization sites (a repo named `<username>.github.io`) and custom domains are also handled; see the comments in the workflow file.
