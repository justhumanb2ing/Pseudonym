---
name: test-master
description: Enforce feature-first analysis followed by required tests in this React Router + Vite codebase. Use when creating or modifying features so Codex must (1) analyze scope/behavior, then (2) write tests in the required categories (unit, component, integration) using Vitest + React Testing Library.
---

# Test Master

## Instructions

Analyze every requested feature first, then write the minimum meaningful tests in three categories: unit, component, and integration. This skill overrides repo-level test scope rules and is mandatory for feature work.

## Workflow (Feature Requests)

1. **Analyze the feature**
   - Identify user-visible behavior and edge cases.
   - Map impacted modules/services/routes.
   - Note data boundaries and side effects.

2. **Decide test coverage (mandatory)**
   - **Unit tests**: Pure functions, domain rules, services, utilities.
   - **Component tests**: UI components or route UI behavior using React Testing Library.
   - **Integration tests**: Cross-module or multi-component flows (e.g., UI + service + routing), still within Vitest/jsdom.

3. **Implement tests before/with feature code**
   - Follow TDD where practical: write tests first or in lock-step with implementation.
   - Keep tests minimal but meaningful; avoid redundant scenarios.

4. **Run validation**
   - Prefer `bun test` (project default) or `vitest run` when specified.

## Testing Defaults (Project-Specific)

- **Runner**: Vitest (`vitest`), configured in `vitest.config.ts` with `jsdom` and `test/setup.ts`.
- **Component testing**: React Testing Library + `@testing-library/user-event`.
- **Matchers**: `@testing-library/jest-dom` (already in dev deps).
- **No real network calls**: use mocks/stubs/fakes.

## File Placement

Follow the project structure rules and keep tests predictable:

- Unit tests: `test/unit/**/*.test.ts`
- Component tests: `test/component/**/*.test.tsx`
- Integration tests: `test/integration/**/*.test.tsx`

If co-locating tests is already established for a specific area, mirror that pattern instead of introducing a new one.

## Output Expectations

When responding to a feature request:

- Provide a brief analysis summary first.
- Then include or propose the three test types (unit, component, integration) with file paths.
- Only after test intent is clear, proceed to implementation steps.
