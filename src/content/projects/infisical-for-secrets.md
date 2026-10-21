---
title: "Self-Hosting Infisical for Secrets Management in My K3s Homelab"
description: "Setting up Infisical with Flux CD, CloudNativePG, and Redis Sentinel to make managing secrets across my Kubernetes homelab a little easier."
technologies:
  [
    "Kubernetes",
    "K3s",
    "Infisical",
    "Flux CD",
    "CloudNativePG",
    "PostgreSQL",
    "Redis",
    "Helm",
  ]
type: "Personal"
status: "active"
year: 2026
featured: false
draft: false
---

## Overview

After getting Flux CD running in my K3s cluster, the next thing I wanted to tackle was secrets management.

At first, I was creating Kubernetes Secrets manually with `kubectl`. That was fine when I only had a few services running, but I knew it would get annoying pretty quickly as I continued adding more applications.

Even though my GitHub repository is now private, I still don't want to store passwords, API keys, or other credentials directly in Git. Having a private repository is nice, but it doesn't really change how I'd prefer to manage sensitive information.

I wanted a central place to keep credentials and a way for Kubernetes to retrieve them automatically. Ideally, adding a new application would just mean defining what secrets it needs, rather than manually creating them in the cluster.

I ended up going with Infisical, which I could self-host directly in Kubernetes and integrate with the GitOps setup I'd already built.

Of course, I couldn't just deploy Infisical and call it a day. Since it would eventually be responsible for credentials used throughout my homelab, I wanted to make the deployment reasonably resilient.

That meant setting up PostgreSQL replication, Redis Sentinel, multiple Infisical replicas, and figuring out how to handle the secrets that Infisical itself needs to start.

## Technology Stack

- **Infisical** — The central place where I store and manage application credentials.
- **Infisical Secrets Operator** — Copies secrets from Infisical into Kubernetes automatically.
- **CloudNativePG** — Manages a three-instance PostgreSQL cluster with replication and primary failover.
- **PostgreSQL 16** — Stores Infisical's application data.
- **Redis Sentinel** — Provides Redis replication and automatic master failover.
- **Flux CD** — Keeps the deployment configuration synchronized with my GitHub repository.
- **Helm** — Handles installation and configuration of the various components.
- **K3s / Kubernetes** — Runs the entire setup across my homelab cluster.

## How I Set It Up

### Starting with PostgreSQL

Infisical's Helm chart can deploy PostgreSQL and Redis for you, which would have been the easiest way to get everything running.

I wanted a bit more control over both, though, especially since I was planning to depend on Infisical for other applications.

So I disabled the bundled PostgreSQL and Redis installations and deployed them separately.

For the database, I chose CloudNativePG. It's a Kubernetes operator that manages PostgreSQL clusters and takes care of things like replication, failover, and recovering unhealthy instances.

I configured a three-instance PostgreSQL 16 cluster named `infisical-db`, running in the `infisical` namespace.

One instance acts as the primary, while the other two are streaming replicas. I also configured pod anti-affinity to spread them across different Kubernetes nodes.

Infisical connects through CloudNativePG's read-write Service, which follows whichever database instance is currently the primary. That way, Infisical doesn't need to know which individual PostgreSQL pod to connect to.

For storage, each PostgreSQL instance has its own 10Gi persistent volume using K3s's default `local-path` storage provisioner.

One limitation of this setup is that the storage itself isn't replicated. Each volume lives on the node where it was created, and PostgreSQL handles replicating the actual database data.

That should help with database availability if a node goes down, although I still need to do some proper failure testing. If a node is lost permanently, its local volume isn't automatically available elsewhere, so recovering the full replica count may require additional cleanup and rebuilding.

Eventually, I'd like to look into replicated storage as well, but for now I wanted to get the database working without adding another storage platform to the mix.

### Setting Up Redis Sentinel

Next was Redis.

Infisical uses Redis as part of its supporting infrastructure, and I didn't really want to rely on a single Redis container if I could avoid it.

