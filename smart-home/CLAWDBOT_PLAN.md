# Clawdbot on k3s (RPi) Plan

## Summary
- Build an arm64 Clawdbot image (Docker docs build locally) and run it in k3s.
- Persist Clawdbot config/workspace and token on `/mnt/t5/config/clawdbot`.
- Add k8s manifests (PV/PVC + Deployment + Service + optional Ingress) in the existing `smart-home` namespace.

## Assumptions from docs (verify)
- Docker flow builds the gateway image and writes a gateway token to `.env`.
- Config/workspace are written on the host in `~/.clawdbot/` and `~/clawd`.
- Control UI is on port `18789`.

## Decisions
- Namespace: reuse `smart-home`.
- Secrets: store `.env` and other sensitive files on `/mnt/t5/config/clawdbot` (mounted RW) instead of k8s Secrets.
- Image distribution: local registry or per-node image import; no need to publish to Docker Hub.
- Base image: prefer minimal if compatible; verify whether Clawdbot's Dockerfile can be switched to alpine safely.

## TODO
- [ ] Read upstream Docker docs + Dockerfile to confirm ports, env vars, and required mounts.
- [ ] Decide image flow:
  - [ ] Build locally and `ctr images import` on both nodes, or
  - [ ] Run a local registry in-cluster and push the image there.
- [ ] Create storage layout on `/mnt/t5/config/clawdbot`:
  - [ ] `/mnt/t5/config/clawdbot/.clawdbot`
  - [ ] `/mnt/t5/config/clawdbot/clawd`
  - [ ] `/mnt/t5/config/clawdbot/.env` (token + settings)
- [ ] Add k8s YAMLs in `smart-home/`:
  - [ ] `clawdbot.pv.yml` + `clawdbot.pvc.yml` (RWX hostPath to `/mnt/t5/config/clawdbot`)
  - [ ] `clawdbot.deploy.yml` (mounts, env, probes, nodeSelector, imagePullPolicy)
  - [ ] `clawdbot.service.yml` (expose UI port)
  - [ ] `clawdbot.ingress.yml` (optional)
- [ ] Bootstrap token:
  - [ ] Run a one-off CLI pod/job to `onboard`, writing `.env` to `/mnt/t5/config/clawdbot`.
  - [ ] Deploy gateway and verify UI loads + token works.
- [ ] Validate persistence and restart behavior across nodes.
