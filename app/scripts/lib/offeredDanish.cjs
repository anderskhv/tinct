const fs = require('node:fs')
const path = require('node:path')

// Browser and production checks consume the runtime allowlist rather than
// maintaining another list which can silently miss a newly published edition.
const source = fs.readFileSync(path.resolve(__dirname, '../../src/data/editionAvailability.ts'), 'utf8')
const block = source.match(/export const OFFERED_DANISH_EDITIONS[^=]*= new Set\(\[([\s\S]*?)\]\)/)
if (!block) throw new Error('Cannot read OFFERED_DANISH_EDITIONS')
exports.offeredDanish = [...block[1].matchAll(/'([^']+\/modern-da)'/g)].map(match => match[1])
if (!exports.offeredDanish.length) throw new Error('Empty Danish edition allowlist')
