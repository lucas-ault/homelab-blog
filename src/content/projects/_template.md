---
title: "Project Name"
description: "A one-line summary for the project card and SEO."
technologies: ["Python", "Kubernetes"]
# github: 'https://github.com/lucas-ault/project-name'  # optional
# demo: 'https://example.com'                           # optional
# documentation: 'https://docs.example.com'             # optional
type: "Personal" # Open Source | SaaS | Client Work | Personal | Experiment
status: "active" # active | maintained | archived | in-progress
year: 2026
featured: false
draft: true
---

## Overview

What the project is and why it exists.

## Technology stack

- **Tech 1** — what it does here
- **Tech 2** — what it does here

## How it works

Describe the architecture or approach.

## Frontmatter reference

| Field           | Type     | Required | Notes                                                 |
| --------------- | -------- | -------- | ----------------------------------------------------- |
| `title`         | string   | yes      |                                                       |
| `description`   | string   | yes      | Shows on project card and detail page                 |
| `technologies`  | string[] | no       | Shown as chips, used by the filter on /projects       |
| `github`        | url      | no       | Repo link                                             |
| `demo`          | url      | no       | Live demo link                                        |
| `documentation` | url      | no       | Docs link                                             |
| `type`          | enum     | no       | Open Source, SaaS, Client Work, Personal, Experiment  |
| `status`        | enum     | no       | active, maintained, archived, in-progress             |
| `year`          | number   | yes      |                                                       |
| `featured`      | boolean  | no       | Featured projects show first (default: false)         |
| `draft`         | boolean  | no       | Hidden in production, visible in dev (default: false) |
