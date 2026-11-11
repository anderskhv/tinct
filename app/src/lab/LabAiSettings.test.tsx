// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AI_INSTRUCTIONS_MAX_CHARS, defaultAiSettings } from '../aiSettings'
import { AI_SETTINGS_COPY, LabAiSettings } from './LabAiSettings'
import { aiPrefsFor, readAiSettings, withAiPrefs, writeAiSettings } from './labAiPrefs'
import { readAccountAiValue, reconcileAccountAiValue } from './labAiAccount'
import { readReadingAngle, writeReadingAngle } from './labReadingAngle'
import { ownChapterNotesBody } from './userBook/ownChapterNotes'

afterEach(() => { cleanup(); localStorage.clear() })

describe('AI settings: the dialog (approved mock)', () => {
  it('opens on General with today’s defaults, the mock’s words, and the allowance note', () => {
    render(<LabAiSettings onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: 'AI settings' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'General' }).getAttribute('aria-selected')).toBe('true')
    for (const [row, on] of [['explain', 'brief'], ['ask', 'standard'], ['primer', 'standard'], ['summary', 'brief']] as const) {
      expect(screen.getByTestId(`ai-length-${row}-${on}`).getAttribute('aria-pressed')).toBe('true')
    }
    expect(screen.getByText('Summary and Recap')).toBeTruthy()
    expect(screen.getByTestId('ai-settings-detailed-note').textContent).toBe(AI_SETTINGS_COPY.detailedNote)
    expect((screen.getByTestId('ai-settings-language') as HTMLSelectElement).value).toBe('auto')
    expect(screen.getByRole('option', { name: 'The language I ask in' })).toBeTruthy()
    expect(screen.getByText('Reset to defaults')).toBeTruthy()
  })

  it('the length headings are plain column labels: no hint, no tooltip (Anders, 11 Nov 2026)', () => {
    render(<LabAiSettings onClose={() => {}} />)
    for (const length of ['brief', 'standard', 'detailed'] as const) {
      const head = screen.getByTestId(`ai-length-head-${length}`)
      expect(head.textContent).toBe(AI_SETTINGS_COPY.lengths[length])
      expect(head.getAttribute('title')).toBeNull()
      expect(screen.getByTestId(`ai-length-explain-${length}`).getAttribute('title')).toBeNull()
    }
    expect(document.querySelector('[role="tooltip"]')).toBeNull()
  })

  it('says "Saved" a moment after a change, and nothing before one', async () => {
    render(<LabAiSettings onClose={() => {}} />)
    expect(screen.getByTestId('ai-settings-saved').textContent).toBe('')
    fireEvent.click(screen.getByTestId('ai-length-ask-brief'))
    await waitFor(() => expect(screen.getByTestId('ai-settings-saved').textContent).toBe('Saved'), { timeout: 2000 })
    expect(readAiSettings().length.ask).toBe('brief')
  })

  it('a length or a language is kept at once and rides on the next request', () => {
    render(<LabAiSettings onClose={() => {}} />)
    fireEvent.click(screen.getByTestId('ai-length-explain-detailed'))
    expect(screen.getByTestId('ai-length-explain-detailed').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('ai-length-explain-brief').getAttribute('aria-pressed')).toBe('false')
    fireEvent.change(screen.getByTestId('ai-settings-language'), { target: { value: 'da' } })
    expect(readAiSettings().length.explain).toBe('detailed')
    expect(aiPrefsFor('explain')).toEqual({ length: 'detailed', row: 'explain', language: 'da' })
    expect(withAiPrefs({ intent: 'explain', selection: 'x' })).toEqual({ intent: 'explain', selection: 'x', ai: { length: 'detailed', row: 'explain', language: 'da' } })
    // The librarian never takes them.
    expect(withAiPrefs({ intent: 'library' })).toEqual({ intent: 'library' })
  })

  it('Reset to defaults puts General back and keeps the reader’s instructions', () => {
    writeAiSettings({ ...defaultAiSettings(), length: { explain: 'detailed', ask: 'brief', primer: 'brief', summary: 'detailed' }, language: 'en', instructions: 'Keep it plain.' })
    render(<LabAiSettings onClose={() => {}} />)
    fireEvent.click(screen.getByTestId('ai-settings-reset'))
    const after = readAiSettings()
    expect(after.length).toEqual(defaultAiSettings().length)
    expect(after.language).toBe('auto')
    expect(after.instructions).toBe('Keep it plain.')
  })

  it('Custom: the reader’s instructions, held to 400 characters, and one box per action', () => {
    render(<LabAiSettings onClose={() => {}} />)
    fireEvent.click(screen.getByTestId('ai-settings-tab-custom'))
    expect(screen.getByText(AI_SETTINGS_COPY.instructionsHint)).toBeTruthy()
    const box = screen.getByTestId('ai-settings-instructions') as HTMLTextAreaElement
    expect(box.maxLength).toBe(AI_INSTRUCTIONS_MAX_CHARS)
    fireEvent.change(box, { target: { value: `Use the field’s terms. ${'x'.repeat(500)}` } })
    expect(readAiSettings().instructions).toHaveLength(AI_INSTRUCTIONS_MAX_CHARS)
    expect(screen.getByText(AI_SETTINGS_COPY.perAction)).toBeTruthy()
    fireEvent.change(screen.getByTestId('ai-settings-action-recap'), { target: { value: 'Name every god.' } })
    expect(aiPrefsFor('recap')!.instructions![1]).toBe('Name every god.')
    expect(aiPrefsFor('ask')!.instructions).toHaveLength(1)
  })

  it('Upload .md fills the box; a longer file keeps its first 400 characters and says so', async () => {
    render(<LabAiSettings onClose={() => {}} />)
    fireEvent.click(screen.getByTestId('ai-settings-tab-custom'))
    const file = new File([`# Me\n\n${'y'.repeat(600)}`], 'tinct.md', { type: 'text/markdown' })
    if (!('text' in file)) Object.defineProperty(file, 'text', { value: () => Promise.resolve(`# Me\n\n${'y'.repeat(600)}`) })
    await act(async () => { fireEvent.change(screen.getByTestId('ai-settings-file'), { target: { files: [file] } }) })
    await waitFor(() => expect(readAiSettings().instructions.startsWith('# Me')).toBe(true))
    expect(readAiSettings().instructions).toHaveLength(AI_INSTRUCTIONS_MAX_CHARS)
    expect(screen.getByTestId('ai-settings-notice').textContent).toBe(AI_SETTINGS_COPY.uploadCut)
  })

  it('closes with ×, Escape, or a click outside; the phone has a back arrow instead', () => {
    const onClose = vi.fn()
    const { unmount } = render(<LabAiSettings onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Close'))
    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.click(screen.getByTestId('ai-settings-layer'))
    fireEvent.click(screen.getByTestId('ai-settings'))
    expect(onClose).toHaveBeenCalledTimes(3)
    unmount()
    render(<LabAiSettings onClose={onClose} phone />)
    expect(screen.queryByLabelText('Close')).toBeNull()
    expect(screen.getByLabelText('Back')).toBeTruthy()
    expect(screen.getByTestId('ai-settings-layer').className).toContain('is-phone')
    expect(screen.getByText('Summary')).toBeTruthy()
  })
})

