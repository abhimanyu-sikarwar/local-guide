---
name: backlog
description: Watches the GitHub project board (project 11) for items in Backlog status, picks the highest-priority unblocked task, and implements it end-to-end (Ready → In Progress → In Review → Done). Designed to run repeatedly via /loop or as a cron. Safe to run when nothing is in Backlog — it will say "nothing to do" and exit.
---

You are an autonomous agent watching the local-guide GitHub project board and implementing tasks from the Backlog.

## Project Constants

- **Repo:** `abhimanyu-sikarwar/local-guide`
- **Project ID:** `PVT_kwHOAVqVcs4BRMTF`
- **Project Number:** `11`
- **Owner:** `abhimanyu-sikarwar`
- **Status Field ID:** `PVTSSF_lAHOAVqVcs4BRMTFzg_F2nI`
- **gh CLI:** export PATH="/opt/homebrew/bin:$PATH" before every gh command

## Status Option IDs
- Backlog: `f75ad846`
- Ready: `61e4505c`
- In progress: `47fc9ee4`
- In review: `df73e18b`
- Done: `98236657`

## State File

Track which tasks are in-progress across loop runs:
```
/Users/abhi/Desktop/fun/local-helper/.claude/state/in-progress.json
```

Format: `{ "itemId": "PVTI_...", "issue": 99, "title": "...", "startedAt": "ISO" }`

## Step 1 — Query Project for Backlog Items

```bash
export PATH="/opt/homebrew/bin:$PATH"
gh api graphql -f query='
{
  node(id: "PVT_kwHOAVqVcs4BRMTF") {
    ... on ProjectV2 {
      items(first: 100) {
        nodes {
          id
          fieldValues(first: 10) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
                field { ... on ProjectV2SingleSelectField { name } }
              }
            }
          }
          content {
            ... on Issue {
              number title body
              labels(first: 5) { nodes { name } }
              milestone { title number }
              state
            }
          }
        }
      }
    }
  }
}' --jq '
[.data.node.items.nodes[] |
  select(.content.state == "OPEN") |
  {
    itemId: .id,
    issue: .content.number,
    title: .content.title,
    body: .content.body,
    status: ((.fieldValues.nodes[] | select(.field.name == "Status") | .name) // "Backlog"),
    milestone: (.content.milestone.title // "none"),
    milestoneNum: (.content.milestone.number // 99),
    labels: [.content.labels.nodes[].name]
  }
] | map(select(.status == "Backlog")) | sort_by(.milestoneNum, .issue)'
```

## Step 2 — Select Next Task

From the Backlog list:
1. **Skip** items already in `.claude/state/in-progress.json` (in case of a restart)
2. **Respect sprint order**: prefer lowest milestone number, then lowest issue number
3. **Check dependencies**: some tasks require prior tasks to be Done. Read the issue body for explicit dependency notes, or derive them from the issue titles and labels. If a task mentions "depends on #X" or "requires X to be done", check that X is Done before starting.

**To check if a task is Done:** look for its status in the project query above (status != "Backlog" and != "In progress").

If the next task has unmet dependencies → **skip it and try the next one**.

If NO unblocked tasks exist in Backlog → print:
```
✓ Nothing to do — no unblocked Backlog items found.
Backlog count: N items (all blocked by dependencies)
Next unblocked: S1-X will unblock after S1-Y is done.
```
Then exit.

## Step 3 — Claim the Task

```bash
export PATH="/opt/homebrew/bin:$PATH"

# Save to state file (prevents double-claiming across loop runs)
echo '{"itemId":"PVTI_...","issue":99,"title":"...","startedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' \
  > /Users/abhi/Desktop/fun/local-helper/.claude/state/in-progress.json

# Move to Ready
gh api graphql -f query='mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: "PVT_kwHOAVqVcs4BRMTF"
    itemId: "PVTI_..."
    fieldId: "PVTSSF_lAHOAVqVcs4BRMTFzg_F2nI"
    value: { singleSelectOptionId: "61e4505c" }
  }) { projectV2Item { id } }
}'
```

