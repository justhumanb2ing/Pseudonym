# Examples

## Example (React Page Split)
Goal: separate orchestration from state/data and presentation.

Steps (high level):
1) Move data-fetching helpers to a new hook file (Move, Small)
2) Extract hook return shape (Extract, Small)
3) Move presentational JSX into View component (Extract, Medium)
4) Rewire page to use hook + view (Rewire, Small)
5) Delete dead inline helpers (Delete, Small) after gate checks

Do NOT:
- create shared/global component library
- introduce new architecture layers
- change UX or API contracts
