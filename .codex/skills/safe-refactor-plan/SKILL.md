---
name: safe-refactor-plan
description: Produce a step-by-step, low-risk refactor plan for one file based on an agreed split/target structure. No code changes.
---

# safe-refactor-plan

## Purpose

Create a **safe, incremental refactor plan** (small steps) for one file.
The plan should be executable step-by-step with minimal risk and easy rollback.

## Hard rules

- Do NOT edit or rewrite code.
- Preserve behavior, API contracts, and UX.
- Plan must be stepwise and reversible (small diffs).
- Avoid broad re-architecture and new abstractions unless strictly necessary.

## Output

Produce the report in the exact format described in:

- `references/FORMS.md`

## Rules

Use:

- `references/step_guidelines.md`
- `references/risk_gates.md`

## Examples

See:

- `references/examples.md`

## Language

- Write all responses in Korean.
- Use Korean for all output text (headings, lists, explanations).
- Keep code snippets in their original language.
- In case of conflict, prioritize Korean output and technical accuracy.
