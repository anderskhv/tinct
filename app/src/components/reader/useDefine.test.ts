// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDefine } from './useDefine'
import { lookup as dictLookup } from '../../services/dictionary'

vi.mock('../../services/dictionary', () => ({
  lookup: vi.fn(),
}))

const mockedLookup = vi.mocked(dictLookup)

afterEach(() => {
  mockedLookup.mockReset()
})

describe('useDefine', () => {
  it('begin() with a single word wrapped in punctuation looks it up immediately', async () => {
    mockedLookup.mockResolvedValue({ word: 'selfishness', definitions: ['concern with oneself'] } as never)
    const { result } = renderHook(() => useDefine())

    act(() => { result.current.begin('selfishness,') })
    expect(result.current.query).toBe('selfishness')
    expect(mockedLookup).toHaveBeenCalledWith('selfishness')
  })

  it('begin() with a single word looks it up immediately and stores the result', async () => {
    mockedLookup.mockResolvedValue({ word: 'sea', definitions: [{ partOfSpeech: 'noun', definition: 'the ocean' }] } as never)
    const { result } = renderHook(() => useDefine())

    act(() => { result.current.begin('  Sea  ') })
    expect(result.current.query).toBe('Sea')
    expect(mockedLookup).toHaveBeenCalledWith('Sea')

    await waitFor(() => expect(result.current.result?.word).toBe('sea'))
    expect(result.current.loading).toBe(false)
    expect(result.current.notFound).toBe(false)
  })

  it('begin() with a multi-word phrase seeds an empty editable query and does NOT auto-look-up', () => {
    const { result } = renderHook(() => useDefine())
    act(() => { result.current.begin('the wine-dark sea') })
    expect(result.current.query).toBe('')
    expect(mockedLookup).not.toHaveBeenCalled()
  })

  it('run() marks notFound when the lookup returns null', async () => {
    mockedLookup.mockResolvedValue(null as never)
    const { result } = renderHook(() => useDefine())
    act(() => { result.current.run('asdfqwer') })
    await waitFor(() => expect(result.current.notFound).toBe(true))
    expect(result.current.result).toBeNull()
  })

  it('run() with a blank query clears state and does not look up', () => {
    const { result } = renderHook(() => useDefine())
    act(() => { result.current.run('   ') })
    expect(mockedLookup).not.toHaveBeenCalled()
    expect(result.current.result).toBeNull()
    expect(result.current.notFound).toBe(false)
  })
})
