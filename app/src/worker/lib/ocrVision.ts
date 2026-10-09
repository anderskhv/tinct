/**
 * The xAI vision client that recognises the text of one scanned PDF page
 * (ownOcrCoordinator.ts). Same request style as xaiModernGenerator
 * (lib/modernEdition.ts): api.x.ai/v1/chat/completions, JSON mode, provider
 * trouble thrown as OcrProviderError so it is told from a bad reply.
 *
 * One page per call: the page image (a greyscale JPEG the reader's device
 * rendered) and the last paragraph of the page before, so a paragraph that
 * runs on can be recognised as such. The reply is the page's blocks
 * (ocrEdition.ts OcrPage). A reply that is not JSON, is over
 * OCR_MAX_REPLY_CHARS or reads as a refusal is not a page: the coordinator
 * asks once more in text mode before it counts a failure.
 *
 * Tests never call the provider: they pass `fetchImpl`, or a fake recognizer
 * to the coordinator. Nothing here logs; the page's text never leaves this
 * function except as its return value.
 */
import { OCR_BLOCK_TYPES, type OcrBlock, type OcrBlockType, type OcrPage } from '../../lab/userBook/ocrEdition'
import { retryAfterMs } from './modernEdition'

export const OCR_DEFAULT_MODEL = 'grok-4-fast-non-reasoning'
// A dense two-column page (a 1911 Britannica page, ~8,000 characters) runs past 8,000 in JSON;
// 16,000 is about what MAX_TOKENS allows, so only a runaway reply is cut.
export const OCR_MAX_REPLY_CHARS = 16000
/** The previous page's last paragraph, at most this many characters, as context. */
export const OCR_CONTEXT_CHARS = 600
const MAX_TOKENS = 4000

export type OcrReply = Omit<OcrPage, 'page' | 'failed' | 'blank'>
export type OcrInvalid = 'parse' | 'too_long' | 'refusal'

export interface OcrRecognition {
  /** The page, or null with `invalid` saying why the reply was not one. */
  reply: OcrReply | null
  invalid?: OcrInvalid
  /**
   * Tokens the provider billed, when it said (`usage` in its reply), and what
   * the call cost in dollars when xAI said that too (`cost_in_usd_ticks`, 1e-10 USD).
   */
  usage: { input: number; output: number; costUsd?: number } | null
}

export interface OcrRecognizeInput {
  image: Uint8Array
  /** The PDF page number (1-based). */
  page: number
  /** The last paragraph of the page before, or ''. */
  context: string
  format: 'json' | 'text'
}

export type OcrRecognizer = (input: OcrRecognizeInput) => Promise<OcrRecognition>

/** Thrown when the provider, not the reply, failed. 429 and 5xx back the job off; the others count as a failed try. */
export class OcrProviderError extends Error {
  constructor(readonly reason: 'provider_429' | 'provider_5xx' | 'provider_error' | 'timeout', readonly retryAfterMs: number | null = null) {
    super(reason)
    this.name = 'OcrProviderError'
  }
}

const RULES = [
  'You transcribe one scanned page of a book or document from its image.',
  'Read columns left to right, each column top to bottom.',
  'Join words hyphenated across line ends. Keep the original spelling, punctuation and capitalisation: never correct, modernise, summarise or translate.',
  'Write [illegible] for a word you cannot read. A blank page, or one with only a picture, has no blocks.',
  'Leave out dot leaders (the rows of dots between an entry and its page number).',
  'The line at the very top of a page that repeats the book, part or chapter title, with or without the page number, is a running head (head), never h1 or h2.',
  'Tables: one row per line, cells separated by " | ". Equations as plain text or LaTeX.',
  'Block types: h1 chapter title, h2 section heading, p paragraph, fn footnote, cap caption, tbl table, eq equation, head running head, foot running footer, num page number.',
].join('\n')

export const OCR_SYSTEM_PROMPT = `${RULES}
Reply with JSON only: {"printed_page": string or null, "columns": number, "starts_mid_paragraph": boolean, "ends_mid_paragraph": boolean, "blocks": [{"t": block type, "x": text}]}.`

export const OCR_TEXT_SYSTEM_PROMPT = `${RULES}
Reply with the page's text only, no JSON and no commentary: "# " before a chapter title, "## " before a section heading, "[fn] " before a footnote, a blank line between paragraphs. Leave out running heads, footers and page numbers.`

export function ocrUserText(page: number, context: string): string {
  const tail = context.trim().slice(-OCR_CONTEXT_CHARS)
  return tail ? `PDF page ${page}. The page before ended with this paragraph:\n"""${tail}"""` : `PDF page ${page}.`
}

function base64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}

const REFUSAL = /^\s*(?:i'?m sorry|i am sorry|i can(?:not|'t)|i am unable|i'm unable|sorry,)/i

/** Why a reply is not a page, before parsing; null when it may be one. */
export function invalidOcrContent(content: string): OcrInvalid | null {
  if (content.length > OCR_MAX_REPLY_CHARS) return 'too_long'
  if (REFUSAL.test(content)) return 'refusal'
  return null
}

const bool = (value: unknown) => (typeof value === 'boolean' ? value : undefined)

/** A JSON-mode reply as a page; null unless it is the asked-for object. Unknown block types and empty text are dropped. */
export function parseOcrJson(content: string): OcrReply | null {
  let data: unknown
  try { data = JSON.parse(content.trim().replace(/^```(?:json)?\s*|\s*```$/g, '')) } catch { return null }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const raw = data as Record<string, unknown>
  if (!Array.isArray(raw.blocks)) return null
  const blocks: OcrBlock[] = []
  for (const item of raw.blocks) {
    if (!item || typeof item !== 'object') continue
    const { t, x } = item as { t?: unknown; x?: unknown }
    if (typeof t !== 'string' || !OCR_BLOCK_TYPES.includes(t as OcrBlockType) || typeof x !== 'string' || !x.trim()) continue
    blocks.push({ t: t as OcrBlockType, x })
  }
  const printed = raw.printed_page
  const columns = Number(raw.columns)
  return {
    printed_page: typeof printed === 'string' && printed.trim() ? printed.trim().slice(0, 20) : null,
    ...(Number.isInteger(columns) && columns >= 1 && columns <= 6 ? { columns } : {}),
    ...(bool(raw.starts_mid_paragraph) !== undefined ? { starts_mid_paragraph: bool(raw.starts_mid_paragraph) } : {}),
    ...(bool(raw.ends_mid_paragraph) !== undefined ? { ends_mid_paragraph: bool(raw.ends_mid_paragraph) } : {}),
    blocks,
  }
}

/** A text-mode reply as a page: paragraphs by blank lines, "# " h1, "## " h2, "[fn] " footnote. */
export function parseOcrText(content: string): OcrReply | null {
  const text = content.replace(/\r\n?/g, '\n').trim()
  const blocks: OcrBlock[] = []
  for (const chunk of text.split(/\n[ \t]*\n/)) {
    const part = chunk.trim()
    if (!part) continue
    if (part.startsWith('## ')) blocks.push({ t: 'h2', x: part.slice(3) })
    else if (part.startsWith('# ')) blocks.push({ t: 'h1', x: part.slice(2) })
    else if (/^\[fn\]\s*/i.test(part)) blocks.push({ t: 'fn', x: part.replace(/^\[fn\]\s*/i, '') })
    else blocks.push({ t: 'p', x: part })
  }
  return { printed_page: null, blocks }
}

export function xaiOcrRecognizer(apiKey: string, options: { model?: string; fetchImpl?: typeof fetch; timeoutMs?: number } = {}): OcrRecognizer {
  const fetchImpl = options.fetchImpl ?? fetch
  return async input => {
    const response = await fetchImpl('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: options.model || OCR_DEFAULT_MODEL,
        temperature: 0,
        max_tokens: MAX_TOKENS,
        ...(input.format === 'json' ? { response_format: { type: 'json_object' } } : {}),
        messages: [
          { role: 'system', content: input.format === 'json' ? OCR_SYSTEM_PROMPT : OCR_TEXT_SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64(input.image)}`, detail: 'high' } },
              { type: 'text', text: ocrUserText(input.page, input.context) },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(options.timeoutMs ?? 60_000),
    }).catch((error: unknown) => {
      const name = (error as { name?: string } | null)?.name
      throw new OcrProviderError(name === 'TimeoutError' || name === 'AbortError' ? 'timeout' : 'provider_5xx')
    })
    if (response.status === 429) throw new OcrProviderError('provider_429', retryAfterMs(response.headers.get('Retry-After')))
    if (response.status >= 500) throw new OcrProviderError('provider_5xx', retryAfterMs(response.headers.get('Retry-After')))
    if (!response.ok) throw new OcrProviderError('provider_error')
    let data: { choices?: Array<{ message?: { content?: string } }>; usage?: { prompt_tokens?: number; completion_tokens?: number; cost_in_usd_ticks?: number } }
    try {
      data = await response.json() as typeof data
    } catch (error) {
      const name = (error as { name?: string } | null)?.name
      if (name === 'TimeoutError' || name === 'AbortError') throw new OcrProviderError('timeout')
      return { reply: null, invalid: 'parse', usage: null }
    }
    const usage = data.usage && (Number.isFinite(data.usage.prompt_tokens) || Number.isFinite(data.usage.completion_tokens))
      ? {
        input: Math.max(0, Number(data.usage.prompt_tokens) || 0),
        output: Math.max(0, Number(data.usage.completion_tokens) || 0),
        ...(Number.isFinite(data.usage.cost_in_usd_ticks) && data.usage.cost_in_usd_ticks! >= 0 ? { costUsd: data.usage.cost_in_usd_ticks! / 1e10 } : {}),
      }
      : null
    const content = data.choices?.[0]?.message?.content ?? ''
    const invalid = invalidOcrContent(content)
    if (invalid) return { reply: null, invalid, usage }
    const reply = input.format === 'json' ? parseOcrJson(content) : parseOcrText(content)
    return reply ? { reply, usage } : { reply: null, invalid: 'parse', usage }
  }
}
