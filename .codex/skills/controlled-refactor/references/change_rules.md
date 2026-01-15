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
