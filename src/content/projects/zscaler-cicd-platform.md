---
title: 'Enterprise Zscaler CI/CD Platform'
description:
  'A CI/CD platform for Zscaler Internet Access PAC management across four enterprise tenants, automating validation, peer review, deployment, and rollback so policy changes ship safely in 24x7 production.'
technologies: ['Python', 'GitLab CI/CD', 'YAML', 'JavaScript', 'Zscaler ZIA', 'Zscaler PAC']
type: 'Client Work'
year: 2024
featured: true
---

## The problem

Policy changes to Zscaler Internet Access (ZIA) affect 250,000 global users. A single malformed rule pushed without review can break access for thousands of employees at once — so change management in a 24x7 production environment is a security problem, not just an operations one.

## What I built

A CI/CD platform for ZIA PAC (Private Access Control) management across four enterprise tenants:

- **Automated validation** — PAC logic is linted and validated in CI before any human ever sees it, catching syntax and policy errors at authoring time.
- **Peer review gates** — every change flows through Git branches, merge requests, and review; nothing deploys without sign-off.
- **Controlled deployment** — deployments are orchestrated per-tenant with explicit targeting, so a change for one enterprise tenant never touches another.
- **First-class rollback** — every deployment is recorded and reversible, so the recovery path is a single well-practiced action instead of an incident.

## Impact

- Reduced configuration errors across all four tenants.
- Made the change process safer and auditable — who changed what, when, and why is in git history.
- Became the baseline for how policy changes are made across the enterprise.

## How it works

PAC logic is authored in Python and JavaScript, expressed as versioned configuration in YAML. GitLab CI/CD runs the validation pipeline on every push; approved merges trigger tenant-scoped deployment jobs. The whole flow treats security policy exactly like application code: branch, review, test, deploy, roll back.
