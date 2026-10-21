---
title: "Adding Flux CD and GitOps to My K3s Homelab"
description: "Moving my six-node K3s cluster from manually applied Kubernetes manifests to automated GitOps deployments with Flux CD, Kustomize, and GitHub."
technologies:
  ["Kubernetes", "K3s", "Flux CD", "GitOps", "GitHub", "Kustomize", "Helm"]
github: "https://github.com/lucas-ault/home-lab"
type: "Personal"
status: "active"
year: 2026
featured: true
draft: false
---

## Overview

After getting my six-node K3s cluster up and running, one of the first things I wanted to improve was how I managed its configuration and deployments.

During the initial setup, I was keeping Kubernetes manifests in my GitHub repository, but actually deploying them was still a manual process. I'd make a change to a YAML file, connect to the cluster with `kubectl`, and apply it myself.

That worked fine while I was getting everything started, but I knew it would become a pain as I added more applications and infrastructure services.

I wanted a setup where GitHub wasn't just a place to store configuration files. I wanted it to be the source of truth for what should actually be running in Kubernetes.

That's what led me to Flux CD.

The basic idea was to have Flux continuously watch my GitHub repository and automatically apply configuration changes to the cluster. Instead of manually deploying changes, I could commit and push them to GitHub and let Flux handle the rest.

## Technology Stack

- **Flux CD** — Continuously reconciles the Kubernetes cluster against configuration stored in Git.
- **GitHub** — Hosts the public repository containing my cluster configuration.
- **Kustomize** — Organizes Kubernetes resources into manageable groups of applications and infrastructure.
- **Helm** — Manages packaged Kubernetes applications through declarative Helm releases.
- **K3s / Kubernetes** — Provides the underlying cluster where Flux runs and manages workloads.
- **Git** — Handles version control, configuration history, and the deployment workflow.

## Getting Flux Installed

### Bootstrapping from GitHub

One of the things I liked about Flux was how straightforward the initial installation was.

Since I already had `kubectl` configured on my MacBook and could access the Kubernetes API through the highly available virtual IP at `192.168.10.60`, I didn't need to make any changes to the underlying cluster infrastructure.

I installed the Flux CLI and used its GitHub bootstrap command to connect my existing `home-lab` repository:

```bash
flux bootstrap github \
  --personal \
  --private=false \
  --owner=lucas-ault \
  --repository=home-lab \
  --branch=main \
  --path=clusters/homelab
```

I used a GitHub admin token for the initial bootstrap operation, but didn't need to keep that token around afterward.

Instead, Flux uses a read-only SSH deploy key to pull the repository. The credentials are stored in a Kubernetes Secret rather than committed to Git, and the cluster doesn't need write access to my GitHub repository.

I also intentionally kept the repository public. None of the configuration requires private repository access, and keeping it public makes it easier to document and share how the cluster is set up.

The bootstrap command installed Flux's controllers, created the initial configuration, and committed the necessary manifests into the repository.

After that, Flux essentially started managing its own configuration.

### How Flux Watches the Repository

Flux created a `flux-system` directory under `clusters/homelab`, containing the manifests needed to connect the cluster back to GitHub.

Two resources are particularly important:

- **GitRepository** — Checks the `main` branch for changes approximately every minute.
- **Flux Kustomization** — Reconciles the manifests under `clusters/homelab/flux-system`, including the additional Kustomizations used throughout the repository.

Most of the application and infrastructure Kustomizations are configured to reconcile every ten minutes.

This creates a continuous loop between GitHub and Kubernetes. When Flux detects a new commit, it downloads the updated configuration, determines what has changed, and applies the necessary updates.

It also monitors the cluster for configuration drift, so manually changing a Flux-managed resource isn't a reliable way to make permanent modifications.

## Organizing the Repository

My repository already had a basic structure from the initial K3s deployment, with separate directories for bootstrap configuration, networking, infrastructure, and applications.

Rather than redesigning everything, I added a dedicated Flux entry point and started breaking the cluster configuration into separate Kustomizations.

The high-level structure now looks like this:

```text
home-lab/
├── bootstrap/
│   ├── k3s/
│   └── kube-vip/
├── clusters/
│   └── homelab/
│       ├── flux-system/
│       │   ├── gotk-components.yaml
│       │   ├── gotk-sync.yaml
│       │   └── kustomization.yaml
│       └── *.yaml
├── infrastructure/
│   ├── platform/
│   ├── networking/
│   ├── security/
│   ├── storage/
│   └── monitoring/
├── applications/
│   ├── development/
│   └── production/
└── docs/
```

The `flux-system` directory acts as the entry point. Its `kustomization.yaml` includes the Flux components, Git synchronization configuration, and the Flux Kustomization resources responsible for deploying everything else.

Those Kustomizations point to different directories in the repository.

For example, I have separate reconciliation paths for development applications, production applications, networking configuration, and shared infrastructure.

This keeps everything organized without requiring a single massive Kubernetes manifest or one reconciliation process for the entire cluster.

### Flux Kustomizations vs. Kustomize

Something that took a little getting used to was the distinction between a Flux Kustomization and a regular Kustomize configuration.

Despite having nearly identical names, they serve different purposes.

A standard `kustomization.yaml` tells Kustomize which Kubernetes resources belong together.

A Flux `Kustomization` is a Kubernetes custom resource that tells Flux where to find those files in Git, how often to reconcile them, and what dependencies or health checks to use.

For example, a Flux Kustomization can point to:

```yaml
spec:
  interval: 10m
  path: ./applications/development
  prune: true
  sourceRef:
    kind: GitRepository
    name: flux-system
```

