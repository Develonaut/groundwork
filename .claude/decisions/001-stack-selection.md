# Stack Selection

**Date:** April 13, 2026  
**Status:** Accepted  
**Context:** Initial technology choices for Groundwork monorepo

---

## Decision

We're building Groundwork as a **pnpm + Turborepo monorepo** with the following stack:

### Frontend & Build

- **Next.js 16** (App Router, React 19)
- **pnpm** workspaces (same as bnto)
- **Turborepo** for build orchestration
- **Tailwind CSS 4** for styling
- **shadcn/ui** for accessible component primitives + Swiss Design styling

### Backend & Data

- **Turso (LibSQL)** - SQLite in the cloud, HTTP API
- **Drizzle ORM** - Type-safe queries, migrations
- **NextAuth.js** - Self-hosted auth, completely free

### Deployment

- **Vercel** (free tier) - serverless Next.js deployment

### State Management

- **React Query** - Server state
- **Zustand** (when needed) - Client state
- **URL state** - Filters, tabs, navigation

---

## Rationale

### Why Monorepo (Same as bnto)

Following bnto's proven pattern:

- **Clean boundaries** - `@groundwork/core` abstracts the data layer
- **Package extraction** - Start small, extract patterns as they emerge
- **Reusability** - `@groundwork/ui` provides Swiss Design components
- **Bento Box Principle** - Small, focused packages that compose

### Why This is Simpler than bnto

Groundwork doesn't need:

- ❌ Rust/WASM (no heavy computation)
- ❌ Convex (no real-time collaboration)
- ❌ Multiple execution targets (CLI, browser, desktop)
- ❌ Complex workflow engine

We DO need:

- ✅ Simple CRUD for journal entries
- ✅ Clean architecture for future features
- ✅ Zero cost to start
- ✅ Exportable data (user owns their content)

### Technology Choices

#### Turso + Drizzle (vs Convex)

- **Free tier:** 500 DBs, 9GB storage, 1B row reads/month
- **SQLite semantics:** Familiar, portable, exportable
- **HTTP API:** No connection pooling needed
- **Local-first ready:** Can sync to local SQLite later
- **No lock-in:** It's just SQL

vs. Convex (bnto's choice):

- Convex is amazing for real-time, but overkill for a journal
- Turso is simpler and gives us more control
- Same Drizzle patterns work with other SQL databases

#### NextAuth.js (vs Clerk/Convex Auth)

- **Completely free:** No user limits, no pricing tiers
- **Self-hosted:** We control the auth flow
- **Standard OAuth:** Google, GitHub, magic links
- **Session handling:** Built-in JWT or database sessions
- **Vercel-native:** Built by Vercel team, first-class Next.js support

vs. Clerk (considered):

- Clerk has great DX with pre-built components, but adds a vendor dependency
- NextAuth is battle-tested, self-hosted, and zero cost at any scale
- No MAU limits — we never hit a ceiling

#### shadcn/ui (vs component library)

- **Copy-paste approach:** Not a dependency, fully customizable
- **Radix UI primitives:** Accessible, composable, unstyled
- **Tailwind-based:** Perfect for Swiss Design customization
- **No framework lock-in:** Components live in our codebase
- **Swiss Design enforcement:** We style with typography, grids, whitespace

vs. Component libraries:

- Most libraries impose their design opinions
- shadcn/ui is unstyled primitives - we apply Swiss Design
- Full control over every detail

---

## Architecture

```
apps/web (Next.js PWA)
  ↓
@groundwork/core (transport-agnostic API)
  ↓ adapters/
  ├─ turso (Drizzle queries)
  └─ auth (NextAuth session)
  ↓
Turso Database (LibSQL)
```

**Core principles from bnto:**

- Apps never import from database directly
- `@groundwork/core` is the **only** place that knows about Turso
- Hooks use React Query for server state
- Components import from `@groundwork/core` and `@groundwork/ui`

---

## Design Language

**Swiss Design / International Typographic Style:**

- Typography-first (let the type fill the space)
- Grid-based layouts (8px baseline)
- Black/white/grey + one accent color
- 60-70% intentional whitespace
- Sans-serif typefaces (system fonts)
- Asymmetric balance

See `.claude/strategy/design-language.md` for full details.

---

## Future Considerations

### What we can add later

- **Voice-to-text:** Browser SpeechRecognition → Whisper API
- **Local-first sync:** Turso → local SQLite with sync
- **Desktop app:** Tauri (same React code, native SQLite)
- **Technique library:** Add content tables, keep same architecture

### What we explicitly DON'T need

- Real-time collaboration (it's a personal journal)
- Complex workflow orchestration (bnto's domain)
- Multiple execution targets (web is primary)

---

## Cost Breakdown

| Service   | Free Tier             | Our Usage           | Cost   |
| --------- | --------------------- | ------------------- | ------ |
| Turso     | 9GB storage, 1B reads | < 100MB, < 1M reads | **$0** |
| Vercel    | 100GB bandwidth       | < 10GB              | **$0** |
| NextAuth  | Self-hosted           | Self-hosted         | **$0** |
| shadcn/ui | Copy-paste            | Copy-paste          | **$0** |
| **Total** |                       |                     | **$0** |

---

## Related Docs

- [architecture.md](../rules/architecture.md) - Package boundaries
- [core-api.md](../rules/core-api.md) - Core abstraction patterns
- [code-standards.md](../rules/code-standards.md) - Bento Box Principle
- [design-language.md](../strategy/design-language.md) - Swiss Design principles

---

## Revision History

- **2026-04-13:** Initial stack selection
- **2026-04-13:** Updated UI library from neobrutalism-components to shadcn/ui
- **2026-04-13:** Confirmed NextAuth.js as auth provider
