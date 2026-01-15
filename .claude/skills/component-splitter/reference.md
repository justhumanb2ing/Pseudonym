# Anti-Patterns (Avoid These)

## Do not do now
- Do not "promote" extracted UI into a global/shared component library prematurely
- Do not introduce a new architecture layer (clean/hexagonal/modules rewrite)
- Do not migrate state management libraries
- Do not create generic "useSomething" hooks without a clear single responsibility
- Do not rename everything
- Do not do styling redesign as part of splitting

## Over-splitting warning signs
- Creating many tiny files with unclear boundaries
- Splitting by file type only (components/, hooks/, utils/) without responsibility mapping
- Extracting abstractions that are only used once

## Under-splitting warning signs
- Leaving fetching/state/transform logic inside the UI render path
- Keeping giant conditional blocks inside the orchestrator

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

# Component Split Proposal Format

Use the following headings in this exact order.

## 1) Split Goal

One sentence describing the goal (e.g., "separate orchestration from state and UI").

## 2) Current Responsibilities (quick)

List 4–8 responsibilities you believe this file currently mixes.

## 3) Proposed Target Structure

Provide a directory/file tree. Keep it small (default: 2–4 new files).

## 4) Responsibility Mapping

Map each responsibility to the proposed file/module.

## 5) Public API Stability

State what must remain unchanged (props, exports, route behavior, UI output).
If you are unsure, state the assumptions.

## 6) Minimal Steps (no code changes)

List 3–7 steps describing how to split safely (move first, extract later).

## 7) “Do NOT do now”

List 3–6 explicit don’ts to avoid scope creep.
