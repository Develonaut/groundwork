# Groundwork — Build Plan

**Last Updated:** April 13, 2026
**Brand:** Groundwork (`groundwork.zone`)
**This is the single source of truth for what's been built, what's in progress, and what's next.**

---

## How This Works

Tasks are organized into **sprints** (features) and **waves** (parallel work). All tasks in a wave can be picked up in parallel. Waves must complete in order.

```
- [ ]              → available
- [ ] **CLAIMED**  → being worked on
- [x]              → done
```

---

## Current State

**Status:** Sprint 1 (MVP)

**What exists:**

- [x] Monorepo structure (pnpm + Turborepo)
- [x] `apps/web` — Next.js 16 scaffold
- [x] `packages/core` — types + barrel export
- [x] `packages/ui` — cn() utility + barrel export
- [x] Tooling — ESLint, Prettier, Lefthook, Taskfile
- [x] Docs — architecture, rules, design language, decisions
- [x] GitHub repo + initial commit

**What's next:** Sprint 1 — ship the MVP

---

## Sprint 0: Infrastructure Setup — COMPLETE

Monorepo bootstrapped, packages initialized, docs written, repo pushed.

---

## Sprint 1: MVP — The Absolute Minimum

**Goal:** Ship a working journal. Create session, view sessions. That's it.

**KISS means feature simplicity, not architectural shortcuts.** The core API, store pattern, UI components, and layered architecture are built properly from the start — following bnto's proven patterns. What's simple is the _feature set_: date + notes, no auth, no database, no metadata.

### Wave 1 — Core Data Layer

Build `@groundwork/core` with the full client/store/service architecture. MVP adapter is a Zustand persisted store (localStorage). When Sprint 2 adds Turso, we swap the adapter — everything above stays the same.

- [ ] Port `createEnhancedStore` factory from bnto (Zustand + immer + persist)
- [ ] Session types — `{ id, date, notes, createdAt }`
- [ ] Zod schema for session validation
- [ ] Sessions store — `createEnhancedStore` with persist middleware (localStorage)
- [ ] Sessions client — owns store, exposes `create()`, `remove()`, `get()`, `store`
- [ ] Sessions hooks — `useSessions()`, `useCreateSession()`
- [ ] Wire up `core` singleton — `core.sessions` namespace
- [ ] Tests for validation, store, client, hooks

### Wave 2 — UI Components (Swiss Design)

Build `@groundwork/ui` components styled with Swiss Design tokens. These are shadcn/ui primitives copied in and styled.

- [ ] Tailwind config with Swiss Design tokens (8px grid, monochrome palette, type scale)
- [ ] `Button` component (primary/secondary variants)
- [ ] `Input` component
- [ ] `Textarea` component
- [ ] `Card` component (for session display)

### Wave 3 — Journal App

Compose `@groundwork/core` + `@groundwork/ui` into the journal experience.

- [ ] Journal page — session creation form (date input + textarea + save button)
- [ ] Journal page — session list (newest first, date + truncated notes)
- [ ] Session detail page — full notes view
- [ ] Swiss Design layout (typography, whitespace, grid, mobile-first)

### Wave 4 — Ship

- [ ] Test on mobile Safari + Chrome
- [ ] Verify sessions persist across page reload
- [ ] Deploy to Vercel
- [ ] Get 5 people to test for 1 week

**Success criteria:**

- [ ] Can create session in < 30 seconds
- [ ] Sessions persist across reload
- [ ] Works on mobile
- [ ] Looks zen and clean

---

## Sprint 2: Make It Real

**Goal:** Add auth + database. Move from persisted Zustand store to Turso backend.

**This is when React Query enters the picture** — async server state alongside Zustand stores. Add Turso adapter, swap persistence layer, keep the same public API.

### Wave 1 — Database

- [ ] Drizzle schema: sessions table (add `userId`, `type`, `duration`)
- [ ] Turso adapter in `@groundwork/core`
- [ ] React Query integration — `queryOptions` in services
- [ ] Hooks blend persisted store + live server data (like bnto's `useAuth`)
- [ ] Tests for data layer

### Wave 2 — Auth

- [ ] NextAuth setup (magic link, passwordless)
- [ ] Auth adapter + auth client + auth store in `@groundwork/core`
- [ ] Sign in / sign up pages
- [ ] Protected routes
- [ ] Migrate localStorage sessions to user account on first login

### Wave 3 — Enhancements

- [ ] Session metadata: gi/no-gi toggle, duration
- [ ] Export: download all sessions as JSON/Markdown
- [ ] Basic markdown rendering in session view

### Wave 4 — Deploy

- [ ] Turso production database
- [ ] NextAuth production config
- [ ] Deploy to Vercel
- [ ] 10+ users testing

---

## Sprint 3+: TBD

**Don't plan too far ahead.** Wait for Sprint 2 user feedback.

**Potential features:** Technique tags, search, dark mode, calendar view, session templates.

**Decision point:** After Sprint 2 ships, survey users, pick top 2-3 requests.

---

## What We're NOT Building (Yet)

- Technique library
- Social features
- Instructor tools
- Analytics / charts
- Competition tracking

**Focus:** Journal first. Everything else is a distraction.

---

## Reference Docs

| Document                                   | Purpose                                       |
| ------------------------------------------ | --------------------------------------------- |
| `.claude/ROADMAP.md`                       | Product vision and milestones                 |
| `.claude/strategy/design-language.md`      | Swiss Design implementation guide             |
| `.claude/decisions/001-stack-selection.md` | Tech stack rationale                          |
| `.claude/decisions/002-brand-name.md`      | Brand identity (Groundwork / groundwork.zone) |
| `.claude/rules/`                           | Code standards, architecture rules            |