I went with the Bitnami Redis Helm chart and configured it to run with Sentinel.

The deployment has one master and three replicas, with Sentinel monitoring the nodes and coordinating failover if the master becomes unavailable.

I configured a quorum of two, enabled AOF persistence, and gave the Redis instances their own persistent volumes.

I also set Redis to use a `noeviction` memory policy rather than automatically removing keys when memory gets tight.

One thing that caught me off guard was that the Bitnami images referenced by the chart weren't available publicly anymore.

I ended up switching the deployment to the corresponding `bitnamilegacy` images to get everything running.

It wasn't a huge issue, but it did mean spending some extra time troubleshooting what initially looked like a broken Helm deployment.

### Deploying Infisical

Once I had the supporting components configured, I moved on to Infisical itself.

I'm using the standalone Infisical Helm chart, with its built-in PostgreSQL and Redis installations disabled.

Instead, I configured it to connect to the CloudNativePG cluster and Redis Sentinel deployment I had already set up.

I also configured three Infisical replicas and spread them across Kubernetes nodes, rather than running a single application pod.

A PodDisruptionBudget helps prevent voluntary disruptions from taking down every replica at once.

I didn't configure a public Ingress for Infisical. Since it's handling credentials for other services, I wanted to keep access private.

The initial setup was done using Kubernetes port-forwarding, which let me reach the web interface locally without exposing it on my network.

All of the actual deployment configuration is managed through Flux and Helm, just like the rest of my cluster.

## The Chicken-and-Egg Problem with Secrets

One of the more interesting parts of this project was figuring out what to do with Infisical's own credentials.

Infisical needs an encryption key, an authentication secret, and credentials for PostgreSQL and Redis before it can start.

But if Infisical is where I'm supposed to store my secrets, where do I put the credentials needed to start Infisical?

Obviously, I can't have Infisical retrieve them from itself before it's running.

I ended up keeping a small group of bootstrap credentials outside the normal GitOps workflow.

Those values live in my password manager, and I manually create the corresponding Kubernetes Secrets during the initial deployment.

There are three main Secrets involved:

- **`infisical-secrets`** — Contains Infisical's encryption and authentication settings, plus its database and Redis connection information.
- **`infisical-db-app`** — Holds the PostgreSQL application credentials.
- **`infisical-redis-auth`** — Holds the Redis authentication password.

Once these exist in Kubernetes, the applications can start and Flux can take over managing their deployment configuration.

The most important credential here is probably Infisical's `ENCRYPTION_KEY`.

Without the original encryption key, restoring a database backup wouldn't be enough to recover the encrypted secrets stored inside it.

For that reason, I keep a separate copy of the key in my password manager rather than relying on anything stored in the cluster.

It's not quite a fully automated bootstrap, but I think that's a reasonable compromise. There are only a handful of credentials to manage manually, and everything else can use Infisical once it's running.

## Connecting Infisical to Kubernetes

With Infisical running, I needed a way for applications to retrieve credentials without manually copying them into Kubernetes.

That's where the Infisical Secrets Operator comes in.

I deployed the operator using Helm and created a Secrets Management project called `homelab`, with an environment named `prod`.

I also configured a Machine Identity so the operator could authenticate to Infisical.

Rather than putting an API token into Kubernetes configuration, I used Infisical's Kubernetes authentication method.

This lets the operator authenticate using a Kubernetes service account, with Infisical verifying the service account identity through the Kubernetes TokenReview API.

There were a few pieces to configure, including an `InfisicalConnection`, an `InfisicalAuth`, service accounts, and the necessary RBAC permissions.

I also had to allow internal IP connections because Infisical needs to contact Kubernetes's internal API endpoint to validate the service account tokens.

Once everything was connected, the operator could start creating Kubernetes Secrets from values stored in Infisical.

I configured Flux to wait until the authentication resource reported Ready before considering that part of the infrastructure healthy.

That was helpful because it made it easier to see whether the integration was actually working, rather than just checking whether the operator pod was running.

