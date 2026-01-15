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
