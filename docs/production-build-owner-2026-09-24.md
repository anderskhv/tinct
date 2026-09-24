# One production build owner

Production releases use the serialized GitHub Actions `deploy` workflow, Node 24.13.0 and `npm run deploy`, with bundle verification and production acceptance.

On 23 September, PR #155 deployed and byte-verified `index-CZ-Y8Jtf.js`. Four seconds later, the separate Workers Builds integration published the same commit with a different timestamped build, `index-DA0B49QA.js`. The original asset was no longer served, so the in-progress smoke test fetched an invalid response for its recorded asset. Both builds contained the required public Supabase configuration in their reachable imported chunks; this was a competing-deployment failure, not evidence of missing authentication configuration.

Evidence: [Actions release](https://github.com/anderskhv/tinct/actions/runs/35930422844), [competing Cloudflare check](https://github.com/anderskhv/tinct/runs/107415989337), Cloudflare version `5b0a8760-cfbd-4d30-9aaf-5e6cccfb42df`.

The Vite build now rejects `WORKERS_CI=1`, Cloudflare's [documented Workers Builds marker](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/#environment-variables). GitHub Actions and ordinary development remain unchanged. The verification workflow tests both the normal build and the rejected competing path.

Until its dashboard integration is disconnected, the Workers Builds check intentionally fails before generating or publishing an app. Do not repair that failure by bypassing the guard or enabling a second deploy path. The GitHub Actions deploy result and actual production acceptance are authoritative.