## How I Manage Secrets Now

This is where the setup started to feel worthwhile.

Instead of manually creating Kubernetes Secrets for every application, I can now add the credentials to Infisical and reference them through a Kubernetes manifest.

I organize the values under different paths in my `homelab` project.

For example, an application might have its credentials stored under `/example`.

I then create an `InfisicalStaticSecret` resource that tells the operator where to find those values and what Kubernetes Secret to create.

A basic example looks like this:

```yaml
apiVersion: secrets.infisical.com/v1beta1
kind: InfisicalStaticSecret
metadata:
  name: app-env
  namespace: example
spec:
  infisicalAuthRef:
    name: infisical-auth
    namespace: infisical
  sources:
    - projectSlug: homelab
      environmentSlug: prod
      secretPath: /example
  targets:
    - name: app-env
      namespace: example
      kind: Secret
```

The nice part is that this manifest can live in Git without containing any of the actual credentials.

Flux deploys the manifest, the Infisical operator reads it, and Kubernetes gets the Secret that the application needs.

The operator checks Infisical for changes roughly once a minute.

If I update a password or API key in Infisical, the corresponding Kubernetes Secret is updated automatically during the next synchronization.

Applications that read Secrets through environment variables generally still need a restart to pick up the updated values, but at least I don't have to manually recreate the Secrets anymore.

It's a much cleaner workflow than what I was doing before.

## Getting Everything to Deploy in the Right Order

Another challenge was figuring out how to organize the Flux deployments.

I couldn't just deploy everything at once because some components need other components to exist before Kubernetes can even understand their resources.

For example, I need the CloudNativePG operator installed before I can create a PostgreSQL cluster.

The same thing applies to Infisical's secrets operator. It needs to be installed before the authentication and synchronization resources can be created.

I used separate Flux Kustomizations with `dependsOn` relationships to manage this.

The deployment is split into a few stages: installing the shared components, bringing up the database and Redis, configuring Infisical, and finally setting up its Kubernetes authentication.

I also added health checks so Flux can tell whether important resources are actually ready.

One example is the `InfisicalAuth` resource. If its Machine Identity configuration is missing or invalid, Flux leaves the corresponding Kustomization unhealthy.

I prefer that behavior over having everything appear successful just because the Kubernetes manifests were accepted.

It took a little more effort to organize the deployments this way, but it should make future rebuilds and troubleshooting much easier.

## What I'd Like to Improve

There are still a few things I want to work on as I continue developing this setup.

- **Backups** — Configure CloudNativePG backups and WAL archiving to S3-compatible storage, then test restoring the database.
- **Storage** — Explore replicated Kubernetes storage so I'm not relying entirely on local-path volumes.
- **Failover testing** — Test what actually happens when a PostgreSQL or Redis node goes offline, including recovery and rebuilding.
- **Operator compatibility** — Revisit the Infisical Secrets Operator's supported Kubernetes versions, since the current chart's declared compatibility range doesn't include the K3s version I'm running.
- **Disaster recovery** — Document the process for rebuilding Infisical and restoring its encryption key and database from backups.

## Final Thoughts

This project ended up being more involved than I originally expected.

I started out wanting a better way to manage passwords and API keys for my Kubernetes applications, and ended up deploying a replicated PostgreSQL cluster, Redis Sentinel, and a Kubernetes secrets operator along the way.

A lot of the work wasn't necessarily installing the software itself. It was figuring out how everything should connect, what needed to start first, and how to handle the small number of credentials that can't be managed automatically.

I'm pretty happy with the result so far.

Flux handles the deployment configuration, Infisical stores the credentials, and the operator takes care of getting those credentials into Kubernetes.

The repository being private gives me more control over who can see the infrastructure configuration, but I still like having credentials managed separately rather than mixed into Git history.

It's another part of the homelab that I can build on as I continue adding services, and it was a good opportunity to learn more about managing stateful applications in Kubernetes.
