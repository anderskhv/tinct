// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabApp } from './LabApp'
import { fallbackLabSource, resetLabBibleManifestCache, resetLabChapterTextCache } from './labSource'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/')
  resetLabBibleManifestCache()
  resetLabChapterTextCache()
})

function openSharedPhone() {
  window.history.replaceState(null, '', '/reader?book=odyssey&sharedReader=1&layout=phone')
  const source = fallbackLabSource()
  return render(<LabApp pathname="/reader" search={window.location.search} source={{
    ...source,
    bookId: 'odyssey',
    paragraphs: ['A short chapter has words to select and explain.'],
    followParagraphs: [{ index: 0, text: 'A short chapter has words to select and explain.' }],
  }} authToken={null} sharedReader marginPhone />)
}

function selectPassage() {
  const words = screen.getAllByTestId('lab-word')
  fireEvent.pointerDown(words[1], { pointerId: 41, pointerType: 'mouse', clientX: 150, clientY: 200 })
  fireEvent.pointerMove(words[3], { pointerId: 41, pointerType: 'mouse', clientX: 230, clientY: 200 })
  fireEvent.pointerUp(words[3], { pointerId: 41, pointerType: 'mouse', clientX: 230, clientY: 200 })
}

it('routes selected text through the compact phone bar and an Explain bottom card', async () => {
  openSharedPhone()
  const root = screen.getByTestId('lab-root')
  expect(root.getAttribute('data-lab-layout')).toBe('phone')
  expect(root.classList.contains('is-margin-phone')).toBe(true)
  expect(screen.queryByTestId('lab-header-aa')).toBeNull()
  selectPassage()
  expect(screen.getByTestId('lab-pbar-explain')).toBeTruthy()
  expect(document.querySelector('.selection-popup')).toBeNull()
  fireEvent.click(screen.getByTestId('lab-pbar-explain'))
  expect(screen.getByTestId('lab-phone-card').getAttribute('data-kind')).toBe('explain')
  expect(screen.getByTestId('lab-phone-card-dock')).toBeTruthy()
  expect(document.querySelector('.selection-popup.is-contextual-explain')).toBeNull()
  expect(screen.getByTestId('lab-phone-card-label').textContent).toContain('Explain')
})

it('routes a passage note and quiz to one keyboard-aware phone card at a time', () => {
  openSharedPhone()
  selectPassage()
  fireEvent.click(screen.getByTestId('lab-pbar-note'))
  expect(screen.getByTestId('lab-phone-card').getAttribute('data-kind')).toBe('note')
  expect(screen.getByTestId('lab-phone-card-dock')).toBeTruthy()
  fireEvent.pointerDown(screen.getByTestId('lab-phone-card-drag'), { pointerId: 1, clientY: 400 })
  fireEvent.pointerUp(screen.getByTestId('lab-phone-card-drag'), { pointerId: 1, clientY: 500 })
  selectPassage()
  fireEvent.click(screen.getByTestId('lab-pbar-more'))
  fireEvent.click(screen.getByTestId('lab-pmore-quiz'))
  expect(screen.getByTestId('lab-phone-card').getAttribute('data-kind')).toBe('quiz')
})
