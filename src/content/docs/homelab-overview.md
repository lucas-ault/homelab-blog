---
title: 'Homelab Overview'
description: 'The topology, goals, and principles behind the home network and lab.'
group: 'Homelab'
order: 1
---

## What this is

Documentation for my home network and lab — a segmented network, a multi-node Kubernetes cluster, and the production services it runs.

> This is a starter page. I'll fill in the full topology diagram and hardware inventory as I write it up.

## Goals

- **Segmentation** — separate lab, IoT, and production traffic so a compromise in one zone can't reach the others.
- **GitOps** — desired state lives in git; the cluster reconciles itself.
- **Production-grade at home** — the services here are real dependencies for family and friends, so they get real backups, monitoring, and failover.

## What's running

See the [Homelab Cloud Stack project](/projects/homelab-cloud-stack) for the full list of services.
