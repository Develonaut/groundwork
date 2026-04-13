# Groundwork — Product Roadmap

**Last Updated:** April 13, 2026
**Brand:** Groundwork (`groundwork.zone`)

---

## Vision

**Groundwork is where you build your BJJ foundation.**

A zen, whitespace-heavy training journal that cuts through BJJ chaos with radical simplicity. Track your sessions, reflect on progress, build your foundation — one roll at a time.

---

## Design Principles (Never Compromise)

1. **KISS** — Simplest feature set that solves the problem. Ship less, ship better
2. **Mobile-first** — Works on the phone in your gym bag first, desktop second
3. **Swiss Design** — Typography, grids, whitespace. Form follows function
4. **Free forever** — Core journal never goes behind a paywall
5. **User owns data** — Always exportable, no lock-in
6. **Offline-capable** — Works without internet
7. **Fast** — Every action < 100ms

---

## Milestone 1: MVP — The Absolute Minimum

**Goal:** Ship a working journal that does ONE thing: log training sessions with notes.

**The core loop:**

1. **Create Session** — Date (defaults to today) + notes (plain textarea) + save
2. **View Sessions** — Chronological list (newest first), tap to read full notes

**That's the entire MVP.**

**In scope:** localStorage persistence, Swiss Design, mobile responsive, works offline.

**Out of scope:** Auth, database, markdown, tags, metadata, filters, export.

**Success:** 5 people use it for 1 week. Zero crashes. Looks zen and clean.

---

## Milestone 2: Make It Real

**Goal:** Add the basics to make this a usable product people can rely on.

**Features:**

- **Authentication** — NextAuth with magic link (passwordless)
- **Database** — Move from localStorage to Turso (Drizzle ORM)
- **Session metadata** — Gi/No-Gi toggle, duration (keep it minimal)
- **Export** — Download all sessions as JSON or Markdown. One button

**Success:** 10+ weekly active users. Zero data loss. Auth flow works smoothly.

---

## Milestone 3: Progressive Enhancement

**Goal:** Add features that make journaling better without adding complexity.

**Pick 2-3 based on user feedback, not all:**

- Technique tags + filter by tag
- Full-text search across notes
- Dark mode
- Better markdown (live preview, basic toolbar)
- Session templates
- Calendar view

**Philosophy:** Only add features that make the core loop (create + view) better. If it doesn't serve journaling, defer it.

---

## Milestone 4+: TBD

**Don't plan too far ahead.** Let user feedback guide direction.

Potential directions: analytics, social/sharing, instructor tools. Decision point after M3 ships.

---

## What We're NOT Building

**Groundwork is a journal, not:**

- A technique library (YouTube exists)
- A gym management system (too complex)
- A social network (focus on your practice)
- A competition tracker (niche)
- A video platform (not our core)

Every feature must answer: **"Does this make journaling better?"**

If not, it's out of scope.

---

## North Star

**Build your foundation. One session at a time.**

Groundwork is the journal that gets out of your way and lets you focus on what matters: your training, your growth, your journey.
