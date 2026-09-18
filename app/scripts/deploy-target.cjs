const { execFileSync } = require('node:child_process')
if (process.env.TINCT_DEPLOY_TARGET !== 'voice-preview' || process.env.GITHUB_REF !== 'refs/heads/codex/voice-insight-preview' || process.env.GITHUB_ACTIONS !== 'true') {
  throw new Error('This experiment branch can only publish a cloud voice preview')
}
execFileSync('npx', ['wrangler', 'versions', 'upload', '--preview-alias', 'voice-insight'], { stdio: 'inherit' })
