---
title: "Publishing My K3s Homelab with Cloudflare Tunnel"
description: "Setting up Cloudflare Tunnel with Kubernetes, Traefik, Flux CD, and Infisical to securely expose homelab applications without opening inbound ports."
technologies:
  [
    "Kubernetes",
    "K3s",
    "Cloudflare",
    "cloudflared",
    "Traefik",
    "Flux CD",
    "Infisical",
  ]
type: "Personal"
status: "active"
year: 2026
featured: false
draft: false
---

## Overview

After getting my K3s cluster running and setting up Traefik for ingress, I wanted to start making some of my applications accessible outside my home network.

At that point, I already had everything working locally. I could access my test application at `hello.home.arpa`, with traffic going through kube-vip, Traefik, and into Kubernetes.

That was great for testing things on my LAN, but I wanted to be able to access certain applications from anywhere without needing a VPN.

I also didn't really want to deal with forwarding ports on my router, exposing my home IP address, or managing public HTTPS certificates for every application.

I decided to use Cloudflare Tunnel, which lets applications be exposed through Cloudflare without opening inbound ports on the network.

The basic idea is that I run a few `cloudflared` containers inside Kubernetes. Those containers establish outbound connections to Cloudflare, and Cloudflare sends requests through those connections to Traefik.

Since Traefik was already handling hostname-based routing inside the cluster, I could reuse that setup rather than building an entirely separate ingress system.

I also wanted the deployment managed by Flux, with the tunnel credentials stored in Infisical instead of Git.

## Technology Stack

- **Cloudflare Tunnel** — Provides public access to selected applications without requiring inbound port forwarding.
- **cloudflared** — Runs the tunnel connectors inside Kubernetes, using three replicas for redundancy.
- **Traefik** — Handles routing requests from the tunnel to the correct Kubernetes Services.
- **Flux CD** — Deploys and manages the cloudflared configuration from my Git repository.
- **Infisical** — Stores the tunnel token and synchronizes it into Kubernetes.
- **K3s / Kubernetes** — Runs the connectors and applications.
- **Cloudflare DNS** — Handles the public DNS records for my homelab domain.

## How I Set It Up

### Reusing My Existing Traefik Setup

One of the nice things about this project was that I didn't need to change much of the networking I'd already configured.

During the original K3s deployment, I set up Traefik as the ingress controller and used kube-vip to give it a shared LAN address at `192.168.10.61`.

That lets devices on my local network reach applications through Traefik using Kubernetes Ingress rules.

For public access, I wanted to use that same Traefik installation.

Rather than sending Cloudflare traffic through the LAN virtual IP, I configured the tunnel to forward requests directly to Traefik's internal Kubernetes Service:

```text
http://traefik.kube-system.svc.cluster.local:80
```

Since cloudflared runs inside the cluster, it can reach Traefik using Kubernetes's internal DNS and networking.

The resulting traffic path looks like this:

```text
Browser
   |
   v
Cloudflare
   |
   v
Cloudflare Tunnel
   |
   v
cloudflared (Kubernetes)
   |
   v
Traefik
   |
   v
Kubernetes Ingress
   |
   v
Application Service
   |
   v
Application Pods
```

This keeps the public and local access paths separate while still using the same ingress controller.

Local traffic continues to use the kube-vip address, while public traffic enters through Cloudflare.

### Creating the Cloudflare Tunnel

I started by configuring `laultlab.com` in Cloudflare and creating a remotely managed tunnel named `homelab`.

With a remotely managed tunnel, the public hostname configuration lives in Cloudflare's dashboard rather than in a local configuration file.

I chose this approach because it was easy to manage, and I didn't need the Kubernetes deployment to know anything about individual public hostnames.

For the tunnel's origin, I used the internal Traefik Service address.

I also created a wildcard hostname for `*.laultlab.com`, which Cloudflare routes through the tunnel.

That means I don't need to configure a separate tunnel route every time I deploy another test application.

For example, I can deploy applications under hostnames like:

- `whoami.laultlab.com`
- `test.laultlab.com`
- `app.laultlab.com`

As long as Cloudflare forwards the request to Traefik, the Kubernetes Ingress configuration determines which application should receive it.

If Traefik doesn't have a matching Ingress rule, it returns a 404.

I also like that the wildcard doesn't force every hostname under the domain to use the tunnel. More specific DNS records can still be configured separately if needed.

### Deploying cloudflared in Kubernetes

Once the tunnel was created in Cloudflare, I needed to deploy the actual connectors inside Kubernetes.

I created a dedicated `cloudflare` namespace and a Deployment running the official `cloudflare/cloudflared` image.

I pinned the image to version `2026.10.1` rather than relying on the `latest` tag.

I also configured three replicas instead of just one.

Each cloudflared instance establishes its own outbound connections to Cloudflare, so having multiple replicas gives the tunnel more than one connector to use if an individual pod becomes unavailable.

I configured the Deployment to favor spreading those replicas across different worker nodes, and to avoid scheduling them on the Kubernetes control-plane nodes.

The containers also run as a non-root user with Linux capabilities dropped.

Since cloudflared doesn't need much in the way of compute resources, I gave each container fairly small resource requests.

The actual command is straightforward:

```bash
cloudflared tunnel \
  --no-autoupdate \
  --loglevel info \
  --metrics 0.0.0.0:2000 \
  run
```

I disabled automatic updates inside the container because I'd rather manage the cloudflared version through Git and Flux.

That way, updating the image is an intentional configuration change instead of something the container does on its own.

I also enabled the metrics endpoint on port `2000`, which provides a readiness endpoint that Kubernetes can use to determine whether the connector is healthy.

