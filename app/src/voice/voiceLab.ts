import { LIVE_VOICE_INSTRUCTIONS, LIGHT_VOICE_BACKEND_INSTRUCTIONS, VOICE_LIVE_BACKEND_MODEL } from './liveConfig'
import type { VoiceReaderContext } from './types'

export const VOICE_LAB_MODELS = ['gpt-5.6-terra', 'gpt-5.6-sol', 'gpt-5.6-luna'] as const
export interface VoiceExperiment {
  label: string
  frontend: string
  backend: string
  model: typeof VOICE_LAB_MODELS[number]
}
export interface VoiceDiagnostic { at: number; type: string; text?: string; id?: string; durationMs?: number; settings?: VoiceExperiment; instructions?: string }
export const CURRENT_VOICE_EXPERIMENT: VoiceExperiment = { label: 'Current', frontend: LIVE_VOICE_INSTRUCTIONS, backend: '{{reader_context}}', model: VOICE_LIVE_BACKEND_MODEL }
export const LIGHT_VOICE_EXPERIMENT: VoiceExperiment = {
  ...CURRENT_VOICE_EXPERIMENT,
  label: 'Lighter conversation',
  frontend: LIVE_VOICE_INSTRUCTIONS,
  backend: `${LIGHT_VOICE_BACKEND_INSTRUCTIONS}\n{{passage}}`,
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
  const passage = JSON.stringify({ book: context.bookTitle, chapter: context.chapterLabel, chapterNumber: context.chapterNumber, edition: context.editionLabel, paragraphIndex: index, currentParagraph: context.currentParagraph ?? '', excerpt: context.nearbyParagraphs ?? [context.currentParagraph ?? ''] })
  // Literal replacement: dollar signs in book text are not replacement patterns.
  return experiment.backend.replace(/\{\{reader_context\}\}|\{\{passage\}\}/g, token => token === '{{reader_context}}' ? original : passage).slice(0, 65536)
}
