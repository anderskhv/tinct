import { LIVE_VOICE_INSTRUCTIONS } from './liveConfig'
import type { VoiceReaderContext } from './types'

export const VOICE_LAB_MODELS = ['gpt-5.6-terra', 'gpt-5.6-sol', 'gpt-5.6-luna'] as const
export interface VoiceExperiment {
  label: string
  frontend: string
  backend: string
  model: typeof VOICE_LAB_MODELS[number]
}
export interface VoiceDiagnostic { at: number; type: string; text?: string; id?: string; durationMs?: number; settings?: VoiceExperiment; instructions?: string }
export const CURRENT_VOICE_EXPERIMENT: VoiceExperiment = { label: 'Current', frontend: LIVE_VOICE_INSTRUCTIONS, backend: '{{reader_context}}', model: 'gpt-5.6-terra' }
export const LIGHT_VOICE_EXPERIMENT: VoiceExperiment = {
  ...CURRENT_VOICE_EXPERIMENT,
  label: 'Lighter conversation',
  frontend: `${LIVE_VOICE_INSTRUCTIONS}\nAnswer the new point in a follow-up without recapping what you already said. Do not routinely praise questions, paraphrase them, or announce checking. Quiet waiting is fine. When challenged, reconsider the interpretation instead of defending it by repetition. Handle acknowledgments and simple clarification of an already supplied answer directly; delegate new reasoning, factual uncertainty and actions.`,
  backend: `You are a thoughtful literary reading companion. Use your knowledge of the work and the supplied passage. Protect the reader from spoilers beyond their current chapter unless they explicitly ask. Answer the new point directly, usually in one to three sentences; develop the argument when asked for depth. Do not repeat established points. When challenged, reassess the evidence and correct yourself if appropriate. Distinguish interpretation from textual fact. Retrieve text for exact quotations or uncertain details. Verify named-source attributions with search_reading_sources. Never claim a lookup or an action happened without its result. Use the supplied reader tools for actions, and search_personal_reading_history for personal recall only when asked. For resume_audiobook set play_audio=true for explicit audio requests and false for returning to the page. Do not narrate lookups or add praise.\n{{passage}}`,
}
export function parseVoiceExperiment(value: unknown): VoiceExperiment | null {
  if (!value || typeof value !== 'object') return null
  const x = value as Record<string, unknown>
  if (!VOICE_LAB_MODELS.includes(x.model as VoiceExperiment['model'])) return null
  for (const key of ['label', 'frontend', 'backend']) if (typeof x[key] !== 'string' || !(x[key] as string).trim() || (x[key] as string).length > (key === 'label' ? 100 : 16000)) return null
  return { label: x.label as string, frontend: x.frontend as string, backend: x.backend as string, model: x.model as VoiceExperiment['model'] }
}
export function experimentInstructions(experiment: VoiceExperiment, original: string, context: VoiceReaderContext): string {
  const index = context.paragraphIndex ?? 0
  const passage = JSON.stringify({ book: context.bookTitle, chapter: context.chapterLabel, chapterNumber: context.chapterNumber, edition: context.editionLabel, paragraphIndex: index, excerpt: context.nearbyParagraphs ?? [context.currentParagraph ?? ''] })
  // Literal replacement: dollar signs in book text are not replacement patterns.
  return experiment.backend.replace(/\{\{reader_context\}\}|\{\{passage\}\}/g, token => token === '{{reader_context}}' ? original : passage).slice(0, 65536)
}
