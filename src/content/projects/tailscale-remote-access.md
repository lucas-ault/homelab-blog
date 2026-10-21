---
title: "Adding Private Access to My K3s Homelab with Tailscale"
description: "Setting up the Tailscale Kubernetes Operator with Flux CD and Infisical to securely access my cluster and internal services from anywhere."
technologies:
  ["Kubernetes", "K3s", "Tailscale", "Flux CD", "Infisical", "Headlamp", "Helm"]
type: "Personal"
status: "active"
year: 2026
featured: false
draft: false
---

## Overview

After getting Cloudflare Tunnel working with my K3s cluster, I had a pretty convenient way to make applications accessible from the internet.

That was great for things like my homelab blog and test applications, but there were a few services I definitely didn't want to expose publicly.

Things like Headlamp, Infisical, and the Kubernetes API itself are a different story. They're administrative tools that can view or modify parts of the cluster, so I wanted to keep them accessible only to devices I trust.

I could already access the Kubernetes API locally through the virtual IP I'd configured with kube-vip, but that didn't help much when I was away from home.

I also didn't want to open ports on my router or set up another public-facing entry point just for administrative access.

Since I was already using Tailscale for some of my other homelab infrastructure, it seemed like a good fit.

I decided to deploy the Tailscale Kubernetes Operator, which would let me expose specific Kubernetes services directly to my tailnet without making them accessible from the public internet.

The end goal was pretty simple: I wanted to be able to open my Kubernetes dashboard, access Infisical, or manage the cluster with `kubectl` from anywhere, as long as I was connected to Tailscale.

## Technology Stack

- **Tailscale** — Provides a private network connecting my trusted devices and homelab infrastructure.
- **Tailscale Kubernetes Operator** — Manages Tailscale-connected services and proxies inside Kubernetes.
- **Tailscale ProxyGroups** — Run multiple proxy replicas for accessing the Kubernetes API and internal applications.
- **Flux CD** — Deploys and manages the operator and its configuration from Git.
- **Infisical** — Stores the Tailscale OAuth credentials and synchronizes them into Kubernetes.
- **Headlamp** — Provides a web interface for managing and monitoring Kubernetes resources.
- **Helm** — Handles installation and configuration of the Tailscale operator.
- **K3s / Kubernetes** — Runs the operator, proxies, and applications being exposed.

## How I Set It Up

### Keeping Public and Private Access Separate

One of the things I wanted to maintain was a clear distinction between services meant to be publicly accessible and services meant for administration.

My existing Cloudflare Tunnel setup handles public application traffic through Traefik.

For example, applications under `laultlab.com` can be accessed through Cloudflare without requiring any inbound port forwarding on my home router.

I didn't want to put administrative services on that same public path.

Instead, I wanted Tailscale to handle access to things like the Kubernetes API, Headlamp, and Infisical.

This gives me two separate ways into the cluster:

- **Cloudflare Tunnel** handles applications I intentionally make public.
- **Tailscale** handles private services and cluster administration.

The nice part is that neither approach requires opening inbound ports on my home network.

I also don't need to expose an entire Kubernetes subnet to Tailscale. The operator can publish specific services, which gives me a little more control over what is accessible.

### Deploying the Tailscale Kubernetes Operator

I started by adding the official Tailscale Helm repository to my existing Flux-managed infrastructure.

I'm using version `1.104.1` of the Tailscale Kubernetes Operator, deployed into its own `tailscale` namespace.

The operator manages the Tailscale resources needed to expose Kubernetes services, including creating and maintaining proxy instances.

Rather than manually running Tailscale clients in individual application pods, I can define Kubernetes resources that tell the operator which services I want available on my tailnet.

The operator then handles the underlying Tailscale connections.

I also gave the operator a recognizable hostname, `homelab-k8s-operator`, so it's easy to identify in the Tailscale admin console.

One thing I decided not to use was the Helm chart's built-in Kubernetes API proxy.

Instead, I disabled that feature and configured a separate ProxyGroup for API access. This gave me a more consistent way to manage the API and other private services through Kubernetes manifests.

### Handling OAuth Credentials with Infisical

The Tailscale operator needs credentials so it can authenticate with my tailnet and create the devices and services it manages.

Rather than manually creating a Kubernetes Secret or putting those credentials in my Git repository, I used the Infisical setup I'd already built.

I created an OAuth client in the Tailscale admin console and configured it with the permissions needed by the operator.

