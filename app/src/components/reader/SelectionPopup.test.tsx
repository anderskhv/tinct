// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SelectionPopup, type SelectionInfo, type SelectionPopupProps } from './SelectionPopup'
import type { DictResult } from '../../services/dictionary'

function selection(overrides: Partial<SelectionInfo> = {}): SelectionInfo {
  return {
    x: 100,
    y: 80,
    text: 'selfishness',
    paragraphIndex: 0,
    startOffset: 0,
    endOffset: 11,
    ...overrides,
  }
}

function props(overrides: Partial<SelectionPopupProps> = {}): SelectionPopupProps {
  return {
    selection: selection(),
    popupRef: { current: null },
    popupMode: 'define',
    setPopupMode: vi.fn(),
    onColorClick: vi.fn(),
    defineQuery: 'selfishness',
    setDefineQuery: vi.fn(),
    defineResult: null,
    defineLoading: true,
    defineNotFound: false,
    runDefine: vi.fn(),
    onDefine: vi.fn(),
    issueTag: '',
    setIssueTag: vi.fn(),
    issueComment: '',
    setIssueComment: vi.fn(),
    issueSubmitting: false,
    onIssueSubmit: vi.fn(),
    noteInput: '',
    setNoteInput: vi.fn(),
    onUpdateHighlightNote: vi.fn(),
    onRequestNote: vi.fn(),
    onExplain: vi.fn(),
    onCopy: vi.fn(),
    onShare: vi.fn(),
    onDeleteHighlight: vi.fn(),
    dismissPopup: vi.fn(),
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('SelectionPopup', () => {
  it('single-word define mode shows the lookup immediately with colour dots, copy, and note', () => {
    render(<SelectionPopup {...props({ popupMode: 'define', defineLoading: true, defineQuery: 'selfishness' })} />)

    expect(screen.getByText('selfishness')).toBeTruthy()
    expect(screen.getByText('Looking up…')).toBeTruthy()
    expect(screen.getAllByTitle(/Highlight /)).toHaveLength(5)
    expect(screen.getByTitle('Copy text')).toBeTruthy()
    expect(screen.getByTitle('Add a note')).toBeTruthy()
    expect(screen.queryByText('Highlight')).toBeNull()
    expect(screen.queryByText('Type a word and press Enter to look it up.')).toBeNull()
  })

  it('shows the definition on the same card as the colour bar', () => {
    const defineResult: DictResult = {
      word: 'selfishness',
      definitions: ['concern with one\'s own interests'],
    }
    render(<SelectionPopup {...props({ popupMode: 'define', defineLoading: false, defineResult })} />)

    expect(screen.getByText('selfishness')).toBeTruthy()
    expect(screen.getByText("concern with one's own interests")).toBeTruthy()
    expect(screen.getByTitle('Highlight Gold')).toBeTruthy()
  })

  it('multi-word colors mode shows colour dots first, not the icon menu', () => {
    render(<SelectionPopup {...props({
      popupMode: 'colors',
      selection: selection({ text: 'selfishness and pride', endOffset: 21 }),
      defineQuery: '',
      defineLoading: false,
    })} />)

    expect(screen.getAllByTitle(/Highlight /)).toHaveLength(5)
    expect(screen.getByTitle('Copy text')).toBeTruthy()
    expect(screen.getByTitle('Add a note')).toBeTruthy()
    expect(screen.queryByText('Looking up…')).toBeNull()
    expect(screen.queryByText('Highlight')).toBeNull()
    expect(screen.queryByText('Define')).toBeNull()
    expect(screen.queryByText('Explain')).toBeNull()
  })

  it('tapping a colour calls onColorClick without going through a submenu', async () => {
    const onColorClick = vi.fn()
    const { container } = render(<SelectionPopup {...props({
      popupMode: 'colors',
      selection: selection({ text: 'selfishness and pride' }),
      onColorClick,
    })} />)

    const gold = container.querySelector('.popup-color-dot.highlight-gold') as HTMLButtonElement
    gold.click()
    expect(onColorClick).toHaveBeenCalledWith('gold')
  })

  it('existing highlight shows colours, note, and delete', () => {
    render(<SelectionPopup {...props({
      popupMode: 'colors',
      selection: selection({ existingHighlightId: 'hl_1', existingNote: 'keep' }),
    })} />)

    expect(screen.getAllByTitle(/Highlight /)).toHaveLength(5)
    expect(screen.getByTitle('Add a note')).toBeTruthy()
    expect(screen.getByTitle('Delete highlight')).toBeTruthy()
  })

  it('keeps Explain and Report behind the overflow, not as the default', () => {
    const setPopupMode = vi.fn()
    const { rerender } = render(<SelectionPopup {...props({
      popupMode: 'colors',
      selection: selection({ text: 'selfishness and pride' }),
      setPopupMode,
    })} />)

    expect(screen.queryByText('Explain')).toBeNull()
    expect(screen.queryByText('Report')).toBeNull()

    screen.getByTitle('More actions').click()
    expect(setPopupMode).toHaveBeenCalledWith('main')

    rerender(<SelectionPopup {...props({
      popupMode: 'main',
      selection: selection({ text: 'selfishness and pride' }),
      setPopupMode,
    })} />)

    expect(screen.getByText('Explain')).toBeTruthy()
    expect(screen.getByText('Report')).toBeTruthy()
  })

  it('existing-highlight note editor still saves and can cancel without deleting', () => {
    const onUpdateHighlightNote = vi.fn()
    const dismissPopup = vi.fn()
    render(<SelectionPopup {...props({
      popupMode: 'note',
      selection: selection({ existingHighlightId: 'hl_1' }),
      noteInput: 'a kept note',
      onUpdateHighlightNote,
      dismissPopup,
    })} />)

    screen.getByText('Save').click()
    expect(onUpdateHighlightNote).toHaveBeenCalledWith('hl_1', 'a kept note')
    expect(dismissPopup).toHaveBeenCalled()
  })
})
