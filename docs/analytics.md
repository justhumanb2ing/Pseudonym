# Analytics (Umami)

## Naming
- Format: `v1:<domain>:<subject>:<action>`
- Examples: `v1:page:home:view`, `v1:auth:signup:submit`, `v1:feature:link:success`
- Registry: use `app/lib/analytics/umami-events.ts` only (no raw strings)

## Properties
- Prefixes: `ctx:*` for context, `exp:*` for experiments
- Use `UMAMI_PROP_KEYS` for property keys
- For `data-umami-event-*` attributes, `:` is converted to `-` (e.g. `ctx:plan` -> `data-umami-event-ctx-plan`)

## Helpers
- `getUmamiEventAttributes(event, props)` for declarative `data-umami-event` usage
- `trackUmamiEvent(event, props, options)` for guarded JS API tracking
- `trackUmamiPageView({ url, title, props, options })` for custom page views
- `useUmamiPageView({ url, title, props, eventName })` in route components

## PII / Safety
- URLs are normalized and redacted for PII-like segments
- Props are sanitized (emails/phones are dropped)
- Do not send emails, phone numbers, names, or handles in props

## Environment
- Client: `VITE_UMAMI_WEBSITE_ID`, optional `VITE_UMAMI_SCRIPT_URL`
- Server: `UMAMI_WEBSITE_ID`, `UMAMI_API_KEY`, `UMAMI_API_CLIENT_ENDPOINT`
