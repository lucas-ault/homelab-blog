---
title: "Building a Highly Available K3s Homelab"
description: "Building a six-node Kubernetes cluster across three Proxmox hosts, with a highly available control plane, kube-vip, and Traefik ingress."
technologies:
  [
    "Kubernetes",
    "K3s",
    "Proxmox",
    "Ubuntu",
    "etcd",
    "kube-vip",
    "Traefik",
    "Helm",
    "Ubiquiti",
    "Git",
  ]
github: "https://github.com/lucas-ault/home-lab"
type: "Personal"
status: "active"
year: 2026
featured: true
draft: false
---

## Overview

I've been running various services in my homelab for a while, and I wanted to put together a more complete Kubernetes environment that I could use for hosting applications, experimenting with new technologies, and getting more hands-on experience with highly available infrastructure.

I decided to build a six-node K3s cluster using three physical Proxmox hosts, each running two Ubuntu Server VMs. The idea was to distribute the Kubernetes control plane across all three physical machines while keeping separate worker nodes for application workloads.

One of my main goals was to avoid having a single machine responsible for keeping the entire cluster running. I also wanted to keep things relatively lightweight, make use of my existing UniFi network, and eventually manage deployments through GitOps.

This is an ongoing project, but the initial cluster is up and running, with three control-plane nodes, three workers, a shared Kubernetes API address, and Traefik handling application ingress.

## Technology Stack

- **Proxmox VE** — Hosts the six Ubuntu VMs across three physical machines.
- **Ubuntu Server 26.04 LTS** — The operating system for each Kubernetes node, initially configured using cloud-init.
- **K3s** — A lightweight Kubernetes distribution that provides the orchestration platform without requiring quite as much infrastructure to get started.
- **Embedded etcd** — Keeps cluster state synchronized between the three control-plane nodes.
- **kube-vip** — Provides shared virtual IP addresses for both the Kubernetes API and application ingress.
- **Traefik** — Handles incoming HTTP/HTTPS traffic and routes requests to applications running in the cluster.
- **Helm** — Used for configuring and managing packaged Kubernetes components.
- **Flannel VXLAN** — Provides networking between pods across the different nodes.
- **Ubiquiti UniFi** — Provides the underlying LAN and network configuration.
- **GitHub** — Stores the Kubernetes manifests and infrastructure documentation, with GitOps integration planned.

## How I Built It

### Setting Up the Nodes

I started by creating Ubuntu Server VMs on my three Proxmox hosts. Each physical machine runs two VMs: one for the Kubernetes control plane and another dedicated to running workloads.

The final layout looks like this:

| Proxmox Host | Control Plane | Worker |
| ------------ | ------------- | ------ |
| Host 1       | kube1         | kube2  |
| Host 2       | kube3         | kube4  |
| Host 3       | kube5         | kube6  |

I used Proxmox's cloud-init functionality to handle the initial Ubuntu configuration, including static IP addressing, SSH access, and user setup.

I did run into an interesting issue with Ubuntu 26.04 where cloud-init attempted to rename network interfaces from `ens18` to `eth0`. The rename failed on a few machines, leaving them with DHCP addresses instead of their intended static IPs. After digging through the cloud-init and Netplan logs, I found that rebooting the affected VMs allowed the correct configuration to apply.

Once the VMs were communicating properly, I moved on to installing K3s.

### Building the Control Plane

I started with K3s on `kube5`, initially using its default single-node configuration. Since I wanted multiple control-plane nodes, I converted the installation to use embedded etcd instead of SQLite.

From there, I joined `kube3` and `kube1` as additional K3s servers, giving the cluster three control-plane nodes distributed across separate physical machines.

Using three etcd members means the cluster can maintain quorum if one control-plane node goes offline. Distributing those members across my Proxmox hosts also means a single physical server failure shouldn't take down the entire Kubernetes control plane.

After getting the three control-plane nodes online, I installed the K3s agent on the three remaining VMs.

At that point, I had all six Kubernetes nodes reporting Ready, with the expected control-plane and worker roles.

### Making the Kubernetes API Highly Available

