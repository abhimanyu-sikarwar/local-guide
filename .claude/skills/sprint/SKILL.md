---
name: sprint
description: Work through a sprint from the GitHub project (https://github.com/users/abhimanyu-sikarwar/projects/11). Fetches tasks for the specified sprint milestone, then implements each task by moving it Ready → In Progress → In Review → Done. Use when the user says "run sprint", "work sprint N", "do sprint", or "start sprint".
---

You are working through sprint tasks from the GitHub project for local-guide.

## Project Constants

- **Repo:** `abhimanyu-sikarwar/local-guide`
- **Project ID:** `PVT_kwHOAVqVcs4BRMTF`
- **Project Number:** `11`
- **Owner:** `abhimanyu-sikarwar`
- **gh CLI path:** `/opt/homebrew/bin/gh` (always use full path, export PATH first)

## Status Field IDs (for GraphQL mutations)

- **Backlog:** `f75ad846`
- **Ready:** `61e4505c`
- **In progress:** `47fc9ee4`
- **In review:** `df73e18b`
- **Done:** `98236657`
- **Status Field ID:** `PVTSSF_lAHOAVqVcs4BRMTFzg_F2nI`

## Step 1 — Determine Sprint

If the user specified a sprint number (e.g., `/sprint 1`), use that. Otherwise list available milestones and ask which sprint to work on.

Fetch milestones dynamically:
```bash
export PATH="/opt/homebrew/bin:$PATH"
gh api repos/abhimanyu-sikarwar/local-guide/milestones --jq '.[] | {number, title, open_issues}'
```

## Step 2 — Fetch Sprint Tasks

Fetch all open issues for the milestone:

```bash
export PATH="/opt/homebrew/bin:$PATH"
gh issue list --repo abhimanyu-sikarwar/local-guide \
  --milestone "Sprint N: <title>" \
  --state open \
  --json number,title,body,labels,url \
  --limit 50
```

Display the full task list to the user with numbers, titles, and labels. Ask which task to work on first (or work sequentially if user says "all").

## Step 3 — Task Workflow

For each task, follow this exact sequence:

### 3a. Move to "Ready"

Get the project item ID for the issue, then set Status = Ready:

```bash
export PATH="/opt/homebrew/bin:$PATH"

# Get item ID in project
ITEM_ID=$(gh api graphql -f query='
{
  node(id: "PVT_kwHOAVqVcs4BRMTF") {
    ... on ProjectV2 {
      items(first: 100) {
        nodes {
          id
          content {
            ... on Issue { number }
          }
        }
      }
    }
  }
}' --jq '.data.node.items.nodes[] | select(.content.number == ISSUE_NUMBER) | .id')

# Set status to Ready
gh api graphql -f query='
mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: "PVT_kwHOAVqVcs4BRMTF"
    itemId: "'$ITEM_ID'"
    fieldId: "PVTSSF_lAHOAVqVcs4BRMTFzg_F2nI"
    value: { singleSelectOptionId: "61e4505c" }
  }) { projectV2Item { id } }
}'
```

Announce: **"[S1-1] Install backend dependencies → Ready"**

### 3b. Analyze the Task

Read the issue body carefully. Understand:
- What needs to be built/changed
- Which files are affected (`apps/api/src/...` or `apps/landing/...`)
- Acceptance criteria
- Dependencies on prior tasks

Read any relevant existing files before making changes.

### 3c. Move to "In Progress"

Set Status = In progress (option ID: `47fc9ee4`).

Announce: **"→ In Progress: implementing..."**

### 3d. Implement the Task

Actually implement the code changes:

- Use Read, Edit, Write, Bash tools to make changes
- Read CLAUDE.md if present for project-specific patterns and conventions
- Read existing files before editing — never assume file contents
- Run type checks / linting if applicable to the project's toolchain
- Don't skip implementation — actually write the code

### 3e. Move to "In Review"

Set Status = In review (option ID: `df73e18b`).

Announce: **"→ In Review: verifying..."**

### 3f. Verify the Work

- Re-read the acceptance criteria from the issue body
- Check the implementation against each criterion
- Run any relevant checks (typecheck, linting if quick)
- If something is missing, fix it and stay in "In Review"

### 3g. Move to "Done"

Set Status = Done (option ID: `98236657`).

Also close the GitHub issue:
```bash
export PATH="/opt/homebrew/bin:$PATH"
gh issue close ISSUE_NUMBER --repo abhimanyu-sikarwar/local-guide \
  --comment "Implemented. Acceptance criteria verified."
```

Announce: **"✓ Done: [task title]"**

## Step 4 — Progress Summary

After each task, show a progress bar:

```
Sprint 1 Progress: ████████░░░░░░░░░░░░ 4/14 tasks done
Completed: S1-1, S1-2, S1-3, S1-4
Remaining: S1-5, S1-6, S1-7, S1-8, S1-9, S1-10, S1-11, S1-12, S1-13, S1-14
```

Ask: "Continue to next task [S1-5: Create flow config]? (yes / pick another / stop)"

## Step 5 — Handle Blockers

If a task cannot be completed (missing dependency, unclear spec, external blocker):
- Leave status as "In Progress"
- Add a comment to the issue explaining the blocker
- Move to the next unblocked task
- Report the blocker to the user

## Companion Skills (use these during the workflow)

| Skill | When to use |
|-------|-------------|
| `/backend` | Implementing S1-x, S2-x, S3-1 to S3-5, S5-x backend tasks |
| `/frontend` | Implementing S3-6 to S3-17, S4-x, S5-8 frontend tasks |
| `/qa` | Writing tests, verifying acceptance criteria (especially S5-10 to S5-13) |
| `/code-review` | Before moving to "In Review" — check implementation quality |
| `/api-docs` | After S2-13 (routes done) and S2-14 (Swagger task) |
| `/devils-advocate` | When the design feels wrong or you hit unexpected complexity |

**Integration:** After implementing a task (3d), automatically invoke `/code-review S{N}-{M}` mentality before moving to In Review. If code-review finds critical bugs, stay In Progress and fix them first.

## Important Rules

1. **Always read files before editing** — never assume file contents
2. **Follow CLAUDE.md patterns** — read it first if present in the project root
3. **No commits unless asked** — implement and verify, let user commit
4. **Dependency order matters** — check if the task depends on an earlier unfinished task
5. **If args provided** (e.g., `/sprint 2 S2-5`) — work that specific task in sprint 2
6. **Fetch the Status field ID dynamically** if the hardcoded one doesn't work:

```bash
export PATH="/opt/homebrew/bin:$PATH"
gh api graphql -f query='
{
  node(id: "PVT_kwHOAVqVcs4BRMTF") {
    ... on ProjectV2 {
      fields(first: 20) {
        nodes {
          ... on ProjectV2SingleSelectField {
            id name
            options { id name }
          }
        }
      }
    }
  }
}'
```
