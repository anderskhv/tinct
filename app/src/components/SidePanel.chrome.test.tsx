// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PRODUCTION_DESKTOP_PANES } from '../lab/labChrome'
import { SidePanel } from './SidePanel'
import type { ThreadCharacter } from '../types'

afterEach(() => {
  cleanup()
})

const telemachus: ThreadCharacter = {
  id: 'telemachus',
  name: { en: 'Telemachus' },
  epithet: { en: 'Son of Odysseus' },
  role: 'mortal',
  searchNames: ['Telemachus'],
  chapters: {},
}

function productionPanel() {
  return (
    <SidePanel
      isOpen
      activeTab="chat"
      onTabChange={vi.fn()}
      messages={[]}
      isChatLoading={false}
      onSendMessage={vi.fn()}
      onClearChat={vi.fn()}
      pendingHighlight={null}
      onClearHighlight={vi.fn()}
      notes={[]}
      highlights={[]}
      onAddNote={vi.fn()}
      onDeleteNote={vi.fn()}
      onUpdateNote={vi.fn()}
      onCopyToNotes={vi.fn()}
      allBookHighlights={[]}
      allBookNotes={[]}
      chapterLabels={['Book 1']}
      readingLog={{ bookId: 'odyssey', chapters: {}, updatedAt: 0 }}
      totalChapters={24}
      threadCharacters={[telemachus]}
      currentChapter={1}
      editionKey="original-en"
      language="en"
      getMentions={() => []}
      onNavigateToChapter={vi.fn()}
    />
  )
}

describe('production /app chrome', () => {
  it('still mounts the old reader chrome from App.tsx', () => {
    const app = readFileSync(resolve(__dirname, '../App.tsx'), 'utf8')
    expect(app).toContain("from './components/Reader'")
    expect(app).toContain("from './components/SidePanel'")
    expect(app).toContain('<SidePanel')
    expect(app).not.toContain("from './lab/LabApp'")
  })

  it('still uses Chat, Feed, and Cast as the desktop rails', () => {
    expect(PRODUCTION_DESKTOP_PANES).toEqual(['Chat', 'Feed', 'Cast'])
    render(productionPanel())

    for (const pane of PRODUCTION_DESKTOP_PANES) {
      expect(screen.getByRole('button', { name: pane })).toBeTruthy()
    }
    expect(document.querySelector('.side-panel-stack')).toBeTruthy()
    expect(document.querySelector('.card-rail-chat')).toBeTruthy()
    expect(document.querySelector('.card-rail-feed')).toBeTruthy()
    expect(document.querySelector('.card-rail-cast')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Ask' })).toBeNull()
  })
})
