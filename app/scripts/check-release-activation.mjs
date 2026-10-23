// Verify the built public Library activation before a release command can
// upload or deploy the reader candidate. The React bundle uses the same Vite
// environment value; this checks its separately emitted static entry.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

if (process.env.TINCT_RELEASE_PHASE === 'reader') {
  assert.equal(process.env.VITE_SHARED_READER_DEFAULT, '1', 'reader release must build default ON')
  const source = readFileSync('dist/lab/shared-reader-activation.js')
  const activation = await import(`data:text/javascript;base64,${source.toString('base64')}`)
  assert.equal(activation.SHARED_READER_DEFAULT, true, 'emitted Library activation must default ON')
  assert.equal(activation.sharedReaderEnabled(''), true)
  assert.equal(activation.sharedReaderEnabled('?sharedReader=0'), false)
}
