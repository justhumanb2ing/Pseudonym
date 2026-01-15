# Refactor Worthiness Scoring

## Score definitions

### 1 — Do not refactor

- Stable
- Rarely changes
- Refactoring risk > benefit

### 2 — Minor cleanup only

- Some rough edges
- Local readability improvements possible
- No strong urgency

### 3 — Worth refactoring

- SRP violations present
- Upcoming features will touch this file
- Refactor improves speed and safety

### 4 — Strongly recommended

- Frequent bugs or conflicts
- File actively slows development
- Developers avoid touching it

### 5 — Critical

- Structural issues cause repeated incidents
- Changes routinely break other behavior
- Expansion is dangerous without refactor

## Action mapping

- 1–2 → PASS
- 3–4 → REFACTOR
- 5 → REFACTOR (high priority)
- Insufficient info → INVESTIGATE

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

# Refactor Audit Report Format

Use the following headings **in this exact order**.

---

## 1) File Summary

- 파일의 역할:
- 할당된 책임 개수:
- 위험 레벨: Low | Medium | High
- 리팩토링이 필요한 주요 근거:

## 2) Responsibilities

List up to 8 responsibilities.
If more than 8, state: “Responsibility overload.”

## 3) SRP / Design Smells

For each issue:

- Symptom
- Evidence from the code
- Impact
- Fixable now: Yes | No

## 4) Changeability Map

- Hot (frequently changed)
- Warm
- Cold (stable)
- High-risk-to-touch warnings

## 5) Refactor Worthiness Score (1–5)

- Score
- 2–3 bullet reasons

## 6) Recommended Next Action

Choose exactly one:

- PASS
- REFACTOR
- INVESTIGATE

Include justification.

## 7) If REFACTOR: Suggested First Cuts

Up to 3 safe, high-leverage first actions.
Planning only — no code changes.

## 8) Do NOT do now

List 3–6 explicit things that must not be done.
