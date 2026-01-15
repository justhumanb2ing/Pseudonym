# Change Rules (Strict)

## Allowed

- Move code without changing logic
- Extract a function/hook/component if bounded and clearly mapped to the step
- Rename a small, local symbol if required by the step
- Rewire imports/exports to preserve behavior
- Delete dead code only if the step says so and references are confirmed

## Not allowed

- Refactor beyond the single step
- Introduce new architecture layers
- Introduce generic abstractions "for future use"
- Change public APIs unless step explicitly says and user approved
- Style redesign or unrelated formatting churn

## Uncertainty handling

If you are unsure about:

- expected behavior
- public API expectations
- external dependencies
  Then STOP and ask minimal questions.
  Do NOT guess.

# Controlled Refactor Output Format

Use the following headings in this exact order.

## 1) Step Applied

Repeat the step title and brief intent.

## 2) Files Changed

List files touched (paths). If new files, list them.

## 3) Patch

Provide updated code for each changed file using fenced code blocks.
If multiple files, present in this order:

- new files first
- then modified files

## 4) What stayed the same

State explicitly what behavior/API/UX was preserved (assumptions allowed).

## 5) Verification checklist

List checks to run/confirm (from VERIFICATION_CHECKLIST.md).

## 6) Notes / Risks

Mention any risk or assumption.

# Verification Checklist

Include a small, practical checklist each time.

## Always suggest

- Build/compile succeeds
- Lint/typecheck passes (if available)
- Existing tests pass (unit/integration/e2e)

## If UI component/page

- Manual smoke check for the primary flow
- Verify no visual regressions in key states (loading/error/success)

## If API/service/util

- Verify unchanged function signatures
- Quick unit test or simple invocation example (optional)

## Rollback hint

- Mention that reverting the commit/patch should restore previous behavior
