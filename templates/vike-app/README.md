# Bitcart Vike Example

A minimal Vike application boilerplate.

## Commands

```bash
pnpm nx run @bitcart/vike-app-template:dev   # dev server
pnpm nx run @bitcart/vike-app-template:build # production build
```

## Using it as a template

1. Copy `templates/vike-app` to `apps/<your-app>` and register `apps/<your-app>` in `knip.config.ts`.
2. Rename the package in [package.json](package.json) and [project.json](project.json), drop
   `"private": true`, and pick a free port in `vite.config.ts` and `playwright.config.ts`.
3. Update `PRODUCTION_BASE_URL` / `PROJECT_CANONICAL_NAME` defaults in
   [env.config.ts](env.config.ts), and add any client-side (`BITCART_`-prefixed) variables to
   `clientEnvSchemas`.
4. Adjust branding and navigation in [src/pages/layout.config.ts](src/pages/layout.config.ts).
5. Edit `.tx/config` and add a `release` script if the app is to be translated and deployed.
