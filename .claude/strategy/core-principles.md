# Core Principles

**Last Updated:** April 13, 2026

---

Groundwork is built on five core principles that guide every decision, from code structure to feature design. These are not aspirations — they are hard requirements.

---

## 1. TDD Red — Tests Are the Design Phase

**Tests come first.** Before implementing any feature, write failing (Red) tests that define what the code should do. The test suite is the executable specification.

**Process:**

1. **RED** — Write a failing test that defines one behavior
2. **GREEN** — Write the minimum code to make it pass
3. **REFACTOR** — Clean up while tests stay green
4. **REPEAT** — Next behavior, next Red test

**Why this works:**

- Tests force you to think about the API before the implementation
- You only write code that's actually needed (no YAGNI violations)
- Refactoring is safe — tests catch regressions immediately
- The test suite becomes living documentation

**Testing layers:**

| Layer                   | Write Red tests for                 | How                                      |
| ----------------------- | ----------------------------------- | ---------------------------------------- |
| **Pure functions (TS)** | API shape, edge cases, error paths  | Unit tests (Vitest) -- pure input/output |
| **Hooks (TS)**          | Derived state, side effects, guards | `renderHook` when worth it               |
| **Components (TS)**     | Renders with expected props         | Snapshot or minimal render               |
| **User journeys**       | Full flows (login → create → view)  | E2E tests (Playwright)                   |

**Example:**

```typescript
// RED: Define behavior
describe("createSession", () => {
  it("creates a session with valid data", async () => {
    const input = { date: "2026-04-13", type: "gi", duration: 90 };
    const session = await SessionService.create(input);
    expect(session).toMatchObject(input);
  });
});

// GREEN: Implement
export class SessionService {
  static async create(input: CreateSessionInput) {
    return db.insert(sessions).values(input).returning();
  }
}

// REFACTOR: Extract, clean up, optimize
```

---

## 2. Go With the Grain

**Use tools as designed.** Don't fight frameworks or libraries. Read the docs, follow conventions, and resist the urge to over-engineer.

**Examples:**

| Tool            | Go with the grain                       | Against the grain                 |
| --------------- | --------------------------------------- | --------------------------------- |
| **Next.js**     | Use App Router, server components, RSC  | Recreate getServerSideProps       |
| **React Query** | Use `queryOptions`, `select` transforms | Fetch in `useEffect` manually     |
| **Drizzle**     | Use query builder, relational queries   | Write raw SQL strings everywhere  |
| **Tailwind**    | Use utility classes, design tokens      | Write custom CSS for every layout |
| **NextAuth**    | Use `useSession()`, middleware for auth | Rebuild JWT verification          |

**Why this matters:**

- Frameworks are designed by experts who've solved common problems
- Going against the grain creates maintenance burden
- Tools evolve — fighting them means you're on your own
- The grain is usually the happy path with the best DX

**Decision test:**

- If the docs say "this is the recommended way," that's the way.
- If you're writing a workaround, ask: "Am I solving a real problem or fighting the tool?"

---

## 3. Modularity is Our Bread and Butter

**One compartment is a bento box.** Each piece of the codebase — session, entry, user profile — is a self-contained unit with clear boundaries.

**What this means:**

- **One feature per package** — `@groundwork/core` doesn't become a dumping ground. If a feature grows large enough, it becomes its own package.
- **One export per file** — Components, hooks, functions: each gets its own file. No `utils.ts` grab bags.
- **Composition over inheritance** — Small pieces that work together. Compound components, not mega-props.
- **Clear interfaces** — Packages export stable APIs. Internal structure can change without breaking consumers.

**Structure mirrors responsibility:**

```
packages/core/
├── clients/        # Public API (sessions, user, auth)
├── queries/        # Read path (React Query)
├── services/       # Write path (mutations)
├── adapters/       # Backend integration (Turso, NextAuth)
└── types/          # Domain types
```

Each layer has a single responsibility. Each file in a layer has one export. Each export does one thing.

**Why modularity wins:**

- Easy to find code — directory structure is your table of contents
- Easy to test — small units with clear inputs/outputs
- Easy to replace — swap an adapter without touching the client
- Easy to reason about — no hidden coupling or circular dependencies

---

## 4. Abstraction is the Goal

**Hide implementation details.** The app should import from `@groundwork/core`, never from Drizzle, LibSQL, or NextAuth.

**Abstraction layers:**

```
┌─────────────────────────────────────────┐
│  apps/web                               │  ← Knows about: sessions, users
│  import { core } from '@groundwork/core'       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  @groundwork/core (clients/queries/services)   │  ← Knows about: domain logic
│  No tech names in API                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Adapters (Turso, NextAuth)                │  ← Knows about: Drizzle, LibSQL
│  Only layer that imports backend libs   │
└─────────────────────────────────────────┘
```

**Rules:**

1. **No technology names in public API** — `core.sessions.listQueryOptions()`, not `core.sessions.getTursoSessions()`
2. **Domain concepts only** — `core.user.meQueryOptions()`, not `core.user.nextAuthProfile()`
3. **Transport-agnostic** — Swap Turso for Postgres without changing the UI

