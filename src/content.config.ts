import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/projects",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    technologies: z.array(z.string()).default([]),
    github: z.url().optional(),
    demo: z.url().optional(),
    documentation: z.url().optional(),
    npm: z.url().optional(),
    type: z
      .enum(["Open Source", "SaaS", "Client Work", "Personal", "Experiment"])
      .optional(),
    status: z
      .enum(["active", "maintained", "archived", "in-progress"])
      .optional(),
    year: z.number(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, projects };
