# Anti-Patterns (Avoid These)

## Do not do now
- Do not "promote" extracted UI into a global/shared component library prematurely
- Do not introduce a new architecture layer (clean/hexagonal/modules rewrite)
- Do not migrate state management libraries
- Do not create generic "useSomething" hooks without a clear single responsibility
- Do not rename everything
- Do not do styling redesign as part of splitting

## Over-splitting warning signs
- Creating many tiny files with unclear boundaries
- Splitting by file type only (components/, hooks/, utils/) without responsibility mapping
- Extracting abstractions that are only used once

## Under-splitting warning signs
- Leaving fetching/state/transform logic inside the UI render path
- Keeping giant conditional blocks inside the orchestrator
