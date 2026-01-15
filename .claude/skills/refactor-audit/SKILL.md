---
name: refactor-audit
description: Audit a single file to decide if it’s worth refactoring and what to tackle first (no code changes). Use for messy pages/components/hooks/utils with mixed responsibilities or frequent change/bugs.
---

# refactor-audit

## Purpose

Audit **one file** (page, component, hook, or util) to decide:

- whether it is worth refactoring now
- where the highest-leverage refactor targets are

## Hard rules

- Do NOT edit or rewrite code.
- Assume behavior, API contracts, and UX must remain unchanged.
- Avoid ideal or large-scale architecture proposals.

## Additional resources

- For outputs and rules, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)

## Language

- Write all responses in Korean.
- Use Korean for all output text (headings, lists, explanations).
- Keep code snippets in their original language.
- In case of conflict, prioritize Korean output and technical accuracy.
