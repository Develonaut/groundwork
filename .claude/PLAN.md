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

**Project:** Groundwork - A zen BJJ training journal  
**URL:** `groundwork.zone`  
**Design:** Swiss Design (typography-first, grid-based, 60-70% whitespace)  
**Philosophy:** KISS - Keep It Simple, Stupid  
**Status:** Sprint 0 (Infrastructure setup)

**What exists:**

- [x] Monorepo structure (pnpm + Turborepo)
- [x] Design language defined (Swiss Design)
- [x] Brand identity (Groundwork)
- [x] Tech stack selected
- [x] Documentation (`.claude/` dir)

**What's next:** Sprint 0 → Sprint 1 (MVP)

---

## Sprint 0: Infrastructure Setup

**Goal:** Bootstrap the monorepo. Copy infrastructure from bnto, adapt for Groundwork.

**Status:** In Progress (agent working)

### Wave 1 — Copy Infrastructure

- [ ] Copy from bnto: `.prettierignore`, `lefthook.yml`, `eslint.config.base.mjs`
- [ ] Copy from bnto: `.claude/rules/`, `.claude/skills/`
- [ ] Merge `.gitignore` (bnto + existing)

### Wave 2 — Adapt Docs

- [ ] Update `.claude/CLAUDE.md` (@bnto → @groundwork, remove Rust/Convex, add Turso/NextAuth)
- [ ] Update `.claude/rules/architecture.md` (3 packages: core/ui/web)
- [ ] Update `.claude/rules/core-api.md` (Turso adapter, not Convex)

### Wave 3 — Initialize Packages

- [ ] `packages/core`: package.json, tsconfig, src/index.ts, drizzle.config.ts
- [ ] `packages/ui`: package.json, tsconfig, src/index.ts, tailwind.config.ts (Swiss tokens)
- [ ] `apps/web`: Next.js 16, update package.json with workspace deps

### Wave 4 — Verify

- [ ] `pnpm install` succeeds
- [ ] `pnpm lint` runs (even if errors exist)
- [ ] `lefthook install` works
- [ ] Git init + first commit

---

## Sprint 1: MVP — The Absolute Minimum

**Goal:** Ship a working journal in 2 weeks. Create session → view sessions. That's it.

**Scope:** localStorage only, no auth, no database, no markdown rendering. KISS.

### Wave 1 — Core Setup (No Database Yet!)

**Decision:** Skip Turso for MVP. Use localStorage. Ship faster.

- [ ] `@groundwork/core`:
  - [ ] Session type: `{ id, date, notes, createdAt }`
  - [ ] Zod schema for validation
  - [ ] localStorage adapter (setItem/getItem)
  - [ ] React hooks: `useSessions()`, `useCreateSession()`

### Wave 2 — UI Components (Swiss Design)

- [ ] `@groundwork/ui`:
  - [ ] Tailwind config with Swiss Design tokens (8px grid, monochrome palette)
  - [ ] Typography components: `<Heading>`, `<Text>`
  - [ ] Layout: `<Container>`, `<Stack>`
  - [ ] Form: `<Input>`, `<Textarea>`, `<Button>`
  - [ ] `<Card>` for session display

### Wave 3 — Web App (The Actual MVP)

- [ ] `apps/web`:
  - [ ] `/app/page.tsx` - Main journal page
  - [ ] `<SessionForm>` component (date input + textarea + save button)
  - [ ] `<SessionList>` component (map over sessions, show cards)
  - [ ] `<SessionCard>` component (date + truncated notes)
  - [ ] Swiss Design layout (grid, whitespace, typography)
  - [ ] Mobile responsive

### Wave 4 — Polish & Ship

- [ ] Test on mobile Safari + Chrome
- [ ] Verify sessions persist across reload
- [ ] Clean up any console errors
- [ ] Deploy to Vercel at `groundwork.zone`
- [ ] Get 5 people to test for 1 week

**MVP Success Criteria:**

- [ ] Can create session in < 30 seconds
- [ ] Sessions persist
- [ ] Looks zen and clean
- [ ] 5 testers use it for 1 week

---

## Sprint 2: Make It Real

**Goal:** Add auth + database so it's a real product.

**Timeline:** 2-4 weeks after M1 ships

### Wave 1 — Database

- [ ] `@groundwork/core`:
  - [ ] Drizzle schema: sessions table
  - [ ] Turso adapter (replace localStorage)
  - [ ] Migration: create sessions table
  - [ ] Update hooks to use database

### Wave 2 — Auth

- [ ] `apps/web`:
  - [ ] NextAuth setup (magic link)
  - [ ] Sign in/sign up pages
  - [ ] Protected routes middleware
  - [ ] Migrate localStorage sessions on first login

### Wave 3 — Enhancements

- [ ] Session metadata: gi/no-gi toggle, duration field
- [ ] Markdown rendering (simple, no WYSIWYG yet)
- [ ] Export: download all sessions as JSON/Markdown

### Wave 4 — Deploy

- [ ] Turso production database
- [ ] NextAuth production config
- [ ] Deploy to Vercel
- [ ] 10+ users testing

---

## Sprint 3+: TBD

**Don't plan too far ahead.** Wait for M2 user feedback.

**Potential features:**

- Technique tags
- Search
- Dark mode
- Better markdown editor
- Calendar view
- Session templates

**Decision point:** After M2 ships, survey users, pick top 2-3 requests.

---

## What We're NOT Building (Yet)

- Technique library
- Social features
- Instructor tools
- Analytics/charts
- Competition tracking
- Video platform

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
