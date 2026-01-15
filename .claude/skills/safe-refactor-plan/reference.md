# Safe Refactor Plan Format

Use the following headings in this exact order.

## 1) Plan Goal

One sentence describing what will be improved (without changing behavior).

## 2) Constraints

List constraints explicitly (behavior/API/UX unchanged, etc.).

## 3) Preconditions / Assumptions

List what must be true (tests available, feature flags, etc.), or "None".

## 4) Step-by-step Plan

Provide 5–12 steps. Each step must include:

- Step title
- Change type: Move | Extract | Rename | Inline | Rewire | Delete (one)
- Expected diff size: Small | Medium
- Safety check (what to verify)
- Rollback note (how to revert)

## 5) Risk Gates

List 2–5 gates where you must stop if something fails.

## 6) Do NOT do now

List 3–6 explicit don’ts to prevent scope creep.

# Risk Gates

Insert gates at points where refactors often go wrong.

## Recommended gates

- After first "Move" step: ensure build/test passes
- After introducing a new hook/module: verify no behavior/API change
- After wiring changes: verify routes/props/exports unchanged
- Before deleting code: confirm no references remain

## Gate behavior

If a gate fails:

- STOP the plan progression
- Suggest the smallest rollback
- Propose a safer alternative step

# Step Guidelines

## Step design principles

- Prefer "move code" before "rewrite logic".
- Keep each step independently verifiable.
- Avoid mixing multiple responsibilities in one step.
- Default to Small diffs; Medium only if justified.

## Allowed step types

- Move: relocate code with minimal edits
- Extract: extract a clearly bounded unit (hook, function, presentational component)
- Rename: rename for clarity (avoid mass renames)
- Inline: remove unnecessary indirection
- Rewire: adjust imports/wiring without logic changes
- Delete: remove dead code only when safe

## Safety checks (examples)

- Compile/build succeeds
- Lint/typecheck passes
- Existing unit/integration tests pass
- Manual smoke check for critical flow
- Snapshot/visual check (optional)

## Stop-and-ask rule

If a step would require behavior changes or unknown API constraints:

- mark it as blocked and ask a minimal question instead of guessing
