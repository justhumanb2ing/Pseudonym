# Split Rules (Minimal & Safe)

## Primary principle

Split by **responsibility boundaries**, not by file count or aesthetics.

## Default split (recommended)

1. Orchestrator (Page/Container)

- Coordinates data hooks + passes props to UI components
- Minimal logic; no heavy transforms

2. State/Data Hook(s)

- Fetching, caching, state transitions, derived state
- Should expose a small, intention-revealing API (return values + handlers)

3. Presentational Components

- Pure UI components that render from props
- No fetching, minimal side effects

4. Optional: Mapper/Selector

- Data shaping and mapping functions
- Pure functions, testable

## Constraints

- Behavior/API/UX must remain unchanged.
- New abstractions should be rare and justified.
- Keep new files minimal (default 2–4). If more, explain why.

## Evidence-based decisions

When proposing a split, cite concrete patterns:

- mixed responsibilities
- repeated transforms
- branching complexity
- large functions/components

## Stop conditions

If splitting requires changing behavior or public API:

- mark it as "not fixable now" and propose a safer alternative
- or ask questions
