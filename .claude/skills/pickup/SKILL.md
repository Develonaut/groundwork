# pickup - Two-Phase Task Execution

**Status:** Active
**Purpose:** Pick up next task from PLAN.md, research scope, propose approach, then execute with full rigor

---

## What This Skill Does

The **pickup** skill implements a two-phase workflow for task execution:

1. **Phase 1: Propose** - Read the plan, identify next task, research scope, present a proposal
2. **Phase 2: Execute** - Claim the task, create branch, write tests first, implement, verify, PR

This ensures you understand the task before diving in, and gives the user a chance to course-correct.

---

## Usage

```bash
/pickup
```

**Optional Flags:**

- None - pickup is a pure two-phase workflow

---

## Phase 1: Propose

### Step 1: Read the Plan

Read `/Users/Ryan/Code/groundwork/.claude/PLAN.md` (or wherever PLAN.md lives).

**Look for:**

- Tasks marked `[ ]` (incomplete)
- Priority order (tasks are listed in priority order)
- Dependencies (does this task depend on another?)
- Package tags: `[web]`, `[core]`, `[ui]`, `[infra]`

**Pick the first incomplete task** that has no incomplete dependencies.

### Step 2: Research Scope

**Read relevant context:**

- If `[web]` or `[ui]`: Read `.claude/rules/components.md`, `.claude/rules/pages.md`, `.claude/rules/theming.md`
- If `[core]`: Read `.claude/rules/core-api.md`, `.claude/rules/architecture.md`
- If `[infra]`: Read `.claude/rules/architecture.md`, `.claude/decisions/001-stack-selection.md`
- Always: Read `.claude/rules/code-standards.md`

**Search the codebase:**

- Find related files (`Glob`, `Grep`)
- Identify existing patterns to follow
- Check for similar features to reference
- Look for tests that show expected usage

### Step 3: Present Proposal

Output a proposal in this format:

```markdown
## Pickup Proposal

**Task:** [Task name from PLAN.md]

**Package:** [web / core / ui / infra]

**Persona:** [frontend-engineer / core-architect / nextjs-expert / quality-engineer / security-engineer]

**Scope:**

- [What files will be created/modified]
- [What patterns will be followed]
- [What tests will be written]

**Estimated Complexity:** [Small / Medium / Large]

**Questions/Clarifications:**

- [Any ambiguities or decisions needed before proceeding]

**Proceed?** (yes/no)
```

**Wait for user confirmation before Phase 2.**

---

## Phase 2: Execute

Once the user confirms, proceed with execution.

### Step 1: Claim the Task

Create a feature branch:

```bash
git checkout -b <type>/<short-description>
```

**Branch naming:**

- `feat/` - New feature
- `fix/` - Bug fix
- `refactor/` - Code refactoring
- `test/` - Test additions
- `docs/` - Documentation

### Step 2: Activate Persona

Based on the package tag, adopt the relevant persona:

| Package Tag  | Persona           | Focus                                     |
| ------------ | ----------------- | ----------------------------------------- |
| `[web]`      | frontend-engineer | Next.js pages, UI components, shadcn/ui   |
| `[core]`     | core-architect    | @groundwork/core services, Turso adapters |
| `[ui]`       | frontend-engineer | shadcn/ui + Swiss Design components       |
| `[infra]`    | nextjs-expert     | Build config, deployment, performance     |
| `[security]` | security-engineer | Auth, data validation, attack surface     |
| `[test]`     | quality-engineer  | Test strategy, Vitest, integration tests  |

**Persona files are in:** `.claude/skills/<persona-name>/SKILL.md`

Read the relevant persona skill file and follow its guidelines.

### Step 3: Read Standards

Read the following standards files (if not already read in Phase 1):

- `.claude/rules/code-standards.md` (always)
- `.claude/rules/architecture.md` (if touching data layer)
- `.claude/rules/core-api.md` (if `[core]`)
- `.claude/rules/components.md` (if `[web]` or `[ui]`)
- `.claude/rules/theming.md` (if `[ui]`)
- `.claude/rules/security.md` (if auth/data handling)

### Step 4: Write Tests First (TDD)

**If the task involves logic or data:**

1. Create test file first: `<filename>.test.ts`
2. Write failing tests that define expected behavior
3. Run `pnpm test` to confirm they fail
4. Then implement the feature to make tests pass

**Test locations:**

- `packages/core/src/**/*.test.ts` - Core API tests
- `apps/web/src/**/*.test.tsx` - Component tests (when we add them)

**Test frameworks:**

- Vitest (unit/integration)
- React Testing Library (component tests)

### Step 5: Implement

**Follow the Bento Box Principle:**

- One thing per file/function
- Files < 250 lines
- Functions < 20 lines
- No `utils.ts` grab bags

**Follow architectural layers:**

- `apps/web` → `@groundwork/core` → Database (never skip layers)
- UI code NEVER calls database APIs directly

**Swiss Design (if UI):**

- shadcn/ui components styled with Swiss Design
- Typography-first, grid-based, intentional whitespace
- Black/white/grey + one accent color

