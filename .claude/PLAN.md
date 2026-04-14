# Groundwork — Build Plan

**Last Updated:** April 13, 2026
**Brand:** Groundwork (`groundwork.zone`)
**This is the single source of truth for what's been built, what's in progress, and what's next.**

---

## How This Works

Tasks are organized into **sprints** and **waves** (ordered phases). All tasks in a wave can be worked in parallel. Waves must complete in order.

```
- [ ]              → available
- [ ] **CLAIMED**  → being worked on
- [x]              → done
```

**Tags:** `[core]` `[ui]` `[web]` `[infra]`
**Sizes:** `[S]` 1-2h, `[M]` 4-8h, `[L]` 2-5d (break down before starting)

---

## Current State

**Status:** Sprint 1 (MVP) — Wave 1 ready to start

**What exists:**

- [x] Monorepo structure (pnpm + Turborepo)
- [x] `apps/web` — Next.js 16 scaffold (default template, needs replacement)
- [x] `packages/core` — placeholder types + barrel export
- [x] `packages/ui` — cn() utility + barrel export
- [x] Tooling — ESLint, Prettier, Lefthook, Taskfile
- [x] Docs — architecture, rules, design language, decisions
- [x] GitHub repo + initial commit
- [x] Typography: Switzer (sans, self-hosted variable) + IBM Plex Mono (Google Fonts)
  - Replaced default Geist fonts with Swiss Design-appropriate typefaces
  - `next/font/local` for Switzer, `next/font/google` for IBM Plex Mono
  - CSS variables wired: `--font-switzer` → `--font-sans`, `--font-ibm-plex-mono` → `--font-mono`
  - Metadata updated: title "Groundwork", description set

---

## Sprint 0: Infrastructure Setup — COMPLETE

Monorepo bootstrapped, packages initialized, docs written, repo pushed.

---

## Sprint 1: MVP — The Daily Journal

**Goal:** Ship a zen, mobile-first daily training journal as a PWA.

**The core loop:** Open the app → see today → set your focus → write your notes.

**KISS = feature simplicity, not architectural shortcuts.** The core API, store pattern, UI components, and layered architecture are built properly from the start — following bnto's proven patterns. What's simple is the _feature set_: one entry per day, a focus line, and rich text notes.

**Key decisions:**

- **Day-based:** One entry per day. No "create" flow — today's entry exists when you open the app
- **Daily focus:** Short text field — what you're working on (e.g. "half guard retention")
- **TipTap editor:** Rich text notes
- **PWA:** Installable, works offline from day 1
- **Domain:** `core.entries` — daily journal entries

---

### Wave 1 — Core Data Layer

Build `@groundwork/core` with the full client/store/hook architecture. MVP storage is a Zustand persisted store (localStorage). Sprint 2 swaps to Turso — everything above stays the same.

**Critical path: deps → store factory → types → store → client → hooks → singleton → tests**

- [x] `[core]` Update `@groundwork/core` dependencies [S]
  - Add `zustand`, `immer` to dependencies
  - Remove Sprint 2 deps: `@libsql/client`, `drizzle-orm`, `@tanstack/react-query`, `drizzle-kit`
  - Acceptance: `pnpm install` succeeds, `pnpm build` passes

- [x] `[core]` Port `createEnhancedStore` factory from bnto [S]
  - File: `packages/core/src/stores/createEnhancedStore.ts`
  - Zustand vanilla + immer middleware + optional persist
  - Acceptance: Factory creates stores with immer draft mutations and optional localStorage persistence

- [x] `[core]` Define entry types + Zod schema [S]
  - File: `packages/core/src/types/entry.ts`
  - Type: `Entry { id, date (YYYY-MM-DD), focus, content (TipTap JSON string), createdAt, updatedAt }`
  - Zod schema for validation
  - Acceptance: Types exported, schema validates valid/invalid entries

