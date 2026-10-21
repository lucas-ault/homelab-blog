# Writing Content

This is a quick reference for adding blog posts and projects to the site.
For full theme documentation, see the [upstream repo](https://github.com/milinddethe15/astro-dev-theme).

## Where things go

```
src/content/
├── blog/       ← blog posts (.md or .mdx)
├── projects/   ← project entries (.md or .mdx)
├── blog/_template.mdx       ← copy this to start a new post
└── projects/_template.md    ← copy this to start a new project
```

Underscore-prefixed files (`_template.*`) are ignored by Astro's content loader —
they won't appear on the site.

## Quick start

```bash
# New blog post
cp src/content/blog/_template.mdx src/content/blog/my-post.mdx

# New project
cp src/content/projects/_template.md src/content/projects/my-project.md
```

Then edit the frontmatter and write the body. The dev server hot-reloads on save.

## Frontmatter

Every template file has a frontmatter reference table at the bottom. The schemas
are defined in `src/content.config.ts` and validated at build time — if a required
field is missing or a value has the wrong type, `astro check` and `astro build`
will tell you.

Key fields by collection:

### Blog

| Field         | Required | Type     | Notes                            |
| ------------- | -------- | -------- | -------------------------------- |
| `title`       | yes      | string   |                                  |
| `description` | yes      | string   | SEO, RSS, article cards          |
| `publishedAt` | yes      | date     | `YYYY-MM-DD`, sorts newest first |
| `tags`        | no       | string[] | Tag pages + related posts        |
| `featured`    | no       | boolean  | Shows first (default: false)     |
| `draft`       | no       | boolean  | Hidden in prod, visible in dev   |

### Projects

| Field          | Required | Type     | Notes                                                |
| -------------- | -------- | -------- | ---------------------------------------------------- |
| `title`        | yes      | string   |                                                      |
| `description`  | yes      | string   | Project card + detail page                           |
| `technologies` | no       | string[] | Chips + filter on /projects                          |
| `github`       | no       | url      | Repo link                                            |
| `demo`         | no       | url      | Live demo link                                       |
| `type`         | no       | enum     | Open Source, SaaS, Client Work, Personal, Experiment |
| `status`       | no       | enum     | active, maintained, archived, in-progress            |
| `year`         | yes      | number   |                                                      |
| `featured`     | no       | boolean  | Shows first (default: false)                         |
| `draft`        | no       | boolean  | Hidden in prod, visible in dev                       |

## MDX components

In `.mdx` files (blog and projects), two components are available without imports:

**Callout** — `tip`, `note`, `warning`, `danger`:

```mdx
<Callout type="warning" title="Heads up">
  This action is irreversible.
</Callout>
```

**Tabs** — tabbed content sections:

```mdx
<Tabs tabs={["npm", "pnpm"]}>
  <div>npm install</div>
  <div>pnpm add</div>
</Tabs>
```

## Code blocks

Fenced code blocks support Expressive Code features:

````md
```ts title="src/example.ts" {2} showLineNumbers
function greet(name: string): string {
  return `Hello, ${name}!`;
}
```
````

- `title="..."` — file name label on the block
- `{2}` — highlight line 2 (use `{1-3}` for ranges)
- `showLineNumbers` — line number gutter

## Images and static files

Put images, PDFs, and other static assets in `public/`. Reference them with
root-relative paths:

```mdx
![Alt text](/images/posts/my-image.png)
```

Avatar, favicon, OG image, cert logos, and resume PDF already live in `public/`.

## Running the site

```bash
npm run dev      # http://localhost:4321, hot reload
npm run build    # production build → dist/
npm run check    # type-check (validates frontmatter too)
```

Search (Pagefind) only works after a build — run `npm run build` once, then
`npm run dev` to get search working in development.
