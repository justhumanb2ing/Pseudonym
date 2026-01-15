---
name: component-splitter
description: Propose a safe, minimal component split plan for one large UI file. No code changes.
---

# component-splitter

## Purpose

Given one large UI file, propose a **minimal, safe split** into:

- orchestration (page/container)
- state/data hook(s)
- pure presentational components
- (optional) small mapper/selector utilities

## Hard rules

- Do NOT edit or rewrite code.
- Preserve behavior, API contracts, and UX.
- Avoid large-scale architecture or framework changes.
- Prefer minimal file count and minimal new abstractions.

## Output

Use: `references/FORMS.md`

## Rules

Use:

- `references/split_rules.md`
- `references/anti_patterns.md`

## Language

- Write all responses in Korean.
- Use Korean for all output text (headings, lists, explanations).
- Keep code snippets in their original language.
- In case of conflict, prioritize Korean output and technical accuracy.
