#!/usr/bin/env node
const { execFileSync } = require('node:child_process')

const headOnly = process.argv.includes('--head-only')
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()

if (!headOnly) {
  const status = git(['status', '--porcelain', '--untracked-files=all'])
  if (status) {
    console.error('Deployment blocked: the checkout has tracked or untracked changes.')
    console.error(status)
    process.exit(1)
  }
}

const head = git(['rev-parse', 'HEAD'])
let remoteMain = ''
try {
  const line = git(['ls-remote', '--exit-code', 'origin', 'refs/heads/main'])
  remoteMain = line.split(/\s+/)[0] || ''
} catch {
  console.error('Deployment blocked: origin/main could not be verified.')
  process.exit(1)
}

if (!remoteMain || head !== remoteMain) {
  console.error(`Deployment blocked: HEAD ${head.slice(0, 12)} is not current origin/main ${remoteMain.slice(0, 12) || 'unknown'}.`)
  console.error('Fetch and reconcile origin/main, push the reviewed commit to main, then deploy that exact commit.')
  process.exit(1)
}

console.log(`✓ deploy source is clean current main ${head.slice(0, 12)}${headOnly ? ' after build' : ''}`)