That directory then contains its own `kustomization.yaml`, which lists the applications or resources to deploy.

Once I understood that distinction, the repository structure made a lot more sense.

## Separating Applications and Infrastructure

One of my goals was to keep application deployments separate from the underlying infrastructure.

I created different Flux Kustomizations for development and production workloads, allowing each category to be managed independently.

For a new application, I can create a directory with its Namespace, Deployment or HelmRelease, Service, Ingress, and any other necessary resources.

I then reference the application from the parent Kustomize configuration for that environment.

For example:

```text
applications/
├── development/
│   ├── kustomization.yaml
│   └── hello-world/
│       ├── deployment.yaml
│       └── kustomization.yaml
└── production/
    └── kustomization.yaml
```

Flux handles applying those resources when the updated configuration reaches GitHub.

I also use separate Kustomizations for infrastructure components so they can have their own reconciliation intervals, dependencies, and health checks.

This is especially useful when one component needs another to be available before it can start.

Flux supports this through `dependsOn`, which lets me establish an explicit order between Kustomizations rather than relying on everything being deployed at once.

While Kubernetes is already declarative, Flux adds another layer of coordination by allowing me to define both the desired configuration and the dependencies between groups of resources.

## Keeping Bootstrap Infrastructure Separate

One decision I made early on was to avoid putting absolutely everything under Flux.

The K3s installation and kube-vip configuration are still maintained separately in the `bootstrap` directory.

These were originally installed manually because they're responsible for bringing up the cluster and providing access to the Kubernetes API.

Flux depends on that infrastructure being available before it can do anything useful.

For example, kube-vip provides the shared control-plane address at `192.168.10.60`. If that stopped working, Flux would lose access to the API just like any other Kubernetes client.

I also kept K3s responsible for installing Traefik through its built-in Helm controller.

Flux manages the Traefik `HelmChartConfig`, which customizes the existing installation and assigns its LAN-facing LoadBalancer address at `192.168.10.61`.

This lets me manage Traefik's configuration through Git without having two different systems trying to install or own the same Helm release.

I may eventually revisit which infrastructure components should be managed by Flux, but for now I prefer keeping the foundational cluster bootstrap separate from everything deployed on top of it.

## What Deployments Look Like Now

The biggest improvement is how much simpler day-to-day changes have become.

Previously, updating an application generally meant editing its manifest and manually applying the changes with `kubectl`.

Now the workflow is:

1. Make a change to an application or infrastructure manifest.
2. Commit the change and push it to GitHub.
3. Flux detects the update and reconciles the affected resources.
4. Kubernetes handles updating the running workloads.

For most changes, I don't need to connect to the Kubernetes API or manually run deployment commands.

I can still use `kubectl` and the Flux CLI to inspect resources and troubleshoot problems, but Git is where persistent configuration changes belong.

### Automatic Cleanup with Pruning

I also enabled pruning on my Flux Kustomizations.

This means Flux doesn't just create and update resources. It can also delete resources that are removed from the desired configuration in Git.

For example, if I remove an application's manifests and references from the repository, Flux can remove the associated resources from Kubernetes during reconciliation.

That's convenient, but it also means changes need to be made carefully.

Deleting something from Git can now result in deleting it from the cluster, so I review changes before merging or pushing them.

### Handling Configuration Drift

Another advantage is that Flux continuously works to keep Kubernetes aligned with Git.

If I manually edit a Flux-managed Deployment, those changes aren't considered permanent. Flux can restore the configuration defined in the repository during its next reconciliation.

That encourages me to make changes through Git rather than directly modifying resources in the cluster.

It also gives me a clearer record of what changed, when it changed, and what configuration I intended to deploy.

## Testing the GitOps Workflow

I used the existing Hello World application from my initial K3s deployment to validate the new workflow.

Since the application was already running and accessible through Traefik, it was a convenient way to test Flux without introducing an entirely new service.

I moved its Kubernetes configuration into the development applications structure and had Flux reconcile it from GitHub.

This let me validate that Flux could manage application resources that had originally been deployed manually.

The application continued to work through Traefik, and its deployment configuration could now be maintained directly through the repository.

It was a relatively simple test, but it demonstrated the main thing I wanted out of the project: I could manage an application's desired state from Git instead of relying on manual deployment commands.

## What's Next?

With Flux managing the cluster's applications and supporting infrastructure, I have a foundation for continuing to expand the homelab.

A few things I'd like to improve over time include:

- **Automated validation** — Add GitHub Actions checks to validate YAML, Kustomize builds, and Kubernetes manifests before changes reach the cluster.
- **Deployment notifications** — Add notifications for failed reconciliations and other deployment events.
- **Better release management** — Continue refining how I manage Helm chart versions and application updates.
- **Disaster recovery** — Document and test rebuilding the cluster and restoring its configuration from Git.
- **GitOps workflows** — Experiment with pull-request-based changes and automated dependency updates.

## Final Thoughts

Installing Flux was surprisingly straightforward. The initial bootstrap was basically one command.

Most of the actual work went into reorganizing the repository and deciding how I wanted Flux to manage different parts of the cluster.

I also spent some time understanding how Flux Kustomizations, regular Kustomize files, reconciliation intervals, dependency ordering, and pruning all fit together.

The result is a much cleaner deployment workflow.

Instead of treating GitHub as a collection of YAML files that I manually copy into Kubernetes, I now treat it as the source of truth for what should be running.

It's a relatively small change in how I interact with the cluster, but it makes a big difference as the number of applications and infrastructure components continues to grow.

And, perhaps most importantly, I can now spend less time manually deploying things and more time actually building and experimenting with them.