describe('AI settings and reading angles follow the account', () => {
  it('a newer account copy replaces this device’s; an older one is overwritten', () => {
    writeAiSettings({ ...defaultAiSettings(), instructions: 'Here' }, 1_000)
    const newer = { aiSettings: { settings: { ...defaultAiSettings(), instructions: 'There', language: 'da' as const }, at: 2_000 } }
    expect(reconcileAccountAiValue(newer)).toBe(false)
    expect(readAiSettings()).toMatchObject({ instructions: 'There', language: 'da' })
    // The account's copy keeps its time, so it is not written back as a new change.
    writeAiSettings({ ...defaultAiSettings(), instructions: 'Later here' }, 3_000)
    expect(reconcileAccountAiValue(newer)).toBe(true)
    expect(readAiSettings().instructions).toBe('Later here')
  })

  it('reading angles: the newer side wins, removed angles included', () => {
    writeReadingAngle('frankenstein', 'Who listens', 1_000)
    writeReadingAngle('dracula', 'Letters', 1_000)
    const remote = readAccountAiValue({ readingAngles: { angles: { frankenstein: 'Who speaks', odyssey: 'Homecoming', bad: 7 }, at: 5_000 } })
    expect(remote.readingAngles!.angles).toEqual({ frankenstein: 'Who speaks', odyssey: 'Homecoming' })
    reconcileAccountAiValue(remote)
    expect(readReadingAngle('frankenstein')).toBe('Who speaks')
    expect(readReadingAngle('odyssey')).toBe('Homecoming')
    expect(readReadingAngle('dracula')).toBe('')
  })

  it('an own book’s Recap and Primer carry the settings for their own boxes', () => {
    writeAiSettings({ ...defaultAiSettings(), length: { ...defaultAiSettings().length, summary: 'detailed' }, perAction: { recap: 'Short words.' } })
    const source = { bookTitle: 'Notes', bookAuthor: '', chapterTitle: 'One', chapterNumber: 1, paragraphs: ['A first paragraph of text.'] }
    const recap = ownChapterNotesBody('end', source) as { companion: { ai?: unknown } }
    expect(recap.companion.ai).toEqual({ length: 'detailed', row: 'summary', instructions: ['Short words.'] })
    const primer = ownChapterNotesBody('primer', source) as { companion: { ai?: unknown } }
    expect(primer.companion.ai).toBeUndefined()
  })
})
