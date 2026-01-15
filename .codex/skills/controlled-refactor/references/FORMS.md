# Controlled Refactor Output Format

Use the following headings in this exact order.

## 1) Step Applied

Repeat the step title and brief intent.

## 2) Files Changed

List files touched (paths). If new files, list them.

## 3) Changes Summary

List the key changes made in this patch as bullet points.

- <Key change #1>
- <Key change #2>
- <Key change #3>

Include:

- What changed (high level)
- Why it changed (brief rationale)
- Any notable behavior/UX/performance impact

Do NOT:

- Paste full file contents
- Provide per-file code listings
- Use fenced code blocks for entire files

## 4) What stayed the same

State explicitly what behavior/API/UX was preserved (assumptions allowed).

## 5) Verification checklist

List checks to run/confirm (from VERIFICATION_CHECKLIST.md).

## 6) Notes / Risks

Mention any risk or assumption.