One of the next challenges was figuring out how to access the Kubernetes API without depending on any particular control-plane node.

Initially, the other nodes were joining through the IP address of my first K3s server. That worked fine for getting the cluster started, but it wasn't ideal as a long-term management endpoint.

I looked into handling this through my UniFi router or using a separate reverse proxy, but decided to use kube-vip instead.

I deployed kube-vip as a DaemonSet on the three control-plane nodes and configured it to advertise a shared virtual IP using ARP and leader election.

This gave me a single Kubernetes API endpoint at `192.168.10.60:6443`, regardless of which node currently owns the VIP.

I also set up `kubectl` on my MacBook using the cluster's kubeconfig, pointed it at the new VIP, and verified I could manage all six nodes without needing to SSH into a VM or use the Proxmox console.

### Configuring Traefik and Application Networking

With the control plane working, I wanted a way to expose applications on my local network without assigning a separate IP address to every service.

K3s includes Traefik as its default ingress controller, so I decided to use that rather than introduce another reverse proxy.

I enabled kube-vip's Kubernetes Service LoadBalancer functionality and configured Traefik to use a separate virtual IP at `192.168.10.61`.

This keeps the Kubernetes management API and application traffic separate:

- `192.168.10.60` handles Kubernetes API access.
- `192.168.10.61` handles incoming application traffic through Traefik.

Since K3s already deploys Traefik using Helm, I used a `HelmChartConfig` resource to customize its existing installation instead of creating a second Traefik deployment.

The result is a shared ingress endpoint that can route requests to different Kubernetes applications based on their hostnames.

### Testing with a Hello World Application

To make sure everything was actually working, I deployed a simple Whoami HTTP application with three replicas.

The application returns basic information about the HTTP request and the container handling it, making it useful for testing networking and routing.

I first tested the application using Kubernetes port-forwarding, then tested routing through Traefik, and finally connected directly to the application ingress VIP from my MacBook.

The first few tests were useful for narrowing down some connectivity issues. At one point, Kubernetes showed the correct external IP for Traefik, but requests weren't getting through. After checking kube-vip's leader-election lease, ARP resolution, and Traefik's backend endpoints, I confirmed that the virtual IP was being advertised and that the network path was working.

The final test returned an HTTP 200 response using the hostname `hello.home.arpa`, with the request successfully traveling through kube-vip, Traefik, the Kubernetes Service, and into one of the application pods.

That was a nice milestone because it confirmed the cluster could actually serve applications over my LAN rather than just report healthy nodes.

## Keeping Configuration in Git

I also wanted to start organizing the cluster configuration properly from the beginning.

I created a GitHub repository to store infrastructure manifests, application deployments, and documentation. The repository is organized into separate directories for initial cluster bootstrap, networking, infrastructure services, and applications.

I'm using standard Kubernetes YAML for simple applications and Helm-based configuration where it makes sense.

Since the repository is public, I'm keeping credentials, kubeconfigs, cluster tokens, and other sensitive information outside of Git.

The next step is integrating Flux CD so I can manage deployments through Git rather than manually applying changes with `kubectl`.

## What's Next?

Now that the initial cluster is running, there are a few things I want to add as I continue building it out:

- **Flux CD** — Manage application and infrastructure deployments directly from GitHub.
- **Persistent storage** — Explore replicated storage across the Proxmox hosts, potentially using Longhorn.
- **Monitoring and logging** — Deploy Prometheus, Grafana, and a centralized logging solution.
- **HTTPS and certificates** — Set up certificate management for internal applications.
- **Backups** — Improve etcd snapshot management and automate off-host backups.
- **Failover testing** — Test how the cluster behaves when individual control-plane nodes or entire Proxmox hosts go offline.

Eventually, I'd like this cluster to become the main platform for hosting services in my homelab, while also serving as a place to experiment with Kubernetes, networking, infrastructure automation, and distributed systems.

It's already been a useful project for understanding how the different pieces of a highly available Kubernetes environment fit together, particularly the relationship between etcd quorum, API availability, load balancing, and ingress routing.
