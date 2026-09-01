---
title: 'K3s on Proxmox'
description: 'How the multi-node K3s cluster is set up on Proxmox, including networking and GitOps with FluxCD.'
group: 'Homelab'
order: 2
---

## Overview

A dedicated multi-node K3s cluster runs on Proxmox VMs, used for Kubernetes workloads and experiments.

> This is a starter page — the step-by-step setup write-up is coming.

## Topology (draft)

- **Control plane** — one dedicated VM running the K3s server.
- **Worker nodes** — two VMs running `k3s agent`, joined to the control plane.
- **Networking** — a dedicated VLAN for cluster traffic, isolated from the production and IoT segments.
- **GitOps** — FluxCD watches a git repo of Helm charts and manifests; merges trigger reconciliation. No manual `kubectl apply` in production.

## Why K3s

Lightweight enough to run at home, API-compatible with full Kubernetes, and simple to operate — which is exactly what I want a test bench to be.
