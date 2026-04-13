# Groundwork — Product Roadmap

**Last Updated:** April 13, 2026  
**Brand:** Groundwork (`groundwork.zone`)

---

## Vision

**Groundwork is where you build your BJJ foundation.**

A zen, whitespace-heavy training journal that cuts through BJJ chaos with radical simplicity. Track your sessions, reflect on progress, build your foundation—one roll at a time.

**Design Philosophy:**

- Swiss Design (typography-first, grid-based, 60-70% whitespace)
- KISS principle (Keep It Simple, Stupid)
- Mobile-first (thumb-friendly, minimal friction)
- User owns their data (always exportable)
- Free and open-source

---

## Milestone 1: MVP — The Absolute Minimum

**Goal:** Ship a working journal in 2 weeks that does ONE thing: log training sessions with notes.

**Target Launch:** May 1, 2026

### The Core Loop (Must Have)

1. **Create Session**
   - Date (defaults to today)
   - Notes (plain textarea, no markdown yet)
   - Save button
   - That's it.

2. **View Sessions**
   - Chronological list (newest first)
   - Show date + first 100 chars of notes
   - Tap to view full session

3. **That's The Entire MVP**
   - No auth (localStorage only for MVP)
   - No markdown rendering
   - No tags, no metadata, no filters
   - No fancy UI animations
   - Just: create session, view sessions

### Technical Scope

**Must Have:**

- Next.js 16 app
- localStorage persistence (no database yet)
- Swiss Design CSS (grid, typography, whitespace)
- Mobile responsive
- Works offline (no backend = always works)

**Explicitly Out:**

- Authentication (add in M2)
- Database (localStorage is fine for MVP)
- Markdown editor (plain textarea)
- Tags, partners, techniques (M2+)
- Export (M2)
- Any bells and whistles

### Success Criteria

- [ ] Can create a session in < 30 seconds
- [ ] Sessions persist across page reload
- [ ] Works on mobile Safari + Chrome
- [ ] Swiss Design looks clean and zen
- [ ] 5 alpha testers use it for 1 week

---

## Milestone 2: Make It Real

**Goal:** Add the basics to make this a usable product.

**Target:** 2-4 weeks after M1

### Features

1. **Authentication**
   - NextAuth with magic link (passwordless)
   - Migrate localStorage sessions to user account on signup
   - Protected routes

2. **Database (Turso)**
   - Move from localStorage to Turso
   - Drizzle ORM
   - Proper session persistence

3. **Session Metadata**
   - Training type (Gi/No-Gi toggle)
   - Duration (optional number input)
   - That's it—keep it minimal

4. **Basic Markdown**
   - Markdown rendering in session view
   - Simple editor (no WYSIWYG, just textarea with preview)

5. **Export**
   - Export all sessions as JSON
   - Export all sessions as Markdown
   - One button, downloads file

### Success Criteria

- [ ] 10+ active users logging weekly
- [ ] Zero data loss incidents
- [ ] Auth flow works smoothly
- [ ] Export works on first try

---

## Milestone 3: Progressive Enhancement

**Goal:** Add features that make journaling better without adding complexity.

**Target:** 2-3 months after M2

### Features (Pick 2-3, Not All)

- **Technique Tags** - Simple tag input, filter by tag
- **Search** - Full-text search across notes
- **Dark Mode** - Toggle light/dark
- **Better Markdown** - Live preview, basic toolbar
- **Session Templates** - Save common session structures
- **Calendar View** - Visual timeline of training

### Philosophy

Only add features that make the core loop (create → view) better. If it doesn't serve journaling, defer it.

---

## Milestone 4+: TBD

**Don't plan too far ahead.** Let user feedback guide M4.

### Potential Directions

**Option A: Social/Sharing**

- Share sessions publicly
- Follow training partners
- Training partner directory

**Option B: Analytics**

- Training frequency charts
- Technique heatmaps
- Progress tracking

**Option C: Instructor Tools**

- Student tracking
- Lesson planning
- Class schedules

**Decision:** Wait until M3 ships, see what users ask for.

---

## What We're NOT Building

**Groundwork is a journal, not:**

- A technique library (YouTube exists)
- A gym management system (too complex)
- A social network (focus on your practice)
- A competition tracker (niche)
- A video platform (not our core)

Every feature must answer: **"Does this make journaling better?"**

If not → it's out of scope.

---

## Design Principles (Never Compromise)

1. **KISS** — Simplest solution always wins
2. **Mobile-first** — Works on phone first, desktop second
3. **Swiss Design** — Typography, grids, whitespace
4. **Free forever** — Core journal never goes behind paywall
5. **User owns data** — Always exportable, no lock-in
6. **Offline-capable** — Works without internet
7. **Fast** — Every action < 100ms

---

## Success Definition

**M1 Success:**

- 5 people use it for 1 week straight
- Zero crashes
- Looks clean and zen

**M2 Success:**

- 10+ weekly active users
- People migrate from paper/notes apps
- Zero data loss

**M3 Success:**

- 50+ weekly active users
- Average session: 20+ entries
- People tell their training partners

**Long-term Success:**

- The best BJJ journal, period
- Simple, fast, free
- People choose it over bloated alternatives

---

## North Star

**Build your foundation. One session at a time.**

Groundwork is the journal that gets out of your way and lets you focus on what matters: your training, your growth, your journey.
