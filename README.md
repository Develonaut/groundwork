# Groundwork

**The open-source BJJ training journal.** Log sessions, reflect on progress, build your foundation — one roll at a time.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## Why Groundwork?

Most BJJ apps try to do everything — technique libraries, social feeds, gym management, competition tracking. Groundwork does one thing: **lets you journal your training sessions in a zen, distraction-free environment.**

- **Write after you roll.** Create a session, jot down notes, save. Done in 30 seconds
- **Your data, your rules.** Always exportable, never locked in. Free and open-source forever
- **Swiss Design aesthetics.** Typography-first, grid-based, 60-70% whitespace. Clean and calm, like your mind after a good session
- **Works offline.** No internet? No problem. Your journal is always available
- **$0 to run.** Built on free tiers (Vercel, Turso) so the core journal never goes behind a paywall

---

## Status

**Early development.** Building the MVP — create sessions, view sessions, that's it. Shipping simplicity first, features later.

See the [roadmap](.claude/ROADMAP.md) for what's planned.

---

## Tech Stack

| Layer        | Technology                           |
| ------------ | ------------------------------------ |
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 |
| **UI**       | shadcn/ui + Swiss Design tokens      |
| **Data**     | Turso (LibSQL) + Drizzle ORM         |
| **Auth**     | NextAuth.js (self-hosted)            |
| **Testing**  | Vitest                               |
| **Deploy**   | Vercel                               |

**Architecture:** Monorepo with strict layered boundaries — `apps/web` consumes `@groundwork/core` (transport-agnostic API layer) and `@groundwork/ui` (Swiss Design component library). UI code never touches the database directly.

---

## Project Structure

```
groundwork/
├── apps/
│   └── web/               # Next.js PWA — the journal app
├── packages/
│   ├── core/              # @groundwork/core — data layer, hooks, services
│   └── ui/                # @groundwork/ui — Swiss Design components
├── .claude/               # Architecture docs, rules, decisions, plan
├── turbo.json             # Turborepo config
└── pnpm-workspace.yaml    # pnpm workspace config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) 10+

### Install and Run

```bash
git clone https://github.com/Develonaut/groundwork.git
cd groundwork
pnpm install
pnpm dev
```

The dev server starts at `http://localhost:5000`.

### Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm test             # Run tests (Vitest)
pnpm lint             # Lint all packages
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting
```

---

## Design Philosophy

Groundwork follows **Swiss Design / International Typographic Style** — the same tradition behind Helvetica, the NYC subway system, and decades of timeless graphic design.

**In practice:**

- **Typography does the heavy lifting.** Large, bold type as the primary visual element
- **Monochrome base.** Black, white, grey — with a single accent color (Belt Blue `#0066cc`) reserved for actions
- **8px baseline grid.** All spacing is deliberate and mathematical
- **No shadows, no gradients.** Clean, flat, functional
- **Mobile-first.** Designed for the phone in your gym bag, then desktop

---

## Core Principles

1. **The journal is sacred** — Never lose data. Always exportable. User owns their content
2. **KISS** — Simplest solution always wins. If it doesn't serve journaling, it's out of scope
3. **Bento Box Principle** — One thing per file, function, and package. Small, composable modules
4. **Transport-agnostic** — `@groundwork/core` abstracts the data layer so the app doesn't care what's behind it
5. **TDD Red-first** — Write failing tests to define behavior, then implement to make them pass

---

## Roadmap

| Milestone                       | Goal                                                                | Status      |
| ------------------------------- | ------------------------------------------------------------------- | ----------- |
| **M1: MVP**                     | Create session + view sessions. localStorage, no auth. Ship it      | In Progress |
| **M2: Make It Real**            | Add auth (NextAuth), database (Turso), session metadata, export     | Planned     |
| **M3: Progressive Enhancement** | Search, tags, dark mode, calendar view — pick 2-3 based on feedback | Future      |
| **M4+: TBD**                    | Let users decide. Analytics? Social? Instructor tools?              | Future      |

**What we're NOT building:** A technique library, a gym management system, a social network, or a competition tracker. Groundwork is a journal.

---

## Contributing

Contributions welcome. To get started:

1. Read the [developer guide](.claude/CLAUDE.md) for architecture rules and patterns
2. Check the [build plan](.claude/PLAN.md) for available tasks
3. Create a branch (`feat/your-feature`), submit a PR targeting `main`

---

## License

[MIT](LICENSE) — Copyright 2026 Develonaut