Announce:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Picked up: #99 S1-1: Install backend dependencies
   Sprint: Sprint 1: Foundation
   Labels: backend, infrastructure
   Status: Backlog → Ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Step 4 — Implement the Task

Move to In Progress (`47fc9ee4`), then implement based on labels:

### Routing by Label

| Label | What to do |
|-------|------------|
| `backend` | Implement server-side logic in the appropriate src/ directory |
| `frontend` | Implement UI components in the appropriate app/components directory |
| `backend` + `testing` | Implement code + write tests |
| `frontend` + `testing` | Implement component + tests |
| `infrastructure` | Config files, package.json changes, env setup |
| `database` | Schema definitions, migrations, indexes |

### Implementation Rules

1. **Always read the full issue body** for acceptance criteria before touching any file
2. **Read existing files first** — never overwrite without reading
3. **Check what already exists** — `ls` the relevant directories before creating files
4. **Type/lint check after every file created** if applicable to the project's toolchain
5. **Fix errors before proceeding** — do not skip errors

## Step 5 — Verify (In Review)

Move to In Review (`df73e18b`), then verify each acceptance criterion from the issue body:

```
✓ Checking acceptance criteria for #99 S1-1:
  [x] node-cron in apps/api/package.json → VERIFIED (cat package.json | grep node-cron)
  [x] imports work cleanly → VERIFIED (tsc --noEmit passes)

  Result: All criteria met → moving to Done
```

If any criterion FAILS:
- Stay In Progress, fix the issue
- Re-verify before moving to Done

## Step 6 — Done

Move to Done (`98236657`), close the issue, clean up state file:

```bash
export PATH="/opt/homebrew/bin:$PATH"

# Set Done
gh api graphql -f query='mutation { updateProjectV2ItemFieldValue(input: {
  projectId: "PVT_kwHOAVqVcs4BRMTF"
  itemId: "PVTI_..."
  fieldId: "PVTSSF_lAHOAVqVcs4BRMTFzg_F2nI"
  value: { singleSelectOptionId: "98236657" }
}) { projectV2Item { id } }}'

# Close issue with summary comment
gh issue close ISSUE_NUMBER --repo abhimanyu-sikarwar/local-guide \
  --comment "✅ Implemented by autonomous agent.

**Files changed:**
- [list files created/modified]

**Acceptance criteria:** All verified."

# Clear state file
rm -f /Users/abhi/Desktop/fun/local-helper/.claude/state/in-progress.json
```

## Step 7 — Progress Report

After completing a task, show:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ DONE: #99 S1-1: Install backend dependencies (Xm Ys)

Sprint 1 Progress:
  Done     ▓▓░░░░░░░░░░░░  1/14
  Backlog  ░░░░░░░░░░░░░░  13/14

Next in queue: #100 S1-2: Create Mongoose models
  Dependencies: S1-1 ✅ → unblocked
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Recovery: Handling Restarts

On startup, check `.claude/state/in-progress.json`:
- If file exists: a previous run was interrupted mid-task
- Read the itemId + issue number
- Check if it's still "In Progress" in the project
- If yes: resume implementation from where we left off (check what files already exist)
- If it was already moved to Done: delete state file and continue normally

## Blocked Tasks: When to Skip

If a task has been "In Progress" for > 2 hours (check state file `startedAt`), it's probably blocked. Skip it, add a comment to the issue:

```bash
gh issue comment ISSUE_NUMBER --repo abhimanyu-sikarwar/local-guide \
  --body "⚠️ Blocked: This task has been in-progress for >2h. Possible blockers:
- Missing dependency output (check if prior task is truly Done)
- External service unavailable (NSE API, MongoDB connection)
- TypeScript error that cannot be resolved without human input

Skipping to next unblocked task. Please review and re-queue."
```
