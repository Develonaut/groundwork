# ADR 003: Infrastructure — Vercel + GitHub Actions (Tag-Based Deploys)

**Status:** Accepted
**Date:** April 13, 2026
**Deciders:** Ryan

---

## Context

Groundwork builds and runs locally but has no CI/CD, no Vercel project config, and no deployment pipeline. We need infrastructure that:

1. Runs checks (format, lint, typecheck, build, test) on every pull request
2. Deploys to production via an explicit, controlled trigger
3. Costs $0 (Vercel free tier + GitHub Actions free tier)
4. Is simple enough for a solo developer, extensible for a team

## Decision

### Tag-based releases via GitHub Actions

Deploys are triggered by pushing semver tags (`v0.1.0`, `v1.0.0-rc.1`), not by pushing to `main`. This is the same pattern used by bnto.

**Why not Vercel auto-deploy from main?**

- Auto-deploy means every merge to main goes to production immediately
- No gate between "code merged" and "code deployed"
- No preview step before production
- Pre-release versions (`v1.0.0-beta.1`) have no natural representation

**Why tag-based?**

- Explicit intent: you choose when to release
- Preview before production: the release pipeline deploys preview first, then production
- Pre-release support: tags containing `-` (e.g., `v0.2.0-rc.1`) deploy preview only, skipping production
- Matches semantic versioning: the tag IS the version
- Easy rollback: revert the tag or push a new patch version

### CI on every pull request

A single CI workflow runs on every PR to `main`:

1. `pnpm format:check`
2. `pnpm lint`
3. `pnpm build` (includes TypeScript typecheck)
4. `pnpm test`

Concurrency group cancels stale runs when you push again to the same PR.

### Release pipeline (3 jobs)

```
ci (gate) → deploy-preview → deploy-production
```

- **CI Gate:** Same checks as PR CI. Ensures the tagged commit is clean
- **Deploy Preview:** Builds and deploys to a Vercel preview URL
- **Deploy Production:** Only runs for non-pre-release tags (no `-` in tag name)

### Vercel configuration

- `vercel.json` disables git auto-deploy (`git.deploymentEnabled: false`)
- Build command uses Turbo: `pnpm turbo run build --filter=@groundwork/web`
- Next.js uses `output: "standalone"` for self-contained builds
- `outputFileTracingRoot` points to monorepo root for correct dependency tracing

### Environment strategy

**MVP (Sprint 1):** No environment variables needed. The app uses localStorage via Zustand persist.

**Sprint 2 (when Turso + auth are added):**

| Secret                 | Where           | Notes                                              |
| ---------------------- | --------------- | -------------------------------------------------- |
| `VERCEL_TOKEN`         | GitHub Secrets  | Scoped to groundwork project                       |
| `VERCEL_ORG_ID`        | GitHub Secrets  | From Vercel project settings                       |
| `VERCEL_PROJECT_ID`    | GitHub Secrets  | From Vercel project settings                       |
| `TURSO_DATABASE_URL`   | Vercel env vars | Different per environment (preview=dev, prod=prod) |
| `TURSO_AUTH_TOKEN`     | Vercel env vars | Different per environment                          |
| `NEXTAUTH_SECRET`      | Vercel env vars | `openssl rand -base64 32`                          |
| `NEXTAUTH_URL`         | Vercel env vars | Auto-set by Vercel (`VERCEL_URL`)                  |
| `GITHUB_CLIENT_ID`     | Vercel env vars | From GitHub OAuth app                              |
| `GITHUB_CLIENT_SECRET` | Vercel env vars | From GitHub OAuth app                              |

### Auth provider: GitHub OAuth

For Sprint 2, we'll use GitHub OAuth via NextAuth. Rationale:

- Target audience (developers, BJJ practitioners) likely has GitHub accounts
- Zero cost (no third-party auth service)
- Simple setup (one OAuth app in GitHub Developer Settings)
- NextAuth handles session management, CSRF, token refresh

Can add Google/email providers later without architectural changes.

## Alternatives Considered

### Vercel auto-deploy from main

- Simpler setup (zero GitHub Actions config)
- No preview-before-production gate
- No pre-release support
- Rejected: too little control for a production app

### GitHub Actions deploy on push to main

- Every merge deploys automatically
- Still has CI gate, but no explicit versioning
- Rejected: tag-based gives explicit version control and pre-release support

### Self-hosted (Docker, fly.io, Railway)

- More control over infrastructure
- More operational overhead
- Costs money from day one
- Rejected: Vercel free tier is $0 and handles everything we need

## Consequences

- Every deploy requires a manual `git tag` + `git push origin <tag>`
- Developers must understand semver tagging
- Preview URLs are generated on every release (useful for QA)
- Pre-release tags deploy preview only (useful for staging)
- Future expansion: easy to add E2E tests and Lighthouse between preview and production jobs
