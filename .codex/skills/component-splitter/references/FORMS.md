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
