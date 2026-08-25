import { describe, expect, it } from 'vitest'
import {
  buildCompanionSystemBlocks,
  buildCompanionSystemPrompt,
  flattenCompanionSystem,
} from './companionPrompt'

describe('production companion prompt', () => {
  it('keeps the Tinct reading-companion voice', () => {
    const prompt = buildCompanionSystemPrompt('The Odyssey', 'Homer', 'Book 1', 'homecoming')
    expect(prompt).toContain('built-in reading companion for Tinct')
    expect(prompt).toContain('Right now reading: The Odyssey by Homer — Book 1')
    expect(prompt).toContain('The reader\'s reading angle: "homecoming"')
    expect(prompt).toContain('measured, literary, and calm')
  })

  it('builds the cached two-block system production chat sends', () => {
    const blocks = buildCompanionSystemBlocks({
      bookTitle: 'The Odyssey',
      bookAuthor: 'Homer',
      chapterTitle: 'Book 1',
      currentChapterText: 'Tell me, O Muse, of that ingenious hero who travelled far and wide after he had sacked the famous town of Troy.',
      visibleText: 'Tell me, O Muse, of that ingenious hero.',
    })
    expect(blocks).toHaveLength(2)
    expect(blocks[0].cache_control).toEqual({ type: 'ephemeral' })
    expect(flattenCompanionSystem(blocks)).toContain('Tell me, O Muse')
  })
})
