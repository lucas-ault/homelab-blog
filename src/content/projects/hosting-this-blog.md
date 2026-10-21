---
title: "Deploying the Homelab Blog on K3s"
description: "Publishing lucas.ault.cc from a private GHCR image, with Flux applying the manifests and Infisical supplying the pull credential."
technologies:
  ["Kubernetes", "K3s", "Flux CD", "Infisical", "GHCR", "Traefik", "Cloudflare"]
github: "https://github.com/lucas-ault/home-lab"
type: "Personal"
status: "active"
year: 2026
featured: true
draft: false
---

## Overview

The cluster could already serve a lab app on `laultlab.com`. The homelab blog is the first site I wanted on its own name.

It is a static nginx site, image `ghcr.io/lucas-ault/homelab-blog:latest`, published at `lucas.ault.cc`. The package is private. The manifests live in Git. The registry token does not.

Flux reconciles it from `applications/production`. The hostname is an explicit record on the existing Cloudflare tunnel, not a name under the lab wildcard.

## Technology Stack

- **homelab-blog** — Static nginx. Two replicas. No application environment.
- **GHCR** — `ghcr.io/lucas-ault/homelab-blog:latest`, pulled with `imagePullPolicy: Always`.
- **Infisical** — Path `/ghcr`, keys `GHCR_USERNAME` and `GHCR_TOKEN`. The operator writes a docker config Secret.
- **Flux CD** — `apps-production` applies `applications/production` after Infisical auth is ready.
- **Traefik** — Ingress host `lucas.ault.cc`, class `traefik`.
- **Cloudflare** — `ault.cc` zone. `lucas.ault.cc` is published on the existing `homelab` tunnel. TLS ends at Cloudflare.

## Why it is not on the lab zone

`*.laultlab.com` is the lab wildcard. Production sites get an explicit hostname so a lab name and a real site are not the same kind of DNS record.

`lucas.ault.cc` is that hostname. `ault.cc` is its own Cloudflare zone, on the same account as the tunnel. The wildcard CNAME for `laultlab.com` stays as it is.

## The manifests

The app is a directory under `applications/production`, listed from that environment's `kustomization.yaml`. Flux's `apps-production` Kustomization points at the directory, depends on `platform-secrets`, and prunes resources removed from Git.

Three files:

- Namespace `homelab-blog`.
- An `InfisicalStaticSecret` that builds the image pull Secret.
- The ServiceAccount, Deployment, Service, and Ingress.

There is no app Secret. The container does not read environment variables. The only credential is the one Kubernetes needs to pull the image.

The Deployment runs two replicas. Both must land on workers. The control-plane nodes are not tainted, so the pod spec requires `node-role.kubernetes.io/control-plane` to be absent. Preferred anti-affinity spreads the replicas across nodes. Requests are 10m CPU and 32Mi memory.

Readiness is `GET /` on port 80 after 2 seconds. Liveness is the same path, starting at 10 seconds. The Service is a ClusterIP on port 80.

```yaml
spec:
  ingressClassName: traefik
  rules:
    - host: lucas.ault.cc
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: homelab-blog
                port:
                  number: 80
```

The Ingress does not terminate TLS. Cloudflare does.

## Pulling a private image

The image is private on GHCR. GitHub username `lucas-ault` and a PAT with `read:packages` on this package go in Infisical project `homelab`, environment `prod`, path `/ghcr`, keys `GHCR_USERNAME` and `GHCR_TOKEN`.

The static secret renders those into Secret `ghcr-pull` in namespace `homelab-blog`, type `kubernetes.io/dockerconfigjson`:

```yaml
apiVersion: secrets.infisical.com/v1beta1
kind: InfisicalStaticSecret
metadata:
  name: ghcr-pull
  namespace: homelab-blog
spec:
  infisicalAuthRef:
    name: infisical-auth
    namespace: infisical
  sources:
    - projectSlug: homelab
      environmentSlug: prod
      secretPath: /ghcr
  targets:
    - name: ghcr-pull
      namespace: homelab-blog
      kind: Secret
      secretType: kubernetes.io/dockerconfigjson
      template:
        data:
          .dockerconfigjson: |
            {{- $auth := printf "%s:%s" .GHCR_USERNAME.Value .GHCR_TOKEN.Value | b64enc -}}
            {{- $entry := dict "username" .GHCR_USERNAME.Value "password" .GHCR_TOKEN.Value "auth" $auth -}}
            {{- dict "auths" (dict "ghcr.io" $entry) | mustToJson -}}
```

The ServiceAccount `homelab-blog` lists `ghcr-pull` under `imagePullSecrets`. The PAT is not committed.

`apps-production` can apply the manifests before `/ghcr` is filled. The pods stay unready until the operator has written the pull Secret and the kubelet can pull `ghcr.io/lucas-ault/homelab-blog:latest`. The operator polls about once a minute.

## Cloudflare

On the existing `homelab` tunnel, publish `lucas.ault.cc` to:

```text
http://traefik.kube-system.svc.cluster.local:80
```

That is the same origin the lab wildcard uses. Point DNS for `lucas.ault.cc` at the tunnel. A more specific record wins over any wildcard, and this name is not under `laultlab.com` anyway.

The request path is the same shape as a lab hostname:

```text
browser -> Cloudflare edge -> cloudflared -> traefik.kube-system:80 -> Ingress -> homelab-blog
```

TLS ends at Cloudflare. The origin is HTTP inside the cluster. Public traffic does not use the LAN ingress VIP.

## Shipping a new build

The manifest tag is `latest`, and `imagePullPolicy` is `Always`. A new package in GHCR does not replace pods that are already running. Those pods keep the image they started with. A new pod pulls `latest` again.

After the package is published:

```sh
kubectl rollout restart deployment/homelab-blog -n homelab-blog
kubectl rollout status deployment/homelab-blog -n homelab-blog
```

## Checks

```sh
kubectl get pods,ingress -n homelab-blog
kubectl get infisicalstaticsecret -n homelab-blog
```

Both pods should be Ready, on two different workers. The Ingress address is Traefik. `https://lucas.ault.cc` should return the site.

If the pods are `ImagePullBackOff`, the usual cause is `/ghcr` empty or the PAT missing `read:packages`. If the site is Traefik's 404, the Ingress host and the published Cloudflare hostname do not match. If the name does not resolve, DNS for `lucas.ault.cc` is not on the tunnel yet.

## What's Next?

The site is a static Deployment with a private image and one public name. A few follow-ups belong to this app:

- **Image identity** — `latest` plus a restart works. A pinned tag or digest would make Git say which build is running.
- **Rollout** — The restart is still a manual command. A webhook or a CI job could do it after GHCR publishes a package.
- **The other zone** — Leave `*.laultlab.com` for lab apps. New production sites get their own hostname on the tunnel, the same way this one did.

## Final Thoughts

This was the first production workload on the cluster, and it barely has any configuration. Two nginx replicas, one Ingress host, one pull Secret.

The work was in the split. Git describes the Deployment and the fact that GHCR needs a token. Infisical holds the token. Cloudflare holds the public name and the certificate. Flux applies the manifests once `platform-secrets` is ready, and the pods stay down until the pull Secret exists.

`https://lucas.ault.cc` answering from the cluster is the check that those pieces are actually connected.