### Handling the Tunnel Token with Infisical

The Cloudflare Tunnel needs a token to authenticate its connectors.

Since I'd already deployed Infisical for secrets management, I wanted to use it rather than manually creating another Kubernetes Secret.

After creating the tunnel in Cloudflare, I copied its token into my Infisical project under the `/cloudflare` path.

I then created an `InfisicalStaticSecret` resource that tells the Infisical operator to retrieve the token and create a Kubernetes Secret named `tunnel-token` in the `cloudflare` namespace.

The cloudflared Deployment reads that Secret through the `TUNNEL_TOKEN` environment variable.

This means the actual tunnel token never needs to appear in Git.

Flux manages the Kubernetes manifests, while Infisical handles delivering the credential.

I also configured the Flux Kustomization to wait for the Infisical secret synchronization to succeed.

If the token hasn't been created in Infisical yet, the deployment won't be ready, and Flux reports that the required secret isn't available.

I prefer that over having a deployment appear successful while its containers are stuck waiting for credentials.

Once I added the token to Infisical, the operator synchronized it into Kubernetes, the cloudflared pods started, and Cloudflare showed the connectors as healthy.

### Managing the Deployment with Flux

Like the other infrastructure components in my homelab, the Cloudflare Tunnel deployment is managed through Flux.

I keep its Kubernetes manifests under:

```text
infrastructure/networking/cloudflare-tunnel/
```

A dedicated Flux Kustomization watches that directory and applies the configuration automatically.

It depends on the secrets infrastructure being ready and reconciles every minute.

The configuration includes the namespace, secret synchronization resource, and cloudflared Deployment.

If I want to update cloudflared, change its replica count, or adjust its Kubernetes configuration, I make the change in Git and push it.

Flux handles applying the update.

The one piece that doesn't currently live in Git is the remotely managed tunnel's public hostname configuration, which is maintained through Cloudflare's dashboard.

That means I still need to document the tunnel's routing settings separately in case I ever rebuild it.

## Testing with My Existing Whoami Application

For testing, I reused the Whoami application that I'd originally deployed while setting up K3s and Traefik.

Whoami is a simple HTTP application that responds with information about the request and the container handling it.

It was already running with three replicas and had an Ingress configured for `hello.home.arpa`.

Rather than deploying something new, I added another hostname to its existing Kubernetes Ingress:

```yaml
spec:
  ingressClassName: traefik
  rules:
    - host: hello.home.arpa
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: whoami
                port:
                  number: 80

    - host: whoami.laultlab.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: whoami
                port:
                  number: 80
```

After pushing the change to GitHub, Flux reconciled the updated Ingress.

Since Cloudflare already had the wildcard tunnel route configured, I didn't need to make any additional changes to the tunnel itself.

I could then open:

**https://whoami.laultlab.com**

And get the same Whoami response I was already getting locally through:

**http://hello.home.arpa**

The difference is how the requests reach the application.

The local hostname goes straight through my LAN to kube-vip and Traefik.

The public hostname goes through Cloudflare, across the tunnel, and into Traefik's internal Kubernetes Service.

Both eventually reach the same Kubernetes application.

I also tested what happens when a hostname matches the Cloudflare wildcard but doesn't have a corresponding Kubernetes Ingress.

In that case, Traefik returns a 404, which is what I'd expect.

That was a good way to confirm Cloudflare was forwarding traffic to Traefik rather than directly to a specific application.

## A Few Things I Like About This Setup

The biggest benefit is that I don't have to expose any inbound ports on my router to make applications accessible from the internet.

The cloudflared containers establish outbound connections to Cloudflare, so there's no need for traditional port forwarding.

It also means I can keep using the same Traefik configuration for both internal and external traffic.

For most new lab applications, all I need is a Deployment, Service, and Ingress with a hostname under `laultlab.com`.

The wildcard tunnel route handles getting the traffic into Kubernetes, and Traefik handles sending it to the correct application.

Another advantage is that the tunnel isn't tied to one particular Kubernetes node.

I'm running three connector replicas, and Cloudflare can use the available connections rather than relying on a single VM.

Finally, everything on the Kubernetes side is managed through GitOps, and the authentication token comes from Infisical.

That keeps the workflow consistent with how I'm managing the rest of the homelab.

## What I'd Like to Improve

There are a few things I still want to revisit:

- **Cloudflare Access** — Add authentication in front of selected applications that shouldn't be available to everyone on the internet.
- **Failover testing** — Intentionally stop cloudflared pods and verify that the remaining connectors continue serving traffic.
- **Monitoring** — Collect cloudflared metrics and add alerts for tunnel connectivity problems.
- **Configuration management** — Look into managing the Cloudflare-side tunnel configuration through Terraform or another infrastructure-as-code tool instead of relying entirely on the dashboard.

I'm also planning to continue using the tunnel for other applications as I move more services into Kubernetes.

## Final Thoughts

This ended up being one of the more straightforward additions to the cluster, mostly because I already had Traefik, Flux, and Infisical working.

Cloudflare Tunnel didn't require me to replace the existing ingress setup or make major changes to the network.

I just needed a way to get public traffic into Traefik, and cloudflared handles that pretty neatly.

The most satisfying part was being able to reuse the same Whoami application I'd deployed during the initial cluster setup. Adding one more hostname to its Ingress was enough to make it accessible through Cloudflare.

Now I can deploy a new application, give it an Ingress hostname under `laultlab.com`, and have it accessible from the internet without touching my router or creating another tunnel.

It's a nice improvement to the homelab, and it gives me a fairly simple way to publish applications as I continue building things out.
