/**
 * Reads the AI allowance switch (src/aiAllowanceSwitch.ts) for build scripts.
 * (/terms no longer follows the switch: it is published on its own since
 * 2026-10-08, so the sitemap always lists it.)
 * Throws if the line is missing or not a plain literal: a build must never
 * guess the switch.
 */
const fs = require('fs')
const path = require('path')

const SWITCH_FILE = path.join(__dirname, '..', 'src', 'aiAllowanceSwitch.ts')

function parseAiAllowanceSwitch(source) {
  const match = /^export const AI_ALLOWANCE_ENFORCED = (true|false)$/m.exec(source)
  if (!match) throw new Error('AI_ALLOWANCE_ENFORCED must be a plain true/false literal in src/aiAllowanceSwitch.ts')
  return match[1] === 'true'
}

function aiAllowanceEnforced() {
  return parseAiAllowanceSwitch(fs.readFileSync(SWITCH_FILE, 'utf8'))
}

module.exports = { SWITCH_FILE, parseAiAllowanceSwitch, aiAllowanceEnforced }
