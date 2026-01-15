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
