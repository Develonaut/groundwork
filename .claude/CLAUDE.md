# Groundwork - Agent & Developer Guide

**Last Updated:** April 13, 2026

---

## Before You Write Any Code

**STOP.** Read the relevant documentation first.

| If you're working on...    | Read this first                                                              |
| -------------------------- | ---------------------------------------------------------------------------- |
| Any code                   | [rules/code-standards.md](.claude/rules/code-standards.md)                   |
| Any UI / styling work      | [rules/theming.md](.claude/rules/theming.md)                                 |
| Architecture decisions     | [rules/architecture.md](.claude/rules/architecture.md)                       |
| Component patterns         | [rules/components.md](.claude/rules/components.md)                           |
| Core API layer             | [rules/core-api.md](.claude/rules/core-api.md)                               |
| Page composition           | [rules/pages.md](.claude/rules/pages.md)                                     |
| Planning multi-PR features | [rules/feature-planning.md](.claude/rules/feature-planning.md)               |
| Strategic direction        | [ROADMAP.md](.claude/ROADMAP.md)                                             |
| Implementation task        | [PLAN.md](.claude/PLAN.md)                                                   |
| Core principles (always)   | [core-principles.md](.claude/strategy/core-principles.md)                    |
| Design language            | [design-language.md](.claude/strategy/design-language.md)                    |
| Initial stack decision     | [decisions/001-stack-selection.md](.claude/decisions/001-stack-selection.md) |

---

## Quick Context

**Groundwork** is a zen, whitespace-heavy training journal that cuts through BJJ chaos with radical simplicity. At its core, it's a note-taking app for Brazilian Jiu-Jitsu practitioners to log training sessions, reflect on progress, and track their journey. Built with the same architectural principles as bnto: clean layers, transport-agnostic APIs, and the Bento Box Principle.

**Current Focus:** MVP - Ship a beautiful Swiss Design PWA that does ONE thing perfectly: lets you journal your training sessions in a zen, distraction-free environment.

**Design Language:** Swiss Design / International Typographic Style — typography-first, grid-based, intentional whitespace, black/white/grey + one accent color. See [design-language.md](.claude/strategy/design-language.md).

**Future Vision:**

- Technique library integration
- Voice-to-text notes
- Progress tracking and analytics
- Instructor mode for lesson planning
- Community-contributed content

---

## Critical Rules (Summary)

These are enforced in detail by the [rules/](.claude/rules/) files. This section is the quick reference.

1. **Layered Architecture:** `Apps → @groundwork/core → Database (Turso)`. Never skip layers. See [architecture.md](.claude/rules/architecture.md).
2. **API Abstraction:** UI code NEVER calls database APIs directly. Always through `@groundwork/core` hooks.
3. **Bento Box Principle:** One thing per file/function/package. Files < 250 lines, functions < 20 lines. No `utils.ts` grab bags. See [code-standards.md](.claude/rules/code-standards.md).
4. **Transport-agnostic:** `@groundwork/core` abstracts the data layer so the app doesn't know if it's talking to Turso, SQLite, or future providers.
5. **Mobile-first Swiss Design:** Everything designed for mobile first, then desktop. Typography-first, grid-based, intentional whitespace.

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4
- **UI Components:** shadcn/ui (copy-paste approach, styled with Swiss Design)
- **Auth:** NextAuth.js (self-hosted, free)
- **Database:** Turso (LibSQL) - SQLite in the cloud
- **ORM:** Drizzle
- **Deployment:** Vercel (free tier)
- **Testing:** Vitest
- **Total Cost:** $0

See [decisions/001-stack-selection.md](.claude/decisions/001-stack-selection.md) for full rationale.

---

## Repository Structure

```
groundwork/
├── apps/
│   └── web/                     # Next.js PWA on Vercel (@groundwork/web)
├── packages/
│   ├── core/                    # @groundwork/core — Transport-agnostic API
│   └── ui/                      # @groundwork/ui — Swiss Design components (shadcn/ui)
├── .claude/                     # Strategy docs, decisions, plan, rules, skills
│   ├── rules/                   # Code standards, architecture, patterns
│   ├── skills/                  # Agent skills (pickup, pre-commit, code-review, etc.)
│   ├── strategy/                # Core principles, design language
│   └── decisions/               # Architecture decision records
└── README.md
```

---

## Commands

```bash
# Development
pnpm dev                 # Start Next.js dev server
pnpm build               # Build for production
pnpm lint                # Run ESLint
pnpm format              # Format with Prettier
pnpm format:check        # Check formatting

# Database
pnpm db:generate         # Generate Drizzle migrations
pnpm db:push             # Push schema to Turso
pnpm db:studio           # Open Drizzle Studio

# Testing
pnpm test                # Run tests
pnpm test:watch          # Run tests in watch mode
```