**Why abstraction is critical:**

- **Flexibility** — Replace Turso with local SQLite for offline mode without touching the app
- **Testability** — Mock `@groundwork/core` instead of mocking Drizzle internals
- **Cost control** — Swap expensive services for cheaper ones without rewriting the UI
- **Future-proof** — Your app doesn't break when backend libraries change

**Example:**

```tsx
// ❌ WRONG: Leaking implementation
import { db } from "@groundwork/core/adapters/turso";
const sessions = await db.select().from(sessions);

// ✅ CORRECT: Abstract API
import { core } from "@groundwork/core";
const { data: sessions } = useQuery(core.sessions.listQueryOptions());
```

---

## 5. Config as Code (Simplified)

**Configuration is explicit and versioned.** No hidden toggles, no runtime surprises. For Groundwork, this is simpler than bnto (no feature flags, no PostHog, no complex config).

**What we config:**

- **Environment variables** — Database URL, auth keys, deployment env
- **Type-safe schema** — Drizzle schema is the source of truth for DB structure
- **Design tokens** — Tailwind config defines spacing, typography, colors

**What we DON'T config:**

- **Feature flags** — Not needed for MVP. Ship features when ready, don't toggle them.
- **Runtime toggles** — No user-specific settings yet. Everyone gets the same experience.
- **A/B tests** — Premature. Focus on shipping one great experience.

**Why simple config wins:**

- Less abstraction = less to go wrong
- Easier onboarding — clone, set env vars, run
- Predictable — no "works on my machine" with different flags

**Config files:**

| File                         | Purpose                                |
| ---------------------------- | -------------------------------------- |
| `.env.local`                 | Secrets (Turso URL, NextAuth keys)     |
| `packages/core/db/schema.ts` | Database schema (Drizzle)              |
| `tailwind.config.ts`         | Design tokens (spacing, colors, fonts) |
| `next.config.ts`             | App config (PWA, rewrites, env)        |

**Future config (post-MVP):**

- **User preferences** — Theme, default session type, time format
- **Instructor mode** — Enable class planning features

---

## Trust Commitments

These are **non-negotiable promises** we make to users. If we violate these, we've failed.

### 1. Free Tier Never Gets Worse

**Promise:** The free tier will never have features removed or limits reduced.

**Why:** Users trust us with their training data. Pulling the rug out is unethical.

**Example:** If the MVP includes unlimited sessions for free, we never add a session cap retroactively.

### 2. Core Journal Functionality is Free Forever

**Promise:** Logging sessions, viewing your timeline, and exporting your data will always be free.

**Why:** The journal is sacred. Users should never be locked out of their own training history.

**Future monetization (if needed):**

- Advanced analytics (e.g., technique heatmaps)
- Instructor mode (class planning, student tracking)
- Premium content (technique library with pro videos)

**Never monetize:**

- Session logging
- Viewing past sessions
- Exporting your data

### 3. No Dark Patterns

**Promise:** No manipulative UI, no hidden fees, no bait-and-switch.

**Examples of what we DON'T do:**

- "Only 2 spots left!" fake urgency
- Auto-renewing trials without clear disclosure
- Making it hard to cancel or export data
- Hiding the free tier behind a "contact sales" wall

**What we DO:**

- Clear pricing (free vs. paid tiers)
- One-click data export
- Easy account deletion

### 4. No Overpromising

**Promise:** We ship what we promise, or we don't promise it.

**Example:**

- If we say "offline mode coming soon," it ships in the next sprint or we remove the promise.
- No "coming soon" badges for features we haven't built yet.

### 5. User Owns Their Data — Always Exportable

**Promise:** Users can export their entire journal at any time, in open formats (JSON, Markdown).

**Why:** Vendor lock-in is toxic. If users want to leave Groundwork, they should take their data with them.

**Export formats:**

- **JSON** — Machine-readable, every field included
- **Markdown** — Human-readable, portable to other note apps

**Implementation:**

- Export button on profile page
- One-click download, no hoops
- Export includes ALL data (sessions, entries, metadata)

---

## Summary

| Principle             | What it means                               | Why it matters                         |
| --------------------- | ------------------------------------------- | -------------------------------------- |
| **TDD Red**           | Write tests before code                     | Forces design thinking, prevents bloat |
| **Go With the Grain** | Use tools as designed                       | Less friction, better DX, less bugs    |
| **Modularity**        | One thing per file/package/function         | Easy to find, test, replace            |
| **Abstraction**       | Hide implementation, expose domain concepts | Flexibility, testability, future-proof |
| **Config as Code**    | Explicit, versioned configuration           | Predictable, no surprises              |

**Trust Commitments:**

1. Free tier never gets worse
2. Core journal is free forever
3. No dark patterns
4. No overpromising
5. User owns their data

These principles aren't negotiable. They're the foundation of Groundwork.