### Step 6: Verify

Before committing:

1. **Build succeeds:** `pnpm build`
2. **Tests pass:** `pnpm test`
3. **Linting passes:** `pnpm lint`
4. **Formatting correct:** `pnpm format:check`

If any fail, fix before proceeding.

### Step 7: Code Review (Self)

Read your own changes:

```bash
git diff
```

**Check:**

- Follows Bento Box Principle (small files/functions)
- Follows architectural layers (no layer-skipping)
- Follows patterns from existing code
- Tests cover the behavior
- No leftover debug code / console.logs
- TypeScript types are strict (no `any`)

### Step 8: Commit

Create a commit with a clear message:

```bash
git add <files>
git commit -m "$(cat <<'EOF'
<type>: <short description>

<optional longer explanation>

Resolves: <task from PLAN.md>
EOF
)"
```

**Commit message format:**

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `test:` - Test additions
- `docs:` - Documentation

**DO NOT include:**

- Co-Authored-By tags (per user instructions)
- Test Plan sections (per user instructions)

### Step 9: Push & PR

Push the branch:

```bash
git push -u origin <branch-name>
```

Create a pull request:

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<1-3 bullet points>

Resolves: <task from PLAN.md>
EOF
)"
```

### Step 10: Mark Complete

Update `.claude/PLAN.md`:

- Change `[ ]` to `[x]` for the completed task
- Add any learnings or notes

Commit the plan update:

```bash
git checkout main
git pull
git add .claude/PLAN.md
git commit -m "docs: mark task complete in PLAN.md"
git push
```

---

## Proof of Work Summary

After Phase 2 completes, output a summary:

```markdown
## Pickup Complete

**Task:** [Task name]

**Branch:** [branch-name]

**PR:** [PR URL]

**Files Changed:**

- [List of files created/modified]

**Tests Added:**

- [Test files created]
- [Coverage: X passing tests]

**Verification:**

- [x] Build passes
- [x] Tests pass
- [x] Lint passes
- [x] Format passes

**Plan Updated:** Yes

**Next Task:** [Preview next task from PLAN.md, if any]
```

---

## Error Recovery

**If tests fail during Step 6:**

1. Fix the implementation
2. Re-run tests
3. Do not proceed until green

**If build fails during Step 6:**

1. Fix TypeScript errors
2. Re-run build
3. Do not proceed until green

**If you discover the task is larger than expected:**

1. Stop execution
2. Propose splitting the task in PLAN.md
3. Ask user for confirmation

**If you discover a blocker (missing dependency, unclear requirements):**

1. Stop execution
2. Document the blocker
3. Ask user for clarification

---

## Notes

- **Two-phase is mandatory** - Always propose before executing
- **Tests are non-negotiable** - If it has logic, it has tests
- **Standards are law** - Read them, follow them
- **When in doubt, ask** - Better to clarify than to redo
- **One task at a time** - Focus, complete, move on

---

## Related Skills

- `/pre-commit` - Run before committing (automated in Step 6)
- `/code-review` - Detailed code review (included in Step 7)
- `/frontend-engineer` - Persona for `[web]` and `[ui]` tasks
- `/core-architect` - Persona for `[core]` tasks
- `/nextjs-expert` - Persona for `[infra]` tasks
- `/quality-engineer` - Persona for `[test]` tasks
- `/security-engineer` - Persona for `[security]` tasks

---

## Example

**User:** `/pickup`

**Agent (Phase 1):**

```markdown
## Pickup Proposal

**Task:** "Set up Drizzle schema for sessions table"

**Package:** [core]

**Persona:** core-architect

**Scope:**

- Create `packages/core/src/db/schema/sessions.ts`
- Create `packages/core/src/db/schema/index.ts` (barrel export)
- Create `packages/core/src/db/schema/sessions.test.ts`
- Follow existing schema patterns (if any)
- Export types for TypeScript

**Estimated Complexity:** Small

**Questions/Clarifications:**

- Should we include soft-delete fields (deleted_at)?
- Should we include timezone for created_at/updated_at?

**Proceed?** (yes/no)
```

**User:** "Yes, include soft-delete and use UTC timestamps"

**Agent (Phase 2):**

[Executes Steps 1-10]

```markdown
## Pickup Complete

**Task:** "Set up Drizzle schema for sessions table"

**Branch:** feat/drizzle-sessions-schema

**PR:** https://github.com/user/groundwork/pull/123

**Files Changed:**

- packages/core/src/db/schema/sessions.ts (created)
- packages/core/src/db/schema/index.ts (created)
- packages/core/src/db/schema/sessions.test.ts (created)

**Tests Added:**

- packages/core/src/db/schema/sessions.test.ts
- Coverage: 3 passing tests (schema validation, type inference, constraints)

**Verification:**

- [x] Build passes
- [x] Tests pass
- [x] Lint passes
- [x] Format passes

**Plan Updated:** Yes

**Next Task:** "Create sessions service in @groundwork/core"
```

---

**End of pickup skill**
