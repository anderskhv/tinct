// @vitest-environment jsdom

import { act, cleanup, render } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { resetBackCloses, useBackCloses } from './useBackCloses'

const tick = () => act(() => new Promise(resolve => setTimeout(resolve, 20)))

let api: { open: (name: 'contents' | 'menu' | 'sheet') => void; close: (name: 'contents' | 'menu' | 'sheet') => void; swap: () => void; state: () => Record<string, boolean> }

function Reader() {
  const [contents, setContents] = useState(false)
  const [menu, setMenu] = useState(false)
  const [sheet, setSheet] = useState(false)
  useBackCloses(contents, () => setContents(false))
  useBackCloses(menu, () => setMenu(false))
  useBackCloses(sheet, () => setSheet(false))
  const set = { contents: setContents, menu: setMenu, sheet: setSheet }
  api = {
    open: name => set[name](true),
    close: name => set[name](false),
    // The menu hands over to a sheet in one render.
    swap: () => { setMenu(false); setSheet(true) },
    state: () => ({ contents, menu, sheet }),
  }
  return null
}

describe('Back closes the reader panel in front', () => {
  beforeEach(() => { resetBackCloses(); history.replaceState(null, '', '/reader') })
  afterEach(() => cleanup())

  it('closes Contents and stays in the reader', async () => {
    render(<Reader />)
    const start = history.length
    await act(() => api.open('contents'))
    await tick()
    expect(history.length).toBe(start + 1)
    history.back()
    await tick()
    expect(api.state().contents).toBe(false)
    expect(location.pathname).toBe('/reader')
  })

  it('closing by button removes the entry, so the next Back is not swallowed', async () => {
    render(<Reader />)
    await act(() => api.open('contents'))
    await tick()
    const depth = history.state?.tinctReaderLayer
    expect(depth).toBe(1)
    await act(() => api.close('contents'))
    await tick()
    expect(history.state?.tinctReaderLayer).toBeUndefined()
  })

  it('a menu handing over to a sheet keeps one entry, and Back closes the sheet', async () => {
    render(<Reader />)
    await act(() => api.open('menu'))
    await tick()
    const length = history.length
    await act(() => api.swap())
    await tick()
    expect(history.length).toBe(length)
    expect(history.state?.tinctReaderLayer).toBe(1)
    history.back()
    await tick()
    expect(api.state()).toEqual({ contents: false, menu: false, sheet: false })
  })

  it('stacked panels close top first', async () => {
    render(<Reader />)
    await act(() => api.open('contents'))
    await tick()
    await act(() => api.open('sheet'))
    await tick()
    history.back()
    await tick()
    expect(api.state()).toEqual({ contents: true, menu: false, sheet: false })
    history.back()
    await tick()
    expect(api.state().contents).toBe(false)
  })
})
