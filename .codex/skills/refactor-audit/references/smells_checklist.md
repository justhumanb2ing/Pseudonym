# SRP & Design Smells Checklist

Check for the following patterns and cite evidence.

## Common smells
- UI, state, and business logic mixed together
- Large “god” component or function
- Deeply nested conditionals
- Scattered magic values or role checks
- Data transformation inside render paths
- Side effects during render
- Tight coupling to global state or singletons

## Evidence guidelines
- Mention concrete patterns (not line numbers)
- Quote small snippets if necessary
- Avoid subjective language (“feels bad”)

## Route-file caveat
- Do not count framework lifecycle hooks (e.g., `meta`, `loader`) as separate responsibilities by themselves.
- Only count them if they contain distinct domain logic, heavy data orchestration, or complex branching beyond simple wiring.

## Fixability
Mark “Fixable now: No” if:
- Behavior changes are unavoidable
- Requires large-scale re-architecture
- Depends on unknown external constraints
