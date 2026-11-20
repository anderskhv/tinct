import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleChat } from './worker/routes/chat'
import { PASSAGE_IMAGE_SIDE } from './worker/lib/chatImages'
import { pdfRegionCaptureSize } from './lab/sharedReader/pdf/pdfRegionCaptureSize'

/**
 * Anders, 11 Nov 2026: "Tinct could not answer this time (error 400)" on an Explain in the PDF pages reader
 * (a maths paper: a table of formulas, Figure 3, its caption). The three things he may have explained, posted to the
 * real route with the model mocked.
 */
const userId = '11111111-1111-4111-8111-111111111111'
const env = { ANTHROPIC_API_KEY: 'k', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }
const reader = async () => ({ id: userId, email: 'reader@example.com' })
const allow = async () => true
const ctx = () => ({ waitUntil: () => {} }) as unknown as ExecutionContext

function png(width: number, height: number, total = 64): string {
  const bytes = new Uint8Array(total)
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52])
  new DataView(bytes.buffer).setUint32(16, width)
  new DataView(bytes.buffer).setUint32(20, height)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}
const image = (data: string) => ({ type: 'image', source: { type: 'base64', media_type: 'image/png', data } })

function model() {
  const bodies: Array<Record<string, unknown>> = []
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input) === 'https://api.anthropic.com/v1/messages') {
      bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>)
      return Response.json({ content: [{ type: 'text', text: 'Answer.' }], stop_reason: 'end_turn', usage: { input_tokens: 1, output_tokens: 1 } })
    }
    return Response.json({})
  }))
  return bodies
}
const post = (body: unknown) => handleChat(new Request('https://tinct.app/api/chat', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }), env, ctx(), reader, allow)

const CAPTION = 'Figure 3: The left panel compares the site ℓ̂ᵢₛₒ i|t to the first-order Taylor expansion of ℓi at mt. The right panel compares ℓ̂full i|t to the second-order Taylor.'
const PAGE = `Gaussian qt = N(θ|mt, St⁻¹) ℓ̂ i|t = θ⊤ E qt[∇ℓi] + ½(θ − mt)⊤ H i|t (θ − mt)\nBernoulli P(θ = 1) = p1 ℓ̂bern i|t = θ ∇p1 E qt[ℓi]\n${CAPTION}`
/** What usePdfOriginalServices.ask sends (its request literal), with the reader's default AI settings. */
function body(selection: string, options: { figure?: boolean; picture?: string; question?: string; ai?: unknown } = {}) {
  const text = options.question || 'Please explain the selected passage.'
  return {
    stream: false,
    messages: [{ role: 'user', content: options.picture ? [image(options.picture), { type: 'text', text: options.question || 'Explain this figure.' }] : text }],
    companion: {
      intent: 'explain',
      context: { kind: 'pdf', bookTitle: 'The Bayesian Learning Rule', bookAuthor: '', chapterLabel: 'Original PDF page 12', pageNumber: 12, pages: [{ n: 12, text: PAGE }], paragraphIndex: 0, lookups: false },
      selection,
      ...(options.figure ? { figure: true } : {}),
      ai: 'ai' in options ? options.ai : { length: 'standard', row: 'explain' },
    },
  }
}
const FIGURE = `[The reader selected Figure 3 on page 12. It is the attached image. Caption: ${CAPTION}]`

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('PDF pages reader Explain: the request shapes behind "error 400"', () => {
  it('a formula selection and the caption text are answered', async () => {
    const bodies = model()
    for (const selection of ['ℓ̂bern i|t = θ ∇p1 E qt[ℓi]', CAPTION]) {
      const response = await post(body(selection))
      expect(response.status, selection).toBe(200)
    }
    expect(bodies).toHaveLength(2)
  })

  it('a figure whose picture is 1568 px on its long side is answered, with the picture', async () => {
    const bodies = model()
    const response = await post(body(FIGURE, { figure: true, picture: png(1568, 640) }))
    expect(response.status).toBe(200)
    expect(JSON.stringify(bodies[0].messages)).toContain('"type":"image"')
  })

  it('a formula picture (no figure flag) is answered', async () => {
    model()
    expect((await post(body('[The reader selected a formula on page 12. It is the attached image.]', { picture: png(900, 120) }))).status).toBe(200)
  })

  it('AI settings never refuse a request: malformed or unknown ones are dropped', async () => {
    model()
    for (const ai of [undefined, null, 'x', 7, [], { length: 'huge', row: 'explain' }, { length: 'brief', row: 'nope' }, { language: 'da', length: 'standard', row: 'explain' }, { instructions: [1, {}, 'Be brief.'], extra: true }]) {
      const response = await post(body(CAPTION, { ai }))
      expect(response.status, JSON.stringify(ai)).toBe(200)
    }
  })

  it('the capture never makes a picture the Worker refuses (the Worker refuses one over 1568 px: image_rejected, 400)', async () => {
    model()
    // The Worker's side of the contract.
    const refused = await post(body(FIGURE, { figure: true, picture: png(1569, 640) }))
    expect(refused.status).toBe(400)
    expect(await refused.json()).toEqual({ error: 'image_rejected' })
    // The client's side: every region of every common page size is drawn within the cap.
    let over = 0
    for (const [width, height] of [[612, 792], [595.276, 841.89], [595, 842], [612, 1008], [841.89, 595.276], [431, 649]]) {
      for (let w = 0.05; w <= 1.0; w += 0.0037) for (let h = 0.03; h <= 1.0; h += 0.0171) {
        const size = pdfRegionCaptureSize({ w, h }, { width, height })
        if (Math.max(size.crop.width, size.crop.height) > PASSAGE_IMAGE_SIDE) over += 1
      }
    }
    expect(over).toBe(0)
    // Figure 3's own shape: nearly the full text width of a US Letter page.
    const figure3 = pdfRegionCaptureSize({ w: 0.7812, h: 0.3105 }, { width: 612, height: 792 })
    expect(Math.max(figure3.crop.width, figure3.crop.height)).toBeLessThanOrEqual(PASSAGE_IMAGE_SIDE)
  })
})
