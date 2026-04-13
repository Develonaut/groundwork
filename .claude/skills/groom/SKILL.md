# groom - Plan Review and Grooming

**Status:** Active
**Purpose:** Review and refine PLAN.md, break down large tasks, prioritize, and ensure sprint readiness

---

## What This Skill Does

The **groom** skill performs plan grooming:

1. Reads PLAN.md
2. Analyzes tasks (size, dependencies, clarity)
3. Breaks down large tasks
4. Identifies blockers
5. Suggests priorities
6. Updates PLAN.md with refinements

---

## Usage

```bash
/groom              # Review entire PLAN.md
/groom <task-id>    # Groom specific task
```

---

## Step 1: Read PLAN.md

**Load the current plan:**

```bash
cat .claude/PLAN.md
```

**Identify:**

- Current sprint tasks
- Backlog tasks
- Completed tasks
- Task sizes ([Small], [Medium], [Large])
- Package tags ([web], [core], [ui], [infra])
- Dependencies

---

## Step 2: Analyze Tasks

### Task Sizing

**Check each task:**

| Size   | Time      | Characteristics                                     |
| ------ | --------- | --------------------------------------------------- |
| Small  | 1-2 hours | Clear scope, no dependencies, single file           |
| Medium | 4-8 hours | Moderate scope, few dependencies, multiple files    |
| Large  | 2-5 days  | Complex scope, many dependencies, multiple packages |

**Violations:**

- ❌ Large tasks (should be broken down)
- ❌ Vague tasks (needs clarification)
- ❌ Tasks without size estimates

### Dependency Analysis

**Check for:**

- Blocked tasks (depends on incomplete tasks)
- Parallelizable tasks (no dependencies)
- Critical path (longest chain of dependencies)

**Example:**

```
Task A [Small] → Task B [Medium] → Task C [Small]  # Critical path: 12-14 hours
Task D [Small]  # Parallelizable
Task E [Medium]  # Parallelizable
```

### Clarity Check

**Each task should have:**

- [ ] Clear description
- [ ] Acceptance criteria (what "done" means)
- [ ] Package tag ([web], [core], etc.)
- [ ] Size estimate

**Violations:**

- ❌ "Implement sessions" (too vague)
- ✅ "Create sessions service in @groundwork/core with CRUD operations" (clear)

---

## Step 3: Break Down Large Tasks

**If task is [Large], split into smaller tasks:**

**Example:**

**Before:**

```markdown
- [ ] [core] Implement sessions feature [Large]
```

**After:**

```markdown
- [ ] [core] Create sessions schema in Drizzle [Small]
- [ ] [core] Create Turso adapter for sessions [Medium]
- [ ] [core] Create sessions service [Small]
- [ ] [core] Create React Query hooks for sessions [Small]
- [ ] [core] Write integration tests for sessions [Medium]
```

**Benefits:**

- Clearer scope
- Better estimates
- Easier to track progress
- Easier to parallelize

---

## Step 4: Identify Blockers

**Check for:**

1. **Technical blockers:**
   - Missing dependencies (packages, APIs)
   - Incomplete prerequisites
   - Unclear requirements

2. **Resource blockers:**
   - Waiting for design
   - Waiting for API access
   - Waiting for user feedback

3. **Knowledge blockers:**
   - Unfamiliar technology
   - Complex domain logic
   - Need research

**Mark blocked tasks:**

```markdown
- [ ] [web] Implement analytics dashboard [Medium] [BLOCKED: needs API design]
```

---

## Step 5: Prioritize Tasks

### Priority Criteria

**High priority:**

- MVP critical (blocks release)
- Unblocks other tasks
- User-facing value
- Quick wins (high value, low effort)

**Medium priority:**

- Nice-to-have for MVP
- Polish and refinement
- Performance optimization

**Low priority:**

- Post-MVP features
- Internal tooling
- Future enhancements

### Priority Order

**Reorder tasks by:**

1. MVP critical (must-have)
2. Dependencies (unblock others)
3. User value (high impact)
4. Quick wins (low effort, high value)

**Example reorder:**

**Before:**

```markdown
- [ ] [web] Add analytics dashboard [Medium]
- [ ] [core] Create sessions service [Medium]
- [ ] [ui] Add dark mode [Small]
```

**After:**

```markdown
- [ ] [core] Create sessions service [Medium] # MVP critical, unblocks web
- [ ] [ui] Add dark mode [Small] # Quick win, user value
- [ ] [web] Add analytics dashboard [Medium] # Nice-to-have, post-MVP
```

---

## Step 6: Sprint Planning

### Capacity Estimation

**Estimate available time:**

- 2-week sprint = 10 working days
- Assume 60% capacity (6 hours/day productive)
- Total capacity: ~60 hours

**Allocate tasks:**

- Fill sprint with tasks up to capacity
- Leave buffer for unknowns (20%)

**Example:**