The client is scoped to the `tag:k8s-operator` identity, which is allowed to create and manage devices using the `tag:k8s` tag.

I stored the OAuth client ID and secret in my Infisical project under the `/tailscale` path.

From there, an `InfisicalStaticSecret` resource tells the Infisical operator to synchronize those credentials into a Kubernetes Secret named `operator-oauth`.

The Tailscale Helm release reads its credentials from that Secret rather than having the values embedded in its configuration.

This keeps the actual credentials out of Git while still allowing the rest of the deployment to be managed through Flux.

### Working Through the Flux Dependencies

This was another deployment where Flux's dependency management ended up being pretty useful.

At first glance, installing the Tailscale operator seems like something that could just be included with the rest of my platform components.

The problem is that the operator needs its OAuth credentials before it can start, and those credentials come from Infisical.

My base platform deployment also includes the components responsible for running the secrets infrastructure.

If I put the Tailscale operator directly into that same group and configured Flux to wait for everything to become healthy, I'd end up with a circular dependency.

Flux would be waiting for the Tailscale operator to start, while the operator would be waiting for credentials that couldn't be synchronized until the platform was ready.

To avoid that, I split the Tailscale deployment into three Flux Kustomizations.

| Kustomization       | Purpose                                                           |
| ------------------- | ----------------------------------------------------------------- |
| `tailscale-secrets` | Retrieves the OAuth credentials from Infisical.                   |
| `tailscale`         | Installs the Tailscale operator after the credentials exist.      |
| `tailscale-access`  | Creates the private access resources after the operator is ready. |

The first Kustomization depends on my existing Infisical authentication setup.

Once the credentials have been synchronized successfully, Flux can install the Tailscale operator.

Finally, the access configuration is applied after the operator and its custom resource definitions are available.

This avoids having Flux attempt to create resources that Kubernetes doesn't recognize yet.

It also means a missing OAuth client shows up as an unhealthy secrets Kustomization rather than a confusing failure somewhere later in the deployment.

## Configuring Private Access

### Using ProxyGroups

For the actual service access, I decided to use Tailscale ProxyGroups.

A ProxyGroup allows multiple Tailscale proxy replicas to work together to expose Kubernetes resources.

I created two separate ProxyGroups:

- **`homelab-apiserver`** — Provides authenticated access to the Kubernetes API.
- **`admin-ingress`** — Handles private access to web-based administrative services.

Both are configured with two replicas.

I liked this approach because it gives me some redundancy without needing to deploy an entirely separate Tailscale instance for every application.

It also keeps Kubernetes API access separate from the web interfaces I use for administration.

The Kubernetes API ProxyGroup uses Tailscale's authenticated API proxy mode, while the admin ingress group handles regular HTTPS application traffic.

### Making Headlamp and Infisical Available

Once the ProxyGroups were running, I configured Kubernetes Ingress resources for Headlamp and Infisical.

Both applications already existed in the cluster, so I didn't need to change how they were deployed.

I left the Ingress configuration in their Helm charts disabled and created separate Ingress resources using the `tailscale` ingress class.

Those Ingresses reference the `admin-ingress` ProxyGroup, which handles making them available on my tailnet.

I can now access the services using Tailscale hostnames:

- **Headlamp** — `https://headlamp.<tailnet>.ts.net`
- **Infisical** — `https://infisical.<tailnet>.ts.net`
- **Kubernetes API** — `homelab-apiserver.<tailnet>.ts.net`

I also updated Infisical's `SITE_URL` setting to use its new Tailscale hostname instead of the localhost address I'd used during the initial setup.

That gives Infisical a consistent address that I can use from any device connected to my tailnet.

None of these applications need a public Ingress under `laultlab.com`, and they aren't published through Cloudflare Tunnel.

## Restricting Access with Tailscale Policies

Getting the services connected to Tailscale was only part of the setup.

I also wanted to make sure that simply being connected to my tailnet didn't automatically grant access to the cluster's administrative interfaces.

For this, I used Tailscale's access policies and device tags.

The operator runs under `tag:k8s-operator`, and the proxies it creates use `tag:k8s`.

I configured the tag ownership rules so the operator can manage the proxy devices without giving unrelated tailnet devices that ability.

I then created grants allowing tailnet administrators to connect to the Kubernetes proxy devices over HTTPS.

This means access is controlled by Tailscale's policies rather than relying only on whether someone knows the hostname.

### Kubernetes API Authentication

