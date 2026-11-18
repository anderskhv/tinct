import { describe, expect, it } from 'vitest'
import { parseSceneHandoff, sceneHandoffHash, SCENE_QUESTION_MAX } from './labSceneHandoff'

describe('scene page hand-over hash', () => {
  it('round-trips every kind of hand-over', () => {
    const selection = { paragraphIndex: 12, wordIndex: 3, endParagraphIndex: 13, endWordIndex: 0 }
    for (const handoff of [
      { action: 'primer' as const }, { action: 'summary' as const }, { action: 'recap' as const }, { action: 'quiz' as const },
      { action: 'contents' as const }, { action: 'notebook' as const }, { action: 'appearance' as const }, { action: 'menu' as const },
      { action: 'explain' as const, selection }, { action: 'simplify' as const, selection }, { action: 'ask' as const, selection }, { action: 'more' as const, selection },
      { action: 'ask' as const, question: 'Why does Hamlet tell Ophelia to go to a convent?' },
    ]) expect(parseSceneHandoff(sceneHandoffHash(handoff))).toEqual(handoff)
  })

  it('carries a question exactly, up to its limit', () => {
    const question = 'What does "the native hue of resolution" mean? & is it 100% sarcasm #really'
    expect(parseSceneHandoff(sceneHandoffHash({ action: 'ask', question }))?.question).toBe(question)
    expect(parseSceneHandoff(sceneHandoffHash({ action: 'ask', question: 'x'.repeat(900) }))?.question).toHaveLength(SCENE_QUESTION_MAX)
  })

  it('ignores anything malformed rather than guessing', () => {
    for (const hash of ['', '#', '#scene=delete', '#scene=explain', '#scene=ask', '#scene=more', '#scene=explain&sel=3.4', '#scene=explain&sel=5.0-4.9',
      '#scene=primer&sel=1.0-1.2', '#scene=explain&sel=1.0-1.2&q=why', '#scene=summary&q=why', '#other=1', '#lab-p-3']) {
      expect(parseSceneHandoff(hash)).toBeNull()
    }
  })
})