```markdown
## Sprint 1 (Jan 15 - Jan 29)

**Capacity:** 60 hours
**Allocated:** 48 hours (80%)

### In Progress

- [ ] [core] Create sessions schema [Small] (2h)
- [ ] [core] Create Turso adapter [Medium] (6h)

### To Do

- [ ] [core] Create sessions service [Small] (2h)
- [ ] [core] Create React Query hooks [Small] (2h)
- [ ] [web] Create session form [Medium] (6h)
- [ ] [web] Create session list [Medium] (6h)
- [ ] [ui] Style session components [Medium] (6h)
- [ ] [core] Write integration tests [Medium] (8h)
- [ ] [web] Add error handling [Small] (2h)

**Total:** 40h (67% capacity)
**Buffer:** 20h (33% for unknowns)
```

---

## Step 7: Update PLAN.md

**Write refined plan back to PLAN.md:**

```markdown
# Groundwork - Build Plan

**Last Updated:** 2024-01-15

## Current Sprint: Sprint 1 (Jan 15 - Jan 29)

**Goal:** Ship session CRUD functionality

**Capacity:** 60 hours
**Allocated:** 40 hours (67%)

### In Progress

- [ ] [core] Create sessions schema in Drizzle [Small] (2h)
  - Acceptance: Schema defined with id, userId, title, notes, timestamps, deletedAt
  - Acceptance: Types exported from schema
  - Acceptance: Migrations generated

### To Do

- [ ] [core] Create Turso adapter for sessions [Medium] (6h)
  - Acceptance: Implements SessionsAdapter interface
  - Acceptance: All CRUD operations work
  - Acceptance: Filters by userId (security)
  - Acceptance: Soft-delete implemented

- [ ] [core] Create sessions service [Small] (2h)
  - Acceptance: Uses adapter pattern
  - Acceptance: Validates input with Zod
  - Acceptance: Returns typed results

- [ ] [core] Create React Query hooks for sessions [Small] (2h)
  - Acceptance: useSessions hook works
  - Acceptance: useCreateSession mutation works
  - Acceptance: Query invalidation on mutations

- [ ] [web] Create session form component [Medium] (6h)
  - Acceptance: Form with title and notes fields
  - Acceptance: Validation feedback
  - Acceptance: Success/error states
  - Acceptance: Swiss Design styling

- [ ] [web] Create session list component [Medium] (6h)
  - Acceptance: Lists all user sessions
  - Acceptance: Sorted by date (newest first)
  - Acceptance: Mobile-responsive
  - Acceptance: Empty state

- [ ] [ui] Style session components with Swiss Design [Medium] (6h)
  - Acceptance: Uses shadcn/ui primitives
  - Acceptance: Typography-first design
  - Acceptance: High contrast colors
  - Acceptance: 8px grid spacing

- [ ] [core] Write integration tests for sessions [Medium] (8h)
  - Acceptance: Adapter tests (CRUD, security)
  - Acceptance: Service tests (validation)
  - Acceptance: Coverage > 80%

- [ ] [web] Add error handling to session flow [Small] (2h)
  - Acceptance: Error boundaries
  - Acceptance: User-friendly error messages
  - Acceptance: Retry mechanisms

### Done

- [x] [infra] Set up Turso database
- [x] [infra] Configure Drizzle ORM
- [x] [infra] Set up NextAuth authentication

## Backlog (Post-Sprint 1)

### Sprint 2 (Future)

- [ ] [web] Add Markdown support to notes [Medium]
- [ ] [web] Add session search/filter [Medium]
- [ ] [web] Add session tags [Medium]
- [ ] [core] Add session export (JSON) [Small]

### Sprint 3+ (Future)

- [ ] [web] Add analytics dashboard [Large]
- [ ] [core] Implement technique library [Large]
- [ ] [web] Add voice-to-text notes [Medium]

## Notes

- Sprint 1 focuses on core CRUD functionality
- All tasks sized and prioritized
- 33% buffer for unknowns
- Post-MVP features moved to backlog
```

---

## Grooming Output

```markdown
## Plan Grooming Summary

### Tasks Analyzed: 15

**Sizing:**

- Small: 6 tasks (12h)
- Medium: 7 tasks (42h)
- Large: 0 tasks (broken down)

**Issues Found:**

- 2 large tasks broken down into 8 smaller tasks
- 3 vague tasks clarified with acceptance criteria
- 1 blocked task identified and marked

**Sprint Capacity:**

- Total capacity: 60h
- Allocated: 40h (67%)
- Buffer: 20h (33%)

**Priorities:**

1. MVP critical: 8 tasks (core CRUD)
2. Nice-to-have: 4 tasks (polish, error handling)
3. Post-MVP: 3 tasks (backlog)

**Dependencies:**

- Critical path: 18h (schema → adapter → service → UI)
- Parallelizable: 22h (tests, styling, error handling)

**Blockers:**

- 1 blocked task (analytics dashboard - needs API design)

**Ready for Sprint:** ✅ YES

### Recommendations:

- Start with critical path tasks (schema, adapter, service)
- Parallelize UI and tests once core is done
- Move analytics dashboard to Sprint 2 (blocked)
```

---

## Related Skills

- `/pickup` - Pick up next task from groomed plan
- `/project-manager` - Sprint planning and management

---

**End of groom skill**
