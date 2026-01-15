---
name: controlled-refactor
description: Apply exactly ONE refactor step to code, following a safe-refactor-plan. Preserve behavior/API/UX. Stop if uncertain.
---

# controlled-refactor

## Purpose

Apply **exactly one** step from a safe-refactor-plan to the provided code.
This skill performs code edits, but only within strict constraints.

## Hard rules

- Apply ONLY the current step. Do NOT refactor ahead.
- Preserve behavior, API contracts, and UX.
- Do NOT introduce new abstractions unless the step explicitly requires it.
- Prefer moving code over rewriting logic.

## Output

Use: `references/FORMS.md`

## Rules

Use:

- `references/change_rules.md`
- `references/verification_checklist.md`

## Examples

See:

- `references/examples.md`

## Language

- Write all responses in Korean.
- Use Korean for all output text (headings, lists, explanations).
- Keep code snippets in their original language.
- In case of conflict, prioritize Korean output and technical accuracy.
