import { useState, useCallback, useRef } from 'react'

interface ProactiveInsightState {
  text: string | null
  visible: boolean
}

interface UseProactiveInsightOptions {
  readingObjective: string
  bookTitle: string
  bookAuthor: string
  chapterTitle: string
  paragraphs: string[]
}

const MIN_GAP_MS = 5 * 60 * 1000 // 5 minutes between insights
const MAX_PER_SESSION = 3
const TRIGGER_PROBABILITY = 0.25 // ~1 in 4 eligible page turns

export function useProactiveInsight(options: UseProactiveInsightOptions) {
  const [insight, setInsight] = useState<ProactiveInsightState>({ text: null, visible: false })
  const lastInsightTime = useRef(0)
  const sessionCount = useRef(0)
  const isChecking = useRef(false)
  const dismissTimer = useRef<ReturnType<typeof setTimeout>>()
  const optionsRef = useRef(options)
  optionsRef.current = options

  const checkForInsight = useCallback(async (currentPage: number, totalPages: number) => {
    const opts = optionsRef.current
    // Only fire when reading objective is set
    if (!opts.readingObjective) return
    // Rate limit
    if (sessionCount.current >= MAX_PER_SESSION) return
    if (Date.now() - lastInsightTime.current < MIN_GAP_MS) return
    // Probability gate
    if (Math.random() > TRIGGER_PROBABILITY) return
    // Don't double-fire
    if (isChecking.current) return
    isChecking.current = true

    try {
      // Get a snippet of text from the current page area
      const paraStart = Math.floor((currentPage / Math.max(totalPages, 1)) * opts.paragraphs.length)
      const snippet = opts.paragraphs.slice(paraStart, paraStart + 3).join(' ').slice(0, 500)
      if (!snippet) return

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          system: `You are a literary insight engine. The reader is reading ${opts.bookTitle} by ${opts.bookAuthor} (${opts.chapterTitle}). Their reading angle is: "${opts.readingObjective}". Given the text they're currently reading, identify if there's a non-obvious, genuinely interesting connection to their reading angle. If yes, respond with a 1-2 sentence insight. If there's no strong connection, respond with exactly "NONE". Never force a connection.`,
          messages: [{ role: 'user', content: snippet }],
        }),
      })

      const data = await response.json()
      const text = data.content?.[0]?.text?.trim()

      if (text && text !== 'NONE') {
        lastInsightTime.current = Date.now()
        sessionCount.current++
        setInsight({ text, visible: true })

        // Auto-dismiss after 15 seconds
        if (dismissTimer.current) clearTimeout(dismissTimer.current)
        dismissTimer.current = setTimeout(() => {
          setInsight(prev => ({ ...prev, visible: false }))
        }, 15000)
      }
    } catch {
      // Silently fail — proactive insights are non-essential
    } finally {
      isChecking.current = false
    }
  }, [])

  const dismiss = useCallback(() => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current)
    setInsight(prev => ({ ...prev, visible: false }))
  }, [])

  const getInsightForDiscussion = useCallback(() => {
    const text = insight.text
    dismiss()
    return text
  }, [insight.text, dismiss])

  return {
    insight: insight.visible ? insight.text : null,
    checkForInsight,
    dismiss,
    getInsightForDiscussion,
  }
}
