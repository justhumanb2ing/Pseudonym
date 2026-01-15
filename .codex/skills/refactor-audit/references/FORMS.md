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