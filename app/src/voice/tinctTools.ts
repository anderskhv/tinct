import { FONT_SIZE_MAX, FONT_SIZE_MIN, FONT_SIZE_STEP } from '../types'
import type { ReadingHistoryPeriod } from './readingMemory'
import type { VoiceApplicationToolResult } from './types'

export type VoiceTinctView = 'read' | 'library' | 'reading_history' | 'pricing' | 'settings' | 'chat' | 'cast'
export type VoiceTinctTheme = 'light' | 'dark'

export interface VoiceReadingRecallPayload extends Record<string, unknown> {
  ok: boolean
  period: ReadingHistoryPeriod
  period_label: string
  activities: Array<Record<string, unknown>>
  unavailable_reason?: 'sign_in_required_for_history' | 'history_temporarily_unavailable'
}

export interface TinctVoiceToolAdapter<ViewSnapshot = unknown> {
  getViewSnapshot: () => ViewSnapshot
  openView: (view: VoiceTinctView) => void
  restoreView: (snapshot: ViewSnapshot) => void
  getTheme: () => VoiceTinctTheme
  setTheme: (theme: VoiceTinctTheme) => void
  getFontSize: () => number
  setFontSize: (size: number) => void
  getAudioSpeed: () => number
  setAudioSpeed: (speed: number) => void
  getReadingHistory: (period: ReadingHistoryPeriod, bookQuery?: string) => Promise<VoiceReadingRecallPayload>
}

interface UndoEntry {
  originatingTurn: string
  label: string
  undo: () => void | Promise<void>
}

const AUDIO_SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const
const FONT_PRESETS: Record<string, number> = {
  small: 1,
  medium: 1.3,
  large: 1.8,
  extra_large: 2.2,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function stringArg(args: Record<string, unknown>, key: string): string | undefined {
  const value = args[key]
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function roundFontSize(value: number): number {
  const clamped = Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, value))
  return Number((Math.round(clamped / FONT_SIZE_STEP) * FONT_SIZE_STEP).toFixed(2))
}

function nextAudioSpeed(current: number, direction: 'faster' | 'slower'): number {
  let closestIndex = 0
  let closestDistance = Infinity
  AUDIO_SPEEDS.forEach((speed, index) => {
    const distance = Math.abs(speed - current)
    if (distance < closestDistance) {
      closestDistance = distance
      closestIndex = index
    }
  })
  const delta = direction === 'faster' ? 1 : -1
  return AUDIO_SPEEDS[Math.max(0, Math.min(AUDIO_SPEEDS.length - 1, closestIndex + delta))]
}

function failure(error: string): VoiceApplicationToolResult {
  return {
    output: { ok: false, error },
    responseInstructions: 'Briefly say that you could not make that change. Do not claim it happened. Do not call another tool.',
  }
}

export const TINCT_VOICE_TOOLS = [
  {
    type: 'function',
    name: 'get_reading_history',
    description: 'Look up what the reader actually read or listened to in Tinct during a requested time. Always use this for questions like what did I read last time, today, yesterday, or the day before yesterday; never guess from general memory.',
    parameters: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          enum: ['last_session', 'today', 'yesterday', 'day_before_yesterday'],
          description: 'The requested local-calendar period.',
        },
        book_query: {
          type: 'string',
          description: 'Optional book title, author, or Tinct book id when the reader limits the question to one book.',
        },
      },
      required: ['period'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'open_tinct_view',
    description: 'Open a Tinct screen for the reader instead of merely explaining where it is. Use for requests to show or take the reader to the library, Reading Feed/history, pricing, settings, chat, cast, or the book.',
    parameters: {
      type: 'object',
      properties: {
        view: {
          type: 'string',
          enum: ['read', 'library', 'reading_history', 'pricing', 'settings', 'chat', 'cast'],
        },
      },
      required: ['view'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'set_tinct_theme',
    description: 'Set Tinct itself to light or dark mode. Use when the reader asks for night mode or a light/dark theme. This does not control the device brightness.',
    parameters: {
      type: 'object',
      properties: { theme: { type: 'string', enum: ['light', 'dark'] } },
      required: ['theme'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'set_reader_font_size',
    description: 'Change the visible reader font size. Use larger/smaller for relative requests or a named size for explicit requests.',
    parameters: {
      type: 'object',
      properties: {
        size: { type: 'string', enum: ['smaller', 'larger', 'small', 'medium', 'large', 'extra_large'] },
      },
      required: ['size'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'set_audiobook_speed',
    description: 'Change Tinct audiobook reading speed. Use faster/slower for relative requests or an exact supported speed. This action is undoable.',
    parameters: {
      type: 'object',
      properties: {
        speed: { type: 'string', enum: ['slower', 'faster', '0.75x', '1x', '1.25x', '1.5x', '2x'] },
      },
      required: ['speed'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'get_tinct_info',
    description: 'Answer a factual question about where Tinct features live, current pricing, reading history, or available voice controls. Use this instead of guessing.',
    parameters: {
      type: 'object',
      properties: {
        topic: { type: 'string', enum: ['library', 'pricing', 'reading_history', 'voice_controls'] },
      },
      required: ['topic'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'undo_last_tinct_action',
    description: 'Undo the most recent UI or setting change made by voice in this session. Use for undo that, put it back, I preferred it before, actually no, or contextual reversals such as that is too fast.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
  },
] as const

export class TinctVoiceToolController<ViewSnapshot = unknown> {
  private adapter: TinctVoiceToolAdapter<ViewSnapshot>
  private undoStack: UndoEntry[] = []

  constructor(adapter: TinctVoiceToolAdapter<ViewSnapshot>) {
    this.adapter = adapter
  }

  resetUndo(): void {
    this.undoStack = []
  }

  private remember(entry: UndoEntry): void {
    this.undoStack.push(entry)
    if (this.undoStack.length > 20) this.undoStack.shift()
  }

  async execute(name: string, rawArgs: Record<string, unknown>, callId: string): Promise<VoiceApplicationToolResult> {
    const args = isRecord(rawArgs) ? rawArgs : {}

    if (name === 'get_reading_history') {
      const period = stringArg(args, 'period') as ReadingHistoryPeriod | undefined
      if (!period || !['last_session', 'today', 'yesterday', 'day_before_yesterday'].includes(period)) {
        return failure('invalid_period')
      }
      const recall = await this.adapter.getReadingHistory(period, stringArg(args, 'book_query'))
      const unavailableInstructions = recall.unavailable_reason === 'sign_in_required_for_history'
        ? 'Briefly explain that signed-in reading can be remembered across sessions; guest reading stays private and is not saved as history. Do not imply earlier guest activity will appear after sign-in, do not claim any activity was recorded, and do not call another tool.'
        : recall.unavailable_reason === 'history_temporarily_unavailable'
          ? 'Briefly say that reading history is temporarily unavailable and suggest trying again. Do not guess from general memory and do not call another tool.'
          : `Briefly say you could not find any reading activity for ${recall.period_label}. Offer to check another day. Do not invent a passage and do not call another tool.`
      return {
        output: recall,
        responseInstructions: recall.ok && recall.activities.length > 0
          ? 'Using only the reading-history result, give a warm 5–15 second recap in one or two sentences. Then ask exactly one light follow-up: “Does that ring a bell, or would you like a deeper summary?” Do not mention tools, stored data, or profiling. Do not resume the book.'
          : unavailableInstructions,
      }
    }

    if (name === 'open_tinct_view') {
      const view = stringArg(args, 'view') as VoiceTinctView | undefined
      if (!view || !['read', 'library', 'reading_history', 'pricing', 'settings', 'chat', 'cast'].includes(view)) {
        return failure('invalid_view')
      }
      const previous = this.adapter.getViewSnapshot()
      this.adapter.openView(view)
      this.remember({
        originatingTurn: callId,
        label: `opening ${view.replace('_', ' ')}`,
        undo: () => this.adapter.restoreView(previous),
      })
      return {
        output: { ok: true, view, changed: true, undo_available: true, originating_turn: callId },
        responseInstructions: `Say in one short sentence that ${view.replace('_', ' ')} is open. Do not give directions to a screen that is already open. Do not call another tool.`,
      }
    }

    if (name === 'set_tinct_theme') {
      const theme = stringArg(args, 'theme') as VoiceTinctTheme | undefined
      if (theme !== 'light' && theme !== 'dark') return failure('invalid_theme')
      const previous = this.adapter.getTheme()
      if (previous !== theme) {
        this.adapter.setTheme(theme)
        this.remember({ originatingTurn: callId, label: `${theme} mode`, undo: () => this.adapter.setTheme(previous) })
      }
      return {
        output: { ok: true, theme, previous, changed: previous !== theme, undo_available: previous !== theme, originating_turn: callId },
        responseInstructions: `Confirm in one short sentence that ${theme} mode is ${previous === theme ? 'already' : 'now'} on. Do not claim to have changed device brightness. Do not call another tool.`,
      }
    }

    if (name === 'set_reader_font_size') {
      const requested = stringArg(args, 'size')
      if (!requested || !['smaller', 'larger', 'small', 'medium', 'large', 'extra_large'].includes(requested)) {
        return failure('invalid_font_size')
      }
      const previous = this.adapter.getFontSize()
      const next = roundFontSize(requested === 'larger'
        ? previous + 0.15
        : requested === 'smaller'
          ? previous - 0.15
          : FONT_PRESETS[requested])
      if (next !== previous) {
        this.adapter.setFontSize(next)
        this.remember({ originatingTurn: callId, label: 'font size change', undo: () => this.adapter.setFontSize(previous) })
      }
      return {
        output: { ok: true, font_size_rem: next, previous_font_size_rem: previous, changed: next !== previous, undo_available: next !== previous, originating_turn: callId },
        responseInstructions: `Confirm the font is ${next > previous ? 'larger' : next < previous ? 'smaller' : 'already at that size'} in one short sentence. Do not call another tool.`,
      }
    }

    if (name === 'set_audiobook_speed') {
      const requested = stringArg(args, 'speed')
      if (!requested || !['slower', 'faster', '0.75x', '1x', '1.25x', '1.5x', '2x'].includes(requested)) {
        return failure('invalid_audio_speed')
      }
      const previous = this.adapter.getAudioSpeed()
      const next = requested === 'faster' || requested === 'slower'
        ? nextAudioSpeed(previous, requested)
        : Number(requested.slice(0, -1))
      if (next !== previous) {
        this.adapter.setAudioSpeed(next)
        this.remember({ originatingTurn: callId, label: 'audiobook speed change', undo: () => this.adapter.setAudioSpeed(previous) })
      }
      return {
        output: { ok: true, speed: next, previous_speed: previous, changed: next !== previous, undo_available: next !== previous, originating_turn: callId },
        responseInstructions: `Confirm the audiobook speed is ${next} times in one short sentence. Do not resume the book and do not call another tool.`,
      }
    }

    if (name === 'get_tinct_info') {
      const topic = stringArg(args, 'topic')
      const facts: Record<string, string> = {
        library: 'The Library is opened from the book/library control; voice can open it directly.',
        pricing: 'Reading without an account is free. A free account includes a 30-day Premium trial. Premium is $3 per month and includes 100 AI messages per month, audiobook, Cast, offline mode, export, and the reading journal.',
        reading_history: 'The Reading Feed shows chapter activity for the current book. Voice can also recall the last session, today, yesterday, or the day before yesterday across the library.',
        voice_controls: 'Voice can open Tinct screens, change light or dark mode, adjust reader font size and audiobook speed, look up reading history, and undo the last voice-made change.',
      }
      if (!topic || !facts[topic]) return failure('invalid_info_topic')
      return {
        output: { ok: true, topic, answer: facts[topic] },
        responseInstructions: 'Answer the reader directly and briefly using only the supplied fact. Do not call another tool. If they asked to go somewhere rather than where it is, explain that you can open it for them in one short clause.',
      }
    }

    if (name === 'undo_last_tinct_action') {
      const entry = this.undoStack.pop()
      if (!entry) {
        return {
          output: { ok: false, error: 'nothing_to_undo' },
          responseInstructions: 'Say briefly that there is no voice-made change to undo yet. Do not call another tool.',
        }
      }
      await entry.undo()
      return {
        output: { ok: true, undone: entry.label, originating_turn: entry.originatingTurn, remaining_undo_count: this.undoStack.length },
        responseInstructions: `Say briefly that you put back the previous setting or view by undoing ${entry.label}. Do not call another tool.`,
      }
    }

    return failure('unsupported_tool')
  }
}