---

## Agent Workflow

1. **Read context** — Review this file, rules/, and relevant docs
2. **Check the plan** — See [PLAN.md](.claude/PLAN.md) for current sprint
3. **Claim a task** — Mark it CLAIMED before starting
4. **Plan multi-PR work** — If the task spans 2+ PRs, produce a structured plan per [feature-planning.md](.claude/rules/feature-planning.md)
5. **Create a branch** — `git checkout -b <type>/<short-description>`. Never commit directly to `main`
6. **Follow patterns** — Match existing code style (see rules/)
7. **Test boundaries** — Write tests for data layer and API contracts
8. **Mark done** — Update the plan when complete
9. **Pre-commit** — Follow [pre-commit.md](.claude/rules/pre-commit.md) before every commit
10. **Push & PR** — Push your branch, create a PR targeting `main`

**TDD Red — tests are the design phase.** Write failing tests first to define what code should do, then implement to make them pass. Tests are not verification — they are the design tool.

---

## Key Principles

1. **TDD Red — tests are the design phase** — Write failing tests first
2. **Go with the grain** — Work with tools the way they want to be used
3. **Modularity is our bread and butter** — Think small, build small, compose big
4. **Abstraction is the goal** — "Did we make this easier?" If no, go back
5. **The journal is sacred** — Never lose data, always exportable, user owns their content

See [core-principles.md](.claude/strategy/core-principles.md) for the full treatment.

---

## Documentation Index

### Rules (auto-loaded, always active)

| Document                                                 | Purpose                                             |
| -------------------------------------------------------- | --------------------------------------------------- |
| [code-standards.md](.claude/rules/code-standards.md)     | Bento Box Principle, size limits, file organization |
| [architecture.md](.claude/rules/architecture.md)         | Layered architecture, data flow                     |
| [components.md](.claude/rules/components.md)             | Component patterns, hooks, flat exports, CSS-first  |
| [theming.md](.claude/rules/theming.md)                   | Swiss Design tokens, fonts, spacing, colors         |
| [pre-commit.md](.claude/rules/pre-commit.md)             | Mandatory checklist before every commit             |
| [core-api.md](.claude/rules/core-api.md)                 | @groundwork/core client/service/adapter pattern     |
| [pages.md](.claude/rules/pages.md)                       | Page composition, server components                 |
| [performance.md](.claude/rules/performance.md)           | Server Components, bundle size, Core Web Vitals     |
| [typescript.md](.claude/rules/typescript.md)             | Inference patterns, anti-patterns                   |
| [feature-planning.md](.claude/rules/feature-planning.md) | Multi-PR feature plans                              |
| [security.md](.claude/rules/security.md)                 | Auth, input validation, security checklist          |
| [gotchas.md](.claude/rules/gotchas.md)                   | Known pitfalls and fixes                            |

### Strategy & Reference (read on demand)

| Document                                                                     | Purpose                                              |
| ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| [ROADMAP.md](.claude/ROADMAP.md)                                             | Strategic roadmap — milestones, direction            |
| [PLAN.md](.claude/PLAN.md)                                                   | Build plan — sprints, waves, what's next             |
| [core-principles.md](.claude/strategy/core-principles.md)                    | TDD, Grain, Modularity, Abstraction                  |
| [design-language.md](.claude/strategy/design-language.md)                    | Swiss Design visual specification                    |
| [decisions/001-stack-selection.md](.claude/decisions/001-stack-selection.md) | Tech stack decision record                           |
| [skills/](.claude/skills/)                                                   | Agent skills (pickup, pre-commit, code-review, etc.) |

### Domain Expert Personas (invoke with `/persona-name`)

| Persona           | Domain                                             | Invoke               |
| ----------------- | -------------------------------------------------- | -------------------- |
| Frontend Engineer | `apps/web/` — React, Next.js, components, theming  | `/frontend-engineer` |
| Next.js Expert    | `apps/web/` — App Router, performance, SSR/SSG     | `/nextjs-expert`     |
| Core Architect    | `packages/core/` — API layer, adapters, services   | `/core-architect`    |
| Security Engineer | Cross-cutting — trust boundaries, auth, validation | `/security-engineer` |
| Quality Engineer  | Testing strategy — Vitest, test design             | `/quality-engineer`  |
| Technical Writer  | Package READMEs — accuracy, documentation          | `/technical-writer`  |
| Project Manager   | PLAN.md, ROADMAP.md — roadmap alignment, planning  | `/project-manager`   |
