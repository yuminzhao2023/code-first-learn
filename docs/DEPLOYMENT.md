# Static deployment

The app builds to static files. It has no backend, authentication, runtime API, or required environment variables. All observability data is deterministic fixture data.

## Vercel setup

The checked-in [vercel.json](../vercel.json) selects Vite, runs `npm run build`, publishes `dist/`, and rewrites application routes to `index.html`. Existing static assets are served by the platform. Deploy at the domain root; subdirectory hosting needs coordinated Vite base and router changes.

1. Import the GitHub repository into Vercel.
2. Use Node.js 22.13+ within the 22.x line, or 24+; install with `npm ci`.
3. Confirm the build command is `npm run build` and the output directory is `dist`.
4. Create a preview deployment and perform the checks below before promoting it.

This repository contains deployment configuration, not evidence of an actual deployment. No deployment is created by running the local checks. `Dockerfile.visual` is exclusively a screenshot-test environment.

## Local production check

```bash
npm run test:e2e:preview
```

This builds the app and runs the behavior suite against Vite preview on port 4173. It verifies the generated app, direct route access, and refresh behavior locally. It does not emulate Vercel's routing configuration.

## Verify the deployed preview

- Open `/`, `/metrics`, `/errors`, and `/compare` directly, then refresh each page.
- Open `/?trace=tr-error-1-1` directly and refresh; confirm the matching table row, details, and Waterfall.
- Check navigation, search, filters, sorting, pagination, comparison selection, and swapping runs.
- Inspect desktop 1440×900 and mobile 390×844, including long identifiers and keyboard focus.
- Confirm JS and CSS assets return successfully and the browser console has no application errors.

If routes return 404, check that the deployment uses the repository's rewrite configuration and serves from the domain root. For a blank page, inspect asset responses and the browser console. For build failures, check Node version, the lockfile install, and the deployment build log.

## Configuration and secrets

There are currently no required environment variables. Keep local configuration in ignored `.env` files. If configuration becomes necessary, commit only a redacted `.env.example`. Variables exposed to a browser build, including Vite's `VITE_*` values, are public and must never contain server credentials.
