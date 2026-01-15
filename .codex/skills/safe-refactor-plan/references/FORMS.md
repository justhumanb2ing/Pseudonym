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
