import { useState, useEffect, useCallback } from 'react'
import { Header } from './components/Header'
import { Reader } from './components/Reader'
import { SidePanel } from './components/SidePanel'
import { fetchOdysseyText } from './data/odyssey'
import { useClaude } from './hooks/useClaude'
import type { TranslationKey } from './types'

export default function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true)
  const [currentTranslation, setCurrentTranslation] = useState<TranslationKey>('butler')
  const [currentChapter, setCurrentChapter] = useState(1)
  const [pendingHighlight, setPendingHighlight] = useState<string | null>(null)

  // Chapter data per translation
  const [butlerChapters, setButlerChapters] = useState<{ number: number; title: string; text: string }[]>([])
  const [popeChapters, setPopeChapters] = useState<{ number: number; title: string; text: string }[]>([])
  const [textLoading, setTextLoading] = useState(true)

  const { messages, isLoading: chatLoading, sendMessage, clearMessages } = useClaude()

  // Fetch texts on mount
  useEffect(() => {
    async function loadTexts() {
      setTextLoading(true)
      const [butler, pope] = await Promise.all([
        fetchOdysseyText('butler'),
        fetchOdysseyText('pope'),
      ])
      setButlerChapters(butler)
      setPopeChapters(pope)
      setTextLoading(false)
    }
    loadTexts()
  }, [])

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const chapters = currentTranslation === 'butler' ? butlerChapters : popeChapters
  const currentChapterData = chapters.find(c => c.number === currentChapter)
  const translationInfo = currentTranslation === 'butler'
    ? 'Translated by Samuel Butler (1900) · Prose'
    : 'Translated by Alexander Pope (1726) · Verse'

  const handleTextSelect = useCallback((text: string) => {
    setPendingHighlight(text)
    if (!panelOpen) setPanelOpen(true)
  }, [panelOpen])

  const handleSendMessage = useCallback((content: string, highlightedText?: string) => {
    sendMessage(content, highlightedText)
  }, [sendMessage])

  return (
    <div className="app">
      <Header
        currentTranslation={currentTranslation}
        onTranslationChange={setCurrentTranslation}
        currentChapter={currentChapter}
        totalChapters={chapters.length || 24}
        onChapterChange={setCurrentChapter}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(d => !d)}
        onTogglePanel={() => setPanelOpen(p => !p)}
        panelOpen={panelOpen}
      />

      <main className="main-layout">
        <Reader
          text={currentChapterData?.text || ''}
          chapterTitle={currentChapterData?.title || `Book ${currentChapter}`}
          translatorInfo={translationInfo}
          isLoading={textLoading}
          onTextSelect={handleTextSelect}
        />
        <SidePanel
          isOpen={panelOpen}
          messages={messages}
          isLoading={chatLoading}
          onSendMessage={handleSendMessage}
          onClear={clearMessages}
          pendingHighlight={pendingHighlight}
          onClearHighlight={() => setPendingHighlight(null)}
        />
      </main>
    </div>
  )
}
