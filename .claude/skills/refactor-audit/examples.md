# Examples

## Example 1: PASS
- Small util
- Single responsibility
- Rarely changed
- Score: 1
- Action: PASS

## Example 2: REFACTOR
- Page component with fetch + state + rendering
- Frequent prop additions
- Multiple condition branches
- Score: 4
- Action: REFACTOR
- First cut: extract data-fetching logic

## Example 3: INVESTIGATE
- Performance complaints reported
- No profiling data available
- Score: pending
- Action: INVESTIGATE
