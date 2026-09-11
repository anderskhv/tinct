// @vitest-environment jsdom
//
// Chrome V2 is opt-in, which means the reader without the flag must not change
// at all. The baseline beside this file is the phone reader's DOM as it stood
// on 510ad03b, before any V2 work; this compares the current unflagged render
// against it byte for byte.
//
// If this fails, either a V2 change leaked out of its flag — fix the change —
// or today's chrome was deliberately altered, in which case regenerate the
// baseline with LAB_V1_DOM_WRITE=1 and say so in the commit.

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'

const BASELINE = resolve(__dirname, 'labV1Dom.baseline.html')

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  try { localStorage.clear() } catch { /* jsdom */ }
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

it('renders the unflagged phone reader exactly as it did before Chrome V2', () => {
  render(<LabApp pathname="/lab/phone" search="" source={fallbackLabSource()} authToken={null} />)
  const html = screen.getByTestId('lab-root').outerHTML.replace(/></g, '>\n<')
  if (process.env.LAB_V1_DOM_WRITE) writeFileSync(BASELINE, html)
  expect(html).toBe(readFileSync(BASELINE, 'utf8'))
})