- [x] `[core]` Create entries store [S]
  - File: `packages/core/src/stores/entriesStore.ts`
  - Uses `createEnhancedStore` with persist to localStorage (`groundwork-entries`)
  - State: `Record<string, Entry>` keyed by date
  - Mutations: `upsert(entry)`, `remove(date)`
  - Partialize: persist only entries, not ephemeral state
  - Acceptance: Store persists to localStorage, immer mutations work

- [x] `[core]` Create entries client [S]
  - File: `packages/core/src/clients/entriesClient.ts`
  - Factory function, owns store
  - Methods: `getOrCreate(date)`, `update(date, { focus?, content? })`, `get(date)`, `list()`, `store`
  - `getOrCreate`: returns existing entry or creates empty one for that date
  - Acceptance: Client wraps store with domain logic, validates via Zod

- [x] `[core]` Create entries hooks [S]
  - Files: `packages/core/src/hooks/useEntry.ts`, `useEntries.ts`, `useUpdateEntry.ts`
  - `useEntry(date)` — reactive subscription to a single entry
  - `useEntries()` — all entries sorted newest first, returns `{ data, isLoading }`
  - `useUpdateEntry()` — imperative update function
  - Acceptance: Hooks subscribe reactively, re-render on store changes

- [x] `[core]` Wire up core singleton [S]
  - Files: `packages/core/src/core.ts`, `packages/core/src/reactCore.ts`, update `index.ts`
  - `core.entries` namespace with client methods + hooks
  - Acceptance: `import { core } from '@groundwork/core'` works, `core.entries.getOrCreate('2026-04-13')` returns an entry

- [x] `[core]` Tests for Wave 1 [M]
  - TDD Red-first: write failing tests, then implement
  - Test entry Zod schema (valid, invalid, edge cases)
  - Test entries store (upsert, remove, persist/restore)
  - Test entries client (getOrCreate, update, list)
  - Test entries hooks (useEntry reactivity, useEntries sorting)
  - Acceptance: All tests pass, covers happy path + edge cases
  - 33 tests across 4 test files: schema (8), store factory (5), entries store (7), entries client (13)

---

### Wave 2 — UI Foundation + TipTap

Build the UI foundation: Swiss Design tokens, TipTap editor, PWA setup, mobile-first shell.

