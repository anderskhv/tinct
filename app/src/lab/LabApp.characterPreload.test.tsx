// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { bibleFallbackSource } from './labSource'

afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); vi.unstubAllGlobals() })

it('does not download a complete comparison Bible when only one edition is selected', async () => {
  localStorage.setItem('tinct-lab-prefs', JSON.stringify({ primaryEdition: 'web-en', compareEdition: 'kjv-en', compareOpen: false }))
  const fetcher = vi.fn(async (_input: RequestInfo | URL) => ({ ok: false, status: 404, json: async () => ({}) }))
  vi.stubGlobal('fetch', fetcher)
  render(<LabApp pathname="/lab/phone" search="?chrome=v2" source={bibleFallbackSource()} authToken={null} online={false} />)
  await waitFor(() => expect(fetcher.mock.calls.some(call => String(call[0]).includes('/data/editions/bible-web-en.json'))).toBe(true))
  expect(fetcher.mock.calls.some(call => String(call[0]).includes('/data/editions/bible-kjv-en.json'))).toBe(false)
})
