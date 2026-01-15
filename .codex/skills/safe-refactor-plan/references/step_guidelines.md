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
