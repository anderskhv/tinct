// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AI_INSTRUCTIONS_MAX_CHARS, defaultAiSettings } from '../aiSettings'
import { AI_SETTINGS_COPY, LabAiSettings } from './LabAiSettings'
import { aiPrefsFor, readAiSettings, setAiSettingsBook, withAiPrefs, writeAiSettings } from './labAiPrefs'
import { readAccountAiValue, reconcileAccountAiValue } from './labAiAccount'
import { readReadingAngle, writeReadingAngle } from './labReadingAngle'
import { ownChapterNotesBody } from './userBook/ownChapterNotes'

afterEach(() => { cleanup(); localStorage.clear(); setAiSettingsBook(null) })

const bible = { id: 'bible', title: 'The Bible' }

describe('AI settings: the dialog (General and This book, 11 Nov 2026)', () => {
  it('opens on General: every length on Standard, then the reader’s instructions; no answer language, no Custom tab', () => {
    render(<LabAiSettings onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: 'AI settings' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'General' }).getAttribute('aria-selected')).toBe('true')
    for (const row of ['explain', 'ask', 'primer', 'summary'] as const) {
      expect(screen.getByTestId(`ai-length-${row}-standard`).getAttribute('aria-pressed')).toBe('true')
    }
    expect(screen.getByText('Summary and Recap')).toBeTruthy()
    expect(screen.getByText('Reset to defaults')).toBeTruthy()
    expect(screen.getByTestId('ai-settings-instructions')).toBeTruthy()
    expect(screen.queryByTestId('ai-settings-language')).toBeNull()
    expect(screen.queryByText('Answer in')).toBeNull()
    expect(screen.queryByTestId('ai-settings-tab-custom')).toBeNull()
    // Without a book (Profile from the library) there is General only.
    expect(screen.queryByTestId('ai-settings-tab-book')).toBeNull()
    expect(screen.getAllByRole('tab')).toHaveLength(1)
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

  it('a length is kept at once and rides on the next request', () => {
    render(<LabAiSettings onClose={() => {}} />)
    fireEvent.click(screen.getByTestId('ai-length-explain-detailed'))
    expect(screen.getByTestId('ai-length-explain-detailed').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('ai-length-explain-standard').getAttribute('aria-pressed')).toBe('false')
    expect(readAiSettings().length.explain).toBe('detailed')
    expect(aiPrefsFor('explain')).toEqual({ length: 'detailed', row: 'explain' })
    expect(withAiPrefs({ intent: 'explain', selection: 'x' })).toEqual({ intent: 'explain', selection: 'x', ai: { length: 'detailed', row: 'explain' } })
    // The librarian never takes them.
    expect(withAiPrefs({ intent: 'library' })).toEqual({ intent: 'library' })
  })

  it('Reset to defaults puts General’s lengths back and keeps the reader’s instructions and each book’s own lengths', () => {
    writeAiSettings({ ...defaultAiSettings(), length: { explain: 'detailed', ask: 'brief', primer: 'brief', summary: 'detailed' }, books: { bible: { ask: 'detailed' } }, instructions: 'Keep it plain.' })
    render(<LabAiSettings onClose={() => {}} />)
    fireEvent.click(screen.getByTestId('ai-settings-reset'))
    const after = readAiSettings()
    expect(after.length).toEqual(defaultAiSettings().length)
    expect(after.instructions).toBe('Keep it plain.')
    expect(after.books).toEqual({ bible: { ask: 'detailed' } })
  })

  it('This book holds only the reading angle, with what it is for; lengths are General’s (Anders, 12 Nov 2026)', () => {
    writeReadingAngle('bible', 'How the Old and New Testament point to each other')
    // A book length saved before 12 Nov 2026 no longer applies: nothing hidden overrides General.
    writeAiSettings({ ...defaultAiSettings(), books: { bible: { primer: 'brief' } } })
    setAiSettingsBook('bible')
    render(<LabAiSettings onClose={() => {}} book={bible} tab="book" focusAngle />)
    expect(screen.getByRole('tab', { name: 'This book' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByTestId('ai-settings-book-scope').textContent).toBe('The Bible. Anything set here applies to this book only.')
    const panel = screen.getByTestId('ai-settings-book')
    expect(panel.querySelector('[data-testid^="ai-book-length-"]')).toBeNull()
    expect(screen.queryByTestId('ai-settings-reset-book')).toBeNull()
    expect(panel.textContent).toContain(AI_SETTINGS_COPY.readingAngleHint)
    expect(aiPrefsFor('primer')).toEqual({ length: 'standard', row: 'primer' })
    const angle = screen.getByTestId('ai-settings-angle') as HTMLTextAreaElement
    expect(angle.value).toBe('How the Old and New Testament point to each other')
    // A "Set reading angle" entry lands with the caret in the field.
    expect(document.activeElement).toBe(angle)
    fireEvent.change(angle, { target: { value: 'Who is speaking' } })
    expect(readReadingAngle('bible')).toBe('Who is speaking')
    // No dictation on a page without it.
    expect(screen.queryByTestId('ai-settings-angle-mic')).toBeNull()
  })

  it('General: the reader’s instructions, held to 400 characters, and one box per action', () => {
    render(<LabAiSettings onClose={() => {}} />)
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
    expect(screen.getByText('Summary', { selector: '.lab-ai-row' })).toBeTruthy()
  })
})

describe('AI settings and reading angles follow the account', () => {
  it('a newer account copy replaces this device’s, its books’ lengths with it; an older one is overwritten', () => {
    writeAiSettings({ ...defaultAiSettings(), instructions: 'Here' }, 1_000)
    const newer = { aiSettings: { settings: { ...defaultAiSettings(), instructions: 'There', books: { bible: { explain: 'detailed' as const } } }, at: 2_000 } }
    expect(reconcileAccountAiValue(newer)).toBe(false)
    expect(readAiSettings()).toMatchObject({ instructions: 'There', books: { bible: { explain: 'detailed' } } })
    // The account's copy keeps its time, so it is not written back as a new change.
    writeAiSettings({ ...defaultAiSettings(), instructions: 'Later here' }, 3_000)
    expect(reconcileAccountAiValue(newer)).toBe(true)
    expect(readAiSettings().instructions).toBe('Later here')
  })

  it('an account row written before 11 Nov 2026 still reads: its answer language is dropped, its lengths kept as they were named', () => {
    const old = readAccountAiValue({ aiSettings: { settings: { length: { explain: 'brief', ask: 'standard', primer: 'standard', summary: 'detailed' }, language: 'da', instructions: 'Plain words.', perAction: {} }, at: 9 } })
    expect(old.aiSettings!.settings).toEqual({ length: { explain: 'brief', ask: 'standard', primer: 'standard', summary: 'detailed' }, books: {}, instructions: 'Plain words.', perAction: {} })
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

  it('an own book’s Recap and Primer carry their lengths and the settings for their own boxes', () => {
    writeAiSettings({ ...defaultAiSettings(), length: { ...defaultAiSettings().length, summary: 'detailed' }, perAction: { recap: 'Short words.' } })
    const source = { bookTitle: 'Notes', bookAuthor: '', chapterTitle: 'One', chapterNumber: 1, paragraphs: ['A first paragraph of text.'] }
    const recap = ownChapterNotesBody('end', source) as { companion: { ai?: unknown } }
    expect(recap.companion.ai).toEqual({ length: 'detailed', row: 'summary', instructions: ['Short words.'] })
    const primer = ownChapterNotesBody('primer', source) as { companion: { ai?: unknown } }
    expect(primer.companion.ai).toEqual({ length: 'standard', row: 'primer' })
  })
})
