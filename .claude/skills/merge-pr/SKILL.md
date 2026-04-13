# merge-pr - Merge Pull Request Workflow

**Status:** Active
**Purpose:** Safely merge pull requests with final checks

---

## What This Skill Does

The **merge-pr** skill performs a safe merge workflow:

1. Fetches PR details
2. Runs final checks (build, test, lint)
3. Reviews changes (optional)
4. Merges to main
5. Deploys (Vercel auto-deploys)
6. Cleans up branch

---

## Usage

```bash
/merge-pr <pr-number>        # Merge PR by number
/merge-pr <pr-url>           # Merge PR by URL
/merge-pr                    # Merge current branch's PR
```

**Optional Flags:**

- `-r` - Run code review before merge
- `-f` - Force merge (skip checks) - USE WITH EXTREME CAUTION

---

## Step 1: Fetch PR Details

**Using GitHub CLI:**

```bash
gh pr view <pr-number>
```

**Extract:**

- PR number
- PR title
- PR description
- Source branch
- Target branch (should be `main`)
- Author
- Status (open, approved, checks passing)

**Output:**

```markdown
## PR Details

**Number:** #42
**Title:** feat: add session creation flow
**Source:** feat/session-creation
**Target:** main
**Author:** @user
**Status:** Open
**Checks:** ✅ All passing
**Approvals:** ✅ 1 approval
```

---

## Step 2: Run Final Checks

### Build Check

```bash
pnpm build
```

**Expected:** ✅ Build succeeds

**If fails:**

- ❌ STOP - Do not merge
- Fix build errors first

### Test Check

```bash
pnpm test
```

**Expected:** ✅ All tests pass

**If fails:**

- ❌ STOP - Do not merge
- Fix failing tests first

### Lint Check

```bash
pnpm lint
```

**Expected:** ✅ No linting errors

**If fails:**

- ❌ STOP - Do not merge
- Fix linting errors first

### Format Check

```bash
pnpm format:check
```

**Expected:** ✅ All files formatted correctly

**If fails:**

- Run `pnpm format`
- Commit formatting fixes
- Re-run checks

---

## Step 3: Code Review (if `-r` flag)

**Run code review:**

```bash
/code-review
```

**Check for:**

- Architecture compliance
- Bento Box Principle
- Test coverage
- Security issues
- Performance issues

**If issues found:**

- ❌ STOP - Do not merge
- Fix issues first
- Re-run review

---

## Step 4: Merge to Main

**Using GitHub CLI:**

```bash
gh pr merge <pr-number> --squash --delete-branch
```

**Merge strategy:**

- **Squash merge** (preferred for feature branches)
- Combines all commits into one
- Keeps main branch clean

**Alternative strategies:**

- `--merge` - Regular merge (keep all commits)
- `--rebase` - Rebase and merge

**Delete source branch:**

- `--delete-branch` - Clean up after merge

---

## Step 5: Verify Deployment

**Vercel auto-deploys on merge to main.**

**Check deployment:**

```bash
# Wait for Vercel deployment
sleep 30

# Check Vercel deployments
vercel ls
```

**Expected:**

- ✅ Deployment succeeds
- ✅ Production URL updated

**If deployment fails:**

- Check Vercel logs
- Rollback if necessary
- Fix and redeploy

---

## Step 6: Clean Up Local Branch

**Switch to main:**

```bash
git checkout main
git pull
```

**Delete local branch:**

```bash
git branch -d <branch-name>
```

**If branch not merged:**

```bash
# Force delete (only if you're sure)
git branch -D <branch-name>
```

---

## Proof of Work Summary

```markdown
## Merge Complete

**PR:** #42
**Title:** feat: add session creation flow
**Merged to:** main
**Merge strategy:** Squash
**Commit:** abc123def

**Final Checks:**

- [x] Build passes
- [x] Tests pass (15 tests)
- [x] Lint passes
- [x] Format passes
- [x] Code review (if -r flag)

**Deployment:**

- [x] Vercel deployment succeeded
- [x] Production URL: https://groundwork.vercel.app

**Cleanup:**

- [x] Source branch deleted (feat/session-creation)
- [x] Local branch deleted

**Next Steps:**

- Test in production
- Monitor for errors
```

---

## Error Recovery

### Build Fails

**Problem:** Build errors found

**Solution:**

1. Checkout PR branch
2. Fix build errors
3. Commit fixes
4. Push to PR
5. Re-run `/merge-pr`

### Tests Fail

**Problem:** Tests failing

**Solution:**

1. Checkout PR branch
2. Fix failing tests
3. Commit fixes
4. Push to PR
5. Re-run `/merge-pr`

### Merge Conflict

**Problem:** PR has conflicts with main

**Solution:**

1. Checkout PR branch
2. Merge main into PR branch:
   ```bash
   git checkout <pr-branch>
   git merge main
   ```
3. Resolve conflicts
4. Commit merge
5. Push to PR
6. Re-run `/merge-pr`

### Deployment Fails

**Problem:** Vercel deployment fails

**Solution:**

1. Check Vercel logs
2. Identify error (build, env vars, etc.)
3. Fix on main branch or revert merge
4. Redeploy

---

## Safety Checks

### Never Merge If

- ❌ Build fails
- ❌ Tests fail
- ❌ Lint fails
- ❌ Code review fails (if `-r` flag)
- ❌ Merge conflicts exist
- ❌ No approvals (if team policy requires)

### Force Merge (`-f` flag)

**USE WITH EXTREME CAUTION**

**Only use when:**

- Hotfix required immediately
- Checks are false positives (very rare)
- You understand the risks

**Never use for:**

- ❌ Failing tests
- ❌ Failing build
- ❌ Security issues

---

## Notes

- **Squash merge is preferred** - Keeps main branch clean
- **Always delete branch after merge** - Prevents stale branches
- **Vercel auto-deploys** - No manual deploy needed
- **Monitor production after merge** - Check for errors

---

## Related Skills

- `/pre-commit` - Run before creating PR
- `/code-review` - Review before merge
- `/pickup` - Creates PR after task completion

---

## Example

**User:** `/merge-pr 42 -r`

**Agent:**

[Fetches PR #42]

```markdown
## PR Details

**Number:** #42
**Title:** feat: add session creation flow
**Source:** feat/session-creation
**Target:** main
**Author:** @user
**Status:** Open
**Checks:** ✅ All passing
**Approvals:** ✅ 1 approval
```

[Runs final checks]

```markdown
## Final Checks

- [x] Build passes
- [x] Tests pass (15 tests)
- [x] Lint passes
- [x] Format passes
```

[Runs code review (due to `-r` flag)]

```markdown
## Code Review

- [x] Architecture compliance
- [x] Bento Box Principle
- [x] Test coverage (85%)
- [x] Security audit
- [x] Performance check

**Status:** ✅ APPROVED
```

[Merges PR]

```bash
gh pr merge 42 --squash --delete-branch
```

[Verifies deployment]

```markdown
## Deployment

- [x] Vercel deployment succeeded
- [x] Production URL: https://groundwork.vercel.app
```

[Cleans up]

```bash
git checkout main
git pull
git branch -d feat/session-creation
```

[Summary]

```markdown
## Merge Complete

**PR:** #42
**Merged to:** main
**Commit:** abc123def

**All checks passed**
**Deployed to production**
**Branch cleaned up**

✅ MERGE SUCCESSFUL
```

---

**End of merge-pr skill**
