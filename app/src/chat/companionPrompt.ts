/**
 * Production Tinct companion prompt builders.
 *
 * Typed Chat in /read uses these. Lab typed Chat and the Talk escalate
 * hop reuse the same voice and chapter-grounding blocks so Claude, not
 * Realtime, does the thinking.
 */

export function buildCompanionSystemPrompt(
  bookTitle: string,
  bookAuthor: string,
  chapterTitle: string,
  readingObjective?: string,
  previousChapters?: string[],
): string {
  // Structured "current state" block. The reader can jump between chapters
  // mid-conversation (especially in the Bible — cross-references, parallel
  // passages). The model needs to distinguish "what's on screen right now"
  // (a fact, the FIRST line below) from "what we've talked about earlier"
  // (history, recoverable but not authoritative). Without this separation,
  // the model anchors on the most-mentioned chapter from history and
  // ignores the actual current position. The reader experienced this: they
  // were on Ruth 1, the model insisted they were still on Psalm 31.
  const currentState =
    `[Current state]\n` +
    `Right now reading: ${bookTitle} by ${bookAuthor} — ${chapterTitle}\n` +
    (previousChapters && previousChapters.length > 0
      ? `Earlier in this conversation we discussed: ${previousChapters.join(', ')}\n` +
        `(Those are history. Default to the chapter on screen unless the reader explicitly references one of the earlier ones.)\n`
      : '')

  let prompt = `You are the built-in reading companion for Tinct, a deep reading platform at tinct.app. You are part of Tinct — not a third-party tool. When users ask about Tinct's features, answer directly as someone who knows the product.

${currentState}
Tinct features you should know about:
- **Editions**: Each book is available in multiple versions — Original, Modern English, and Modern Danish. Readers can switch between editions or compare them side-by-side in split view.
- **Cast**: A character tracker showing characters the reader has encountered so far, with per-chapter summaries that are spoiler-aware (only reveals up to the reader's current chapter). If a character isn't in the Cast, it may be because they haven't appeared prominently enough or the Cast focuses on the most significant characters.
- **Highlights**: Readers can highlight text in multiple colors. Highlighted text can be explained or discussed in chat.
- **Notes**: A personal reading journal where readers can write freeform notes and save insights from chat.
- **Audiobook**: Synced paragraph-by-paragraph audio that follows the reader's position.
- **Feed**: A timeline of all reading activity, highlights, notes, and chats organized by chapter.
- **Reading angle**: An optional focus the reader sets (e.g., "leadership themes") that shapes your responses.

You're knowledgeable about this work's historical context, themes, characters, literary techniques, and its place in the broader literary tradition. You know the plot, the characters, and can reference specific events.

When the reader highlights a passage, explain it clearly — what's happening, why it matters in the story, who the characters are, and any cultural or literary context that enriches understanding. Be conversational and warm, not academic. Think of yourself as a well-read friend sitting next to someone as they read.

If asked to explain something in simpler terms, do so without condescension. If asked for deeper analysis, go deeper. Match the reader's level.

Keep responses concise unless asked for more detail. Use short paragraphs. Reference specific characters by name and connect passages to the broader narrative.

Answer the reader's latest message only. Treat earlier user messages as history, not as pending questions to answer again, unless the latest message explicitly asks you to revisit them.

Tone: measured, literary, and calm. Do not use emoji, emoticons, exclamation-heavy phrasing, slang, hype, or chatty filler. Prefer precise, grounded prose over playful encouragement.`

  if (readingObjective) {
    prompt += `\n\nThe reader's reading angle: "${readingObjective}". Connect your explanations to this perspective when there's a genuine, interesting connection. Don't force it.`
  }

  return prompt
}

export function buildVisibleTextContext(visibleText?: string): string {
  if (!visibleText || visibleText.length < 20) return ''
  // Truncate to ~1500 chars to keep token cost down
  const trimmed = visibleText.length > 1500 ? visibleText.slice(0, 1500) + '...' : visibleText
  return `\n\n[The reader is currently looking at this text on their screen:\n"${trimmed}"]`
}

/**
 * Inject the full text of the current chapter so the model can answer
 * chapter-level questions ("what is this chapter about", "reflect on
 * chapter 8") from the actual prose rather than from its training memory
 * — which mixes chapter numbering up across the catalog. The reader saw
 * this on The Awakening: asked to reflect on chapter 8, the model
 * returned chapter 7's content, then chapter 9's, then finally chapter
 * 8's only after being corrected twice. Cost: ~500-2000 tokens per turn,
 * worth it to ground the answer in the actual chapter.
 */
export function buildChapterTextContext(chapterText?: string): string {
  if (!chapterText || chapterText.length < 40) return ''
  // Cap at ~12,000 chars (~3,000 tokens). Most chapters are well under
  // this; longer ones (e.g. an Iliad book) get the start clipped, which
  // is acceptable since the visibleText block above already carries the
  // exact paragraphs in front of the reader's eyes.
  const MAX = 12000
  const trimmed = chapterText.length > MAX ? chapterText.slice(0, MAX) + '\n[…chapter continues; rest is paginated below]' : chapterText
  return `\n\n[Full text of the chapter the reader is currently in. This is the authoritative source for any chapter-level question — use it instead of your training memory, which mixes chapter numbering across editions:\n${trimmed}\n]`
}

export interface CompanionSystemBlock {
  type: 'text'
  text: string
  cache_control?: { type: 'ephemeral' }
}

export function buildCompanionSystemBlocks(input: {
  bookTitle: string
  bookAuthor: string
  chapterTitle: string
  readingObjective?: string
  previousChapters?: string[]
  currentChapterText?: string
  visibleText?: string
  chatMemory?: string
  extraPolicy?: string
}): CompanionSystemBlock[] {
  const basePrompt = buildCompanionSystemPrompt(
    input.bookTitle,
    input.bookAuthor,
    input.chapterTitle,
    input.readingObjective,
    input.previousChapters,
  )
  const extras = input.extraPolicy ? `\n\n${input.extraPolicy}` : ''
  const memoryContext = input.chatMemory ? `\n\n[${input.chatMemory}]` : ''
  const chapterContext = buildChapterTextContext(input.currentChapterText)
  const visibleContext = memoryContext + buildVisibleTextContext(input.visibleText)
  return [
    { type: 'text', text: basePrompt + extras + chapterContext, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: visibleContext || '[No additional page context.]' },
  ]
}

export function flattenCompanionSystem(system: string | CompanionSystemBlock[]): string {
  if (typeof system === 'string') return system
  return system.map(block => block.text).join('\n')
}
