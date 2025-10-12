Deploying to GitHub Pages

One-line (local) deploy:

    npm run predeploy && npm run deploy

Notes:
- `predeploy` builds the app into `dist/public` with Vite and server bundle steps.
- `deploy` uses `gh-pages` to publish `dist/public` to the `gh-pages` branch.

Optional (auto-deploy on push to `main`):
- Add a GitHub Actions workflow that runs `npm ci`, `npm run predeploy`, and then uses `peaceiris/actions-gh-pages@v3` or `JamesIves/github-pages-deploy-action` to publish `dist/public` to `gh-pages`.
- Ensure repository settings enable Pages from the `gh-pages` branch.

Troubleshooting:
- If the site appears broken, ensure `vite.config.ts` `base` is set to the repo path (e.g. `/CycleTrack/`) or set `GITHUB_PAGES_BASE` before building.
- For custom domains, add a `CNAME` file into `dist/public` before deploying or set via repo settings.
