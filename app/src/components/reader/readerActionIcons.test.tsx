// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SelectionPopup, type SelectionPopupProps } from './SelectionPopup'
import { ContextualExplainCard } from './ContextualExplainCard'
import { CHAT_ICON_PATHS, HIGHLIGHT_ICON_PATHS } from '../../lab/LabReaderIcons'
import { RowIcon } from '../../lab/LabSuperMenu.tsx'

/**
 * Anders, 2026-10-07: chat is always called Chat and always drawn with one
 * icon, and Highlight likewise. The selection menu and the Explain card used
 * to draw different bubbles and different highlight glyphs.
 */

afterEach(cleanup)

function paths(svg: Element | null | undefined): string[] {
  expect(svg, 'icon rendered').toBeTruthy()
  return Array.from(svg!.querySelectorAll('path')).map(path => path.getAttribute('d') ?? '')
}

function iconIn(button: HTMLElement): Element | null {
  return button.querySelector('svg')
}

function menuProps(): SelectionPopupProps {
  return {
    selection: { x: 100, y: 80, text: 'selfishness', paragraphIndex: 0, startOffset: 0, endOffset: 11 },
    popupRef: { current: null },
    popupMode: 'main',
    setPopupMode: vi.fn(),
    onColorClick: vi.fn(),
    defineQuery: '',
    setDefineQuery: vi.fn(),
    defineResult: null,
    defineLoading: false,
    defineNotFound: false,
    runDefine: vi.fn(),
    onDefine: vi.fn(),
    issueTag: '',
    setIssueTag: vi.fn(),
    issueComment: '',
    setIssueComment: vi.fn(),
    issueSubmitting: false,
    onIssueSubmit: vi.fn(),
    onRequestNote: vi.fn(),
    onExplain: vi.fn(),
    onCopy: vi.fn(),
    dismissPopup: vi.fn(),
    lab: true,
    onRequestExplanation: vi.fn().mockResolvedValue('An explanation.'),
  } as unknown as SelectionPopupProps
}

describe('one Chat icon and one Highlight icon', () => {
  it('the selection menu and the Explain card draw the same Chat and Highlight icons', async () => {
    render(<SelectionPopup {...menuProps()} />)
    const menuChat = screen.getByRole('button', { name: 'Chat', exact: true })
    const menuHighlight = screen.getByRole('button', { name: 'Highlight', exact: true })
    expect(screen.queryByRole('button', { name: 'Ask', exact: true })).toBeNull()
    expect(paths(iconIn(menuChat))).toEqual([...CHAT_ICON_PATHS])
    expect(paths(iconIn(menuHighlight))).toEqual([...HIGHLIGHT_ICON_PATHS])
    cleanup()

    const onAsk = vi.fn()
    render(<ContextualExplainCard passage="selfishness" request={vi.fn().mockResolvedValue('An explanation.')} onAsk={onAsk} onHighlight={vi.fn()} />)
    await screen.findByText('An explanation.')
    const cardChat = screen.getByRole('button', { name: 'Chat about this explanation' })
    const cardHighlight = screen.getByRole('button', { name: 'Highlight this passage' })
    expect(paths(iconIn(cardChat))).toEqual([...CHAT_ICON_PATHS])
    expect(paths(iconIn(cardHighlight))).toEqual([...HIGHLIGHT_ICON_PATHS])
    fireEvent.click(cardChat)
    expect(onAsk).toHaveBeenCalledWith('An explanation.')
  })

  it('the Librarian row draws that same Chat icon', () => {
    const { container: row } = render(<RowIcon id="chat" />)
    expect(paths(row.querySelector('svg'))).toEqual([...CHAT_ICON_PATHS])
  })
})
