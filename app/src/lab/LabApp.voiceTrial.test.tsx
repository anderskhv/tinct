// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { useVoiceSession } from '../hooks/useVoiceSession'
import { LabApp } from './LabApp'
import { fallbackLabSource } from './labSource'

const captured = vi.hoisted(() => ({ options: null as Parameters<typeof useVoiceSession>[0] | null }))
vi.mock('../hooks/useVoiceSession', async importOriginal => {
  const original = await importOriginal<typeof import('../hooks/useVoiceSession')>()
  return { ...original, useVoiceSession: (options: Parameters<typeof useVoiceSession>[0]) => {
    captured.options = options
    return original.useVoiceSession(options)
  } }
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  localStorage.clear()
})

it('lets a direct voice resume command finish before closing the call successfully', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 404 })))
  vi.stubGlobal('navigator', {
    ...navigator,
    mediaDevices: { getUserMedia: () => new Promise(() => {}) },
  })
  render(<LabApp pathname="/lab/phone" search="?chrome=v2&voiceTrial=full" source={fallbackLabSource()} authToken={null} />)
  fireEvent.click(screen.getByTestId('lab-super'))
  fireEvent.click(screen.getByTestId('lab-super-row-talk'))
  await waitFor(() => expect(screen.getByTestId('lab-call')).toBeTruthy())

  // A transcript is evidence of what was said, not a second command handler.
  act(() => captured.options?.appendLocalMessage?.({
    id: 'resume-turn', role: 'user', content: 'Please resume the audiobook now.',
    timestamp: Date.now(), bookId: 'bible',
  }))
  expect(screen.getByTestId('lab-call')).toBeTruthy()

  // The engine calls this only when the resume command has completed.
  act(() => captured.options?.resumePlayback?.({
    bookId: 'bible', editionKey: 'kjv-en', chapterNumber: 1,
    paragraphIndex: 0, paragraphNumber: 1, offsetSeconds: 0,
  }))
  await waitFor(() => expect(screen.queryByTestId('lab-call')).toBeNull())
  expect(screen.queryByTestId('lab-call-reconnect')).toBeNull()
})
