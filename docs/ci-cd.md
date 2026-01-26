# CI/CD

This repository uses GitHub Actions to run tests, typecheck, build, and deploy the Workers app.
Deployments run only on the `main` branch after CI succeeds.

## Workflow summary

1. Install dependencies with Bun.
2. Run `bun run test`.
3. Run `bun run typecheck`.
4. Run `bun run build`.
5. Deploy with Wrangler (CI only).
6. Send email notification on success or failure.

## Required GitHub Secrets

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `SMTP_USERNAME` (Gmail address)
- `SMTP_PASSWORD` (Gmail App Password)

## Notes

- Local pre-push tests are disabled. CI is the source of truth.
- The `deploy` script is available but CI is the recommended path for production releases.