- [x] `[ui]` Tailwind config with Swiss Design tokens [S]
  - 8px grid spacing, monochrome palette, type scale (hero/h1/h2/h3/body/small)
  - Font already set up: Switzer (sans) + IBM Plex Mono (mono)
  - Accent color (Belt Blue #0066cc)
  - Acceptance: Tokens usable in Tailwind classes (`text-h1`, `p-md`, `text-gray-70`)
  - Implementation: TW4 CSS-native `@theme inline` in `globals.css` (no tailwind.config.ts)

- [x] `[ui]` TipTap editor component [M]
  - Add TipTap dependencies (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`)
  - File: `packages/ui/src/Editor.tsx`
  - Minimal config: bold, italic, headings, lists, placeholder text
  - Styled with Swiss Design tokens (typography-first, clean)
  - Props: `content`, `onUpdate`, `placeholder`, `className`, `editable`
  - No toolbar — zen editing via keyboard shortcuts only
  - Acceptance: Rich text editing works, outputs JSON, Swiss-styled

- [x] `[web]` PWA manifest + service worker [S]
  - `apps/web/app/manifest.ts` — app name, icons, theme color, display: standalone
  - Service worker via Serwist (`sw.ts`, `serwist-provider.tsx`, route handler)
  - SVG icons (192x192, 512x512, maskable)
  - Acceptance: App installable on mobile, works offline

- [x] `[web]` Mobile-first app shell + layout [S]
  - Replaced default Next.js boilerplate with Groundwork landing
  - Fonts + metadata already done (Switzer + IBM Plex Mono, title/description set)
  - Full-height, no chrome, zen aesthetic
  - Sticky header with branding (nav-ready for Wave 3)
  - Swiss Design: flush left, bold type, generous whitespace, monochrome
  - Removed boilerplate assets (next.svg, vercel.svg, etc.)
  - Acceptance: Clean shell, mobile-first, Swiss Design feel

---

### Wave 3 — Journal App

Compose `@groundwork/core` + `@groundwork/ui` + TipTap into the journal experience.

- [ ] `[web]` Today page — daily focus + TipTap editor [M]
  - Route: `/` (root — today is the default view)
  - Auto-loads today's entry via `core.entries.getOrCreate(today)`
  - Focus input at top (short text, placeholder: "Today's focus...")
  - TipTap editor below (placeholder: "How was training?")
  - Acceptance: Open app → see today's entry → start writing immediately

- [ ] `[web]` Auto-save with debounce [S]
  - Debounced writes to store as user types (300-500ms)
  - No save button — it just saves
  - Acceptance: Changes persist without explicit save action

- [ ] `[web]` History view — past entries [M]
  - Route: `/history` or bottom nav/tab
  - List of past entries, newest first
  - Each entry shows: date, focus (if set), truncated content preview
  - Acceptance: Can scroll through past entries, tap to view/edit

- [ ] `[web]` Entry detail — read/edit past entry [S]
  - Route: `/entry/[date]` or inline expand
  - Same focus + TipTap layout as today page
  - Acceptance: Can view and edit any past entry

- [ ] `[web]` Swiss Design polish [M]
  - Typography-first: type is the hero, generous whitespace
  - Mobile-first responsive layout
  - High contrast monochrome, accent only on interactive elements
  - Acceptance: Looks zen and clean, typography carries the design

---

### Wave 4 — Ship

- [ ] `[web]` Test on mobile Safari + Chrome [S]
- [ ] `[web]` Verify entries persist across page reload [S]
- [ ] `[web]` Verify PWA installs and works offline [S]
- [ ] `[infra]` Deploy to Vercel [S]
- [ ] `[infra]` Get 5 people to test for 1 week [S]

**Success criteria:**

- [ ] Open app → writing in < 5 seconds
- [ ] Entries persist across reload
- [ ] PWA installs on mobile
- [ ] Works offline
- [ ] Typography is the star — zen and clean

---

## Plan Grooming Summary

### Tasks: 21 total

**By size:**

- Small: 16 tasks (~24h)
- Medium: 5 tasks (~30h)
- Total: ~54h estimated

**By package:**

- `[core]`: 8 tasks (Wave 1)
- `[ui]`: 2 tasks (Wave 2)
- `[web]`: 9 tasks (Waves 2-4)
- `[infra]`: 2 tasks (Wave 4)

**Critical path:**

```
Wave 1: deps → store factory → types → store → client → hooks → singleton → tests (~16h)
Wave 2: tailwind tokens + tiptap + pwa + shell (~12h, parallelizable)
Wave 3: today page → auto-save → history → detail → polish (~18h)
Wave 4: test + deploy (~8h)
```

**Dependencies:**

- Wave 2 depends on Wave 1 (TipTap needs core types for content model)
- Wave 3 depends on Wave 1 + Wave 2 (composes core + ui)
- Wave 4 depends on Wave 3

**Blockers:** None identified. All dependencies are internal.

**Ready for Sprint:** YES

---

## Sprint 2: Make It Real (Future)

**Goal:** Add auth + database. Move from persisted Zustand store to Turso backend.

React Query enters the picture — async server state alongside Zustand stores. Add Turso adapter, swap persistence layer, keep the same public API.

- Database: Drizzle schema, Turso adapter, React Query integration
- Auth: NextAuth magic link, auth store/client, protected routes, localStorage migration
- Enhancements: gi/no-gi toggle, duration, export, dark mode

---

## Sprint 3: Training System (Future)

**Goal:** Layer in structured training methodology inspired by HPU "Your Game" workbook.

- Weekly theme/focus — pick a technique to work on this week
- Game plan — if it goes right do X, if it goes wrong do Y
- Move explorer — browse techniques, select pass/fail paths
- Calendar view, technique tags, search

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
