---
title: 'Homelab Cloud Stack'
description:
  'A multi-node K3s, Docker, and Proxmox environment on a segmented home network — hosting production services for family and friends, plus self-hosted AI inference.'
technologies: ['K3s', 'Docker', 'Proxmox', 'Home Assistant', 'TrueNAS', 'Immich', 'Tailscale', 'FluxCD', 'Helm']
type: 'Personal'
year: 2026
featured: true
---

## The idea

A home network that behaves like a small data center: segmented VLANs, a real Kubernetes cluster, and services your family actually depends on every day.

## What's running

- **Multi-node K3s cluster** on dedicated hardware for Kubernetes workloads — Helm charts define everything, FluxCD reconciles it from git.
- **Proxmox VE** as the hypervisor layer — VMs and LXC containers, with a multi-node setup for high-availability experiments.
- **Production services for family and friends** — Home Assistant for home automation, Immich for photo storage, and more.
- **TrueNAS** as the storage tier backing the apps.
- **Tailscale** for remote access and subnet routing across the segmented network.
- **Self-hosted AI inference models** serving agents, coding applications, and home automation.

## What I'm exploring

Kubernetes on bare metal, virtualization, routing, DNS, VPNs, monitoring, and emerging infrastructure and security technologies — the kind of things that are interesting to break and fix at home before touching enterprise environments.

## Why it matters

The homelab is a test bench. Every pattern that survives weekends of real use — failover, backups, GitOps — is the same pattern I bring to enterprise Zero Trust and SASE work.
