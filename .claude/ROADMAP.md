# Groundwork — Product Roadmap

**Last Updated:** April 13, 2026
**Brand:** Groundwork (`groundwork.zone`)

---

## Vision

**Groundwork is where you build your BJJ foundation.**

A zen, typography-driven daily training journal. Open the app, set your focus, write your notes. No friction, no clutter — just you and your practice.

**North star:** The digital version of a structured BJJ training workbook (inspired by HPU "Your Game"). Start with a dead-simple daily journal, layer in weekly themes, game plans, and technique exploration over time.

---

## Design Principles (Never Compromise)

1. **KISS** — Simplest feature set that solves the problem. Ship less, ship better
2. **Mobile-first** — Works on the phone in your gym bag first, desktop second
3. **Swiss Design** — Typography is the star. Generous whitespace. Form follows function
4. **Free forever** — Core journal never goes behind a paywall
5. **User owns data** — Always exportable, no lock-in
6. **Offline-capable** — PWA, works without internet
7. **Fast** — Every action < 100ms

---

## Milestone 1: MVP — The Daily Journal

**Goal:** Ship a zen, mobile-first daily training journal as an installable PWA.

**The core loop:**

1. Open the app → today's entry is ready
2. Set your **daily focus** (e.g. "half guard retention")
3. Write your **notes** in a rich text editor (TipTap)
4. Browse **past entries** to reflect on progress

**That's the entire MVP.**

**In scope:** Day-based entries, daily focus field, TipTap rich text, localStorage persistence (via Zustand), PWA (installable + offline), Swiss Design, mobile-first.

**Out of scope:** Auth, database, weekly themes, game plans, tags, metadata, filters, export.

**Success:** 5 people use it for 1 week. Zero crashes. Looks zen and clean. Typography is the star.

---

## Milestone 2: Make It Real

**Goal:** Add the basics to make this a usable product people can rely on.

**Features:**

- **Authentication** — NextAuth with magic link (passwordless)
- **Database** — Move from localStorage to Turso (Drizzle ORM)
- **Session metadata** — Gi/No-Gi toggle, duration
- **Export** — Download all entries as JSON or Markdown
- **Dark mode** — Respect the blackspace

**Success:** 10+ weekly active users. Zero data loss. Auth flow works smoothly.

---

## Milestone 3: Training System

**Goal:** Layer in structured training methodology inspired by HPU "Your Game" workbook.

**The idea:** Each week you pick a focus, build a game plan — if it goes right do this, if it goes wrong do this. What does success look like?

**Pick based on user feedback, not all:**

- Weekly theme/focus — pick a technique to drill this week
- Game plan — structured if-right/if-wrong decision tree
- Move explorer — browse techniques, choose pass/fail paths
- Calendar view — see your training at a glance
- Technique tags + search

**Philosophy:** Only add features that make the core loop better. If it doesn't serve journaling and intentional training, defer it.

---

## Milestone 4+: TBD

**Don't plan too far ahead.** Let user feedback guide direction.

Potential directions: analytics, social/sharing, instructor tools, voice-to-text. Decision point after M3 ships.

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
