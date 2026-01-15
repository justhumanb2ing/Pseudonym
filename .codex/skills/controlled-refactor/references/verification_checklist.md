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