The Kubernetes API required a little more thought because network access alone shouldn't automatically mean someone can administer the cluster.

Tailscale supports Kubernetes API authentication through identity-based impersonation.

I configured an access grant that allows members of my tailnet's administrator group to impersonate the Kubernetes `system:masters` group.

That group already has full administrative permissions in Kubernetes, so this effectively gives authorized tailnet administrators cluster-admin access through the Tailscale API proxy.

It's a pretty powerful permission, which is why I restricted it to the administrator group rather than allowing every device on the tailnet.

This also means I don't need to maintain a list of individual email addresses in the repository to identify who should have access.

The tailnet policy determines which identities can use the API proxy, while Kubernetes handles the permissions associated with the impersonated group.

For my personal homelab, this gives me a convenient way to manage the cluster remotely while keeping access restricted.

### Headlamp Authentication

Headlamp works a little differently.

Even though Tailscale controls who can reach the Headlamp web interface, Headlamp still needs Kubernetes credentials to perform administrative actions.

I intentionally left its service-account-token shortcut disabled rather than having the web interface automatically authenticate using the credentials of its own pod.

Instead, I created a dedicated `headlamp-admin` service account with cluster-admin permissions.

When I need to log in, I generate a short-lived token:

```bash
kubectl create token headlamp-admin \
  -n headlamp \
  --duration=8h
```

I then use that token to authenticate through the Headlamp interface.

It's an extra step, but I prefer having an explicit login process rather than automatically granting anyone who reaches the UI an administrative session.

The token expires after eight hours, and I don't store it in Git.

## Testing Remote Access

Once everything was deployed, I wanted to make sure I could actually manage the cluster without depending on my local network.

For the Kubernetes API, I used Tailscale's CLI to configure a kubeconfig entry for the proxy:

```bash
tailscale configure kubeconfig \
  homelab-apiserver.<tailnet>.ts.net
```

I then tested it with:

```bash
kubectl get nodes
```

The goal was to verify that I could reach the Kubernetes API through Tailscale and authenticate using the permissions I'd configured in the tailnet policy.

I also tested accessing Headlamp and Infisical through their Tailscale hostnames from a device connected to the tailnet.

Both services were available over HTTPS without being exposed through my public Cloudflare Tunnel.

That confirmed the separation I wanted between public-facing applications and internal administrative services.

## A Few Things I Like About This Setup

Probably the biggest improvement is that I can administer the homelab remotely without exposing its management interfaces publicly.

I don't have to open ports on the router or connect through a separate jump host just to use `kubectl` or access the cluster dashboard.

I also like that the Tailscale operator manages the proxy devices for me.

Instead of configuring individual Tailscale clients for every Kubernetes service, I can use Ingress resources and ProxyGroups to define what I want to expose.

Using two replicas per ProxyGroup gives me some flexibility if an individual proxy pod goes down, although I still want to test that properly.

And since everything is managed through Flux, changes to the Kubernetes-side configuration follow the same GitOps workflow as the rest of my homelab.

The OAuth credentials are handled by Infisical, so I don't need to manually manage those values in my Kubernetes manifests either.

## What I'd Like to Improve

There are still a few things I'd like to revisit:

- **Failover testing** — Stop individual proxy replicas and verify that API and web access continue working.
- **Access policy testing** — Verify that non-administrator tailnet identities cannot access the management services or use the Kubernetes API impersonation permissions.
- **Headlamp authentication** — Explore whether I want to keep using short-lived Kubernetes tokens or eventually move to a more integrated authentication solution.
- **Monitoring** — Add visibility into the Tailscale operator and proxy health.
- **Disaster recovery** — Document what needs to be restored in Tailscale, Infisical, and Kubernetes to bring private access back after a cluster rebuild.

## Final Thoughts

This was another project where most of the individual pieces weren't especially complicated, but getting them to work together took some planning.

The Tailscale operator itself was fairly straightforward to deploy. The more interesting parts were figuring out how to handle OAuth credentials through Infisical, organizing the Flux dependencies, and making sure administrative access was restricted properly.

I also liked being able to reuse the Headlamp and Infisical deployments without changing how those applications were running.

They just needed an additional private access path.

Now I have a pretty clean separation between how I publish applications and how I manage the infrastructure behind them.

Cloudflare handles the applications I want to make public, while Tailscale handles the services I want to keep private.

It's a convenient setup for my homelab, and it makes it much easier to manage the cluster from somewhere other than my desk.
