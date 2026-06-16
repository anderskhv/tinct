import { jsonResponse } from '../lib/responses'
import { htmlEscape } from '../lib/html'
import { supabaseGet, supabaseInsert, supabaseUpdate, type SupabaseEnv } from '../lib/supabase'

export type IssueReportsEnv = SupabaseEnv & {
  ANTHROPIC_API_KEY?: string
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

type VerifyUser = (env: IssueReportsEnv, request: Request) => Promise<{ id: string; email: string } | null>
type SendEmail = (env: IssueReportsEnv, to: string, subject: string, html: string) => Promise<boolean>

const CHAT_MODEL = 'claude-sonnet-4-6'

// ===== Auto-Evaluation Pipeline =====

interface IssueReport {
  reportId: string
  bookId: string
  editionKey: string
  chapterNumber: number
  paragraphIndex: number
  selectedText: string
  tag: string
  comment?: string | null
  userId: string | null
}

interface EditionData {
  chapters?: { paragraphs?: string[] }[]
}

interface ParagraphContext {
  fullParagraph: string
  sourceParagraph: string
  chapterParagraphs: string[]
  sourceEditionKey: string
  paragraphIndex: number
  loadError?: string
}

interface RelatedCorrection {
  paragraph_index: number
  corrected_paragraph: string
  explanation?: string
}

interface EvaluationResult {
  is_error: boolean
  confidence: number
  explanation: string
  corrected_paragraph: string | null
  proposed_action?: 'apply' | 'no_change' | 'needs_human'
  related_corrections?: RelatedCorrection[]
}

function editionAssetPath(bookId: string, editionKey: string): string {
  return `/data/editions/${bookId}-${editionKey}.json`
}

async function fetchEditionFromAssets(env: IssueReportsEnv, bookId: string, editionKey: string): Promise<EditionData | null> {
  if (!bookId || !editionKey) return null
  const path = editionAssetPath(bookId, editionKey)
  const urls = [
    `https://tinct.app${path}`,
    `https://tinct.ahvelplund.workers.dev${path}`,
    `http://localhost${path}`,
  ]
  for (const assetUrl of urls) {
    try {
      const res = await env.ASSETS.fetch(new Request(assetUrl, {
        headers: { 'accept': 'application/json' },
      }))
      if (!res.ok) continue
      return await res.json() as EditionData
    } catch {
      // Try the next asset origin. Cloudflare's ASSETS binding is host-agnostic
      // in production, but local/preview environments have differed before.
    }
  }
  return null
}

async function fetchExistingParagraphPatch(env: IssueReportsEnv, report: Pick<IssueReport, 'bookId' | 'editionKey' | 'chapterNumber' | 'paragraphIndex'>): Promise<string | null> {
  try {
    const path = `edition_patches?book_id=eq.${encodeURIComponent(report.bookId)}&edition_key=eq.${encodeURIComponent(report.editionKey)}&chapter_number=eq.${report.chapterNumber}&paragraph_index=eq.${report.paragraphIndex}&select=patched_text&limit=1`
    const res = await supabaseGet(env, path)
    const rows = await res.json() as { patched_text?: string }[]
    return rows?.[0]?.patched_text || null
  } catch {
    return null
  }
}

function normalizedTextForMatch(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function paragraphContainsSelection(paragraph: string, selectedText: string): boolean {
  const selected = selectedText.trim()
  if (!paragraph || !selected) return false
  if (paragraph.includes(selected)) return true
  return normalizedTextForMatch(paragraph).includes(normalizedTextForMatch(selected))
}

function findParagraphContainingSelection(chapterParagraphs: string[], selectedText: string): number | null {
  const selected = selectedText.trim()
  if (!selected) return null

  const exactMatches = chapterParagraphs
    .map((text, index) => ({ text, index }))
    .filter(({ text }) => text.includes(selected))
  if (exactMatches.length === 1) return exactMatches[0].index

  const normalizedSelected = normalizedTextForMatch(selected)
  const normalizedMatches = chapterParagraphs
    .map((text, index) => ({ text, index }))
    .filter(({ text }) => normalizedTextForMatch(text).includes(normalizedSelected))
  if (normalizedMatches.length === 1) return normalizedMatches[0].index

  return null
}

export async function fetchParagraphContext(env: IssueReportsEnv, report: IssueReport): Promise<ParagraphContext> {
  const edition = await fetchEditionFromAssets(env, report.bookId, report.editionKey)
  const chapter = edition?.chapters?.[report.chapterNumber - 1]
  const chapterParagraphs = chapter?.paragraphs || []
  let paragraphIndex = report.paragraphIndex
  let staticParagraph = chapterParagraphs[paragraphIndex] || ''
  let patchedParagraph = await fetchExistingParagraphPatch(env, { ...report, paragraphIndex })
  const fullParagraph = patchedParagraph || staticParagraph

  if (fullParagraph && !paragraphContainsSelection(fullParagraph, report.selectedText)) {
    const matchedIndex = findParagraphContainingSelection(chapterParagraphs, report.selectedText)
    if (matchedIndex !== null && matchedIndex !== paragraphIndex) {
      paragraphIndex = matchedIndex
      staticParagraph = chapterParagraphs[paragraphIndex] || ''
      patchedParagraph = await fetchExistingParagraphPatch(env, { ...report, paragraphIndex })
    }
  }
  const resolvedFullParagraph = patchedParagraph || staticParagraph

  const sourceEditionKey = report.editionKey === 'original-en' ? '' : 'original-en'
  const sourceEdition = sourceEditionKey ? await fetchEditionFromAssets(env, report.bookId, sourceEditionKey) : null
  const sourceParagraph = sourceEdition?.chapters?.[report.chapterNumber - 1]?.paragraphs?.[paragraphIndex] || ''

  return {
    fullParagraph: resolvedFullParagraph,
    sourceParagraph,
    chapterParagraphs,
    sourceEditionKey,
    paragraphIndex,
    loadError: resolvedFullParagraph ? undefined : `Could not load ${editionAssetPath(report.bookId, report.editionKey)} ch${report.chapterNumber} p${paragraphIndex}`,
  }
}

export function tryCommentReplacement(fullParagraph: string, selectedText: string, comment?: string | null): string | null {
  let replacement = (comment || '').trim().replace(/[?？]+$/g, '').trim()
  const selected = selectedText.trim()
  if (!fullParagraph || !selected || !replacement) return null
  const selectedFirst = selected[0]
  if (selectedFirst && selectedFirst === selectedFirst.toLocaleLowerCase() && replacement[0] === replacement[0].toLocaleUpperCase()) {
    replacement = replacement[0].toLocaleLowerCase() + replacement.slice(1)
  }
  if (fullParagraph.includes(selected)) return fullParagraph.replace(selected, replacement)
  if (fullParagraph.includes(selectedText)) return fullParagraph.replace(selectedText, replacement)
  return null
}

export function changedSegment(before: string, after: string): { oldText: string; newText: string } | null {
  if (!before || !after || before === after) return null
  let start = 0
  while (start < before.length && start < after.length && before[start] === after[start]) start++
  let endBefore = before.length - 1
  let endAfter = after.length - 1
  while (endBefore >= start && endAfter >= start && before[endBefore] === after[endAfter]) {
    endBefore--
    endAfter--
  }
  const oldText = before.slice(start, endBefore + 1)
  const newText = after.slice(start, endAfter + 1)
  if (!oldText || !newText || oldText.length > 120 || newText.length > 120) return null
  return { oldText, newText }
}

function relatedParagraphsForPrompt(report: IssueReport, chapterParagraphs: string[], correctedParagraph: string | null): string {
  const needles = new Set<string>()
  const selected = report.selectedText.trim()
  if (selected) needles.add(selected.toLocaleLowerCase())
  const firstWord = selected.match(/[\p{L}\p{M}]+/u)?.[0]
  if (firstWord && firstWord.length >= 5) needles.add(firstWord.slice(0, Math.max(5, firstWord.length - 2)).toLocaleLowerCase())
  const diff = correctedParagraph ? changedSegment(chapterParagraphs[report.paragraphIndex] || '', correctedParagraph) : null
  if (diff?.oldText) needles.add(diff.oldText.toLocaleLowerCase())

  const matches = chapterParagraphs
    .map((text, index) => ({ text, index }))
    .filter(({ text, index }) => {
      if (index === report.paragraphIndex) return false
      const lower = text.toLocaleLowerCase()
      return [...needles].some(needle => needle && lower.includes(needle))
    })
    .slice(0, 12)

  if (!matches.length) return '[No other obvious same-chapter candidates found by text search.]'
  return matches.map(({ text, index }) => `p${index}: ${text}`).join('\n\n')
}

export async function upsertEditionPatch(env: IssueReportsEnv, data: {
  book_id: string
  edition_key: string
  chapter_number: number
  paragraph_index: number
  original_text: string
  patched_text: string
  issue_report_id: string
  applied_by?: string
}) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/edition_patches?on_conflict=book_id,edition_key,chapter_number,paragraph_index`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(data),
  })
}

export async function queueAudioRegen(env: IssueReportsEnv, data: {
  book_id: string
  edition_key: string
  chapter_number: number
  paragraph_index: number
  patched_text: string
}) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/pending_audio_regen?on_conflict=book_id,edition_key,chapter_number,paragraph_index`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY!}`,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ ...data, status: 'pending' }),
  })
}

export function validateCorrectedParagraph(original: string, corrected: string): string | null {
  if (!original || !corrected) return 'Missing original or corrected paragraph.'
  const ratio = corrected.length / original.length
  if (ratio < 0.5) return `Correction is too short (${Math.round(ratio * 100)}% of original).`
  if (ratio > 1.5) return `Correction is too long (${Math.round(ratio * 100)}% of original).`
  return null
}

async function evaluateAndPatch(env: IssueReportsEnv, report: IssueReport, sendEmail: SendEmail): Promise<void> {
  if (!env.ANTHROPIC_API_KEY || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return

  try {
  // 1. Fetch the effective translated paragraph and the source paragraph.
  // "Effective" matters: users report against patched text in the reader, not
  // necessarily the immutable JSON asset.
	  const context = await fetchParagraphContext(env, report)
	  if (context.paragraphIndex !== report.paragraphIndex) {
	    console.warn(`[evaluateAndPatch] Corrected paragraph index from p${report.paragraphIndex} to p${context.paragraphIndex} for selected text "${report.selectedText.slice(0, 80)}"`)
	    report.paragraphIndex = context.paragraphIndex
	    await supabaseUpdate(env, 'issue_reports', report.reportId, { paragraph_index: context.paragraphIndex })
	  }
	  let fullParagraph = context.fullParagraph
	  const sourceParagraph = context.sourceParagraph
	  const selectedTextFound = paragraphContainsSelection(fullParagraph, report.selectedText)

	  if (fullParagraph && !selectedTextFound) {
	    const token = crypto.randomUUID()
	    const explanation = `Selected text "${report.selectedText}" was not found in the loaded paragraph for ${report.bookId} ${report.editionKey} ch${report.chapterNumber} p${report.paragraphIndex}. The paragraph index may be stale or the report was made against text that has since changed.`
	    await supabaseUpdate(env, 'issue_reports', report.reportId, {
	      status: 'pending_review',
	      proposed_fix: null,
	      original_paragraph: fullParagraph,
	      review_token: token,
	      ai_confidence: 0,
	      ai_explanation: explanation,
	    })
	    const baseUrl = 'https://tinct.app'
	    await sendEmail(env, 'contact@tinct.app',
	      `[Review blocked: text not found] ${report.tag} — ${report.bookId} ch${report.chapterNumber}`,
	      `<div style="font-family:sans-serif;max-width:600px">
	        <p><span style="background:#c66;color:#fff;padding:3px 10px;border-radius:4px;font-size:13px">Manual review required</span></p>
	        <p><strong>Problem:</strong> ${htmlEscape(explanation)}</p>
	        <p><strong>User selected:</strong> "${htmlEscape(report.selectedText)}"</p>
	        ${report.comment ? `<p><strong>User comment:</strong> ${htmlEscape(report.comment)}</p>` : ''}
	        <p><strong>Loaded paragraph:</strong></p>
	        <blockquote style="border-left:3px solid #e88;padding:8px 16px;background:#fff5f5;white-space:pre-wrap">${htmlEscape(fullParagraph)}</blockquote>
	        <p style="margin-top:24px">
	          <a href="${baseUrl}/api/approve-fix?id=${report.reportId}&action=edit&token=${token}" style="display:inline-block;padding:12px 28px;background:#567;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin-right:12px">Manual edit</a>
	          <a href="${baseUrl}/api/approve-fix?id=${report.reportId}&action=reject&token=${token}" style="display:inline-block;padding:12px 28px;background:#c66;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Reject</a>
	        </p>
	      </div>`
	    )
	    return
	  }

  // 2a. Mechanical fix: word split by erroneous space (e.g., "beh ager" → "behager")
  // Skip Claude entirely for these — just remove the space.
  if (fullParagraph && report.selectedText.match(/^[a-zæøåàáâãäéèêëíìîïóòôõöúùûüý]+ [a-zæøåàáâãäéèêëíìîïóòôõöúùûüý]+$/i)) {
    const merged = report.selectedText.replace(' ', '')
    if (fullParagraph.includes(report.selectedText) && !fullParagraph.includes(merged)) {
      // The split word exists in the paragraph, but the merged version doesn't — it's a word split error
      const corrected = fullParagraph.replace(report.selectedText, merged)
      console.log(`[evaluateAndPatch] Mechanical fix: "${report.selectedText}" → "${merged}"`)

      // Apply patch directly
      await upsertEditionPatch(env, {
        book_id: report.bookId,
        edition_key: report.editionKey,
        chapter_number: report.chapterNumber,
        paragraph_index: report.paragraphIndex,
        original_text: fullParagraph,
        patched_text: corrected,
        issue_report_id: report.reportId,
      })

      await queueAudioRegen(env, {
        book_id: report.bookId,
        edition_key: report.editionKey,
        chapter_number: report.chapterNumber,
        paragraph_index: report.paragraphIndex,
        patched_text: corrected,
      })

      await supabaseUpdate(env, 'issue_reports', report.reportId, { status: 'confirmed', rewarded: true })
      await sendEmail(env, 'contact@tinct.app',
        `[Auto-fix: word split] ${report.bookId} ch${report.chapterNumber} p${report.paragraphIndex}`,
        `<div style="font-family:sans-serif;max-width:600px">
	          <p><strong>Mechanical fix (no AI):</strong> "${htmlEscape(report.selectedText)}" → "${htmlEscape(merged)}"</p>
	          <p><strong>User comment:</strong> ${htmlEscape(report.comment || 'none')}</p>
        </div>`
      )
      return
    }
  }

  // 2b. Ask Claude to evaluate. Hard requirement: every response carries a
  // concrete proposal a human reviewer can approve or reject — never "I'm
  // unsure, no proposal". When in doubt, the AI may propose "no change" with
  // an explanation, but the reviewer must always have something to act on.
  const systemPrompt = `You are a literary text quality reviewer. You evaluate user-reported issues in AI-generated book translations on Tinct, a reading platform.

YOUR PROCESS (do these in order):
A. UNDERSTAND THE USER. Read their selected text and comment. What are they trying to say is wrong, and what do they suggest?
B. CHECK THE ORIGINAL. Look at the full paragraph (or, if it isn't loaded, the selected text itself). Independently assess: is there actually an error here? Even if you can't fully follow the user's reasoning, you may spot something they missed (typo, broken sentence, wrong word).
C. DECIDE AND PROPOSE. Always end with a concrete proposal. There are exactly three valid outcomes — pick one:
   • "apply" — there is an error and you have a corrected paragraph ready
   • "no_change" — you've reviewed and nothing needs to change (explain why, especially if disagreeing with the user)
   • "needs_human" — paragraph is genuinely ambiguous; explain what the reviewer should consider

RULES:
1. The user is usually a native speaker reporting a real issue in an AI-generated translation. Trust them by default.
2. If the user's comment looks like a corrected version of their selection, treat it as a proposed fix and apply it (replace selection with comment) unless that would clearly break the sentence.
3. The corrected_paragraph must be the COMPLETE paragraph with only the necessary fix applied — preserve everything else verbatim.
4. The corrected_paragraph must be 80–120% the length of the original. Never return a fragment.
5. NEVER return action="apply" with corrected_paragraph=null. NEVER return null/empty for proposed_action — pick one of the three values above.
6. If the paragraph could not be loaded ([NOT LOADED] below): work from the user's selection alone, propose what you'd do, and set proposed_action="needs_human" with a clear explanation so the reviewer can verify against the actual paragraph manually.
7. If the same translation mistake appears more than once in the paragraph, fix every occurrence that has the same meaning. Do not fix unrelated uses.
8. Review the same-chapter candidate paragraphs. If the same mistake appears there too, add it to related_corrections. Each related correction must contain the COMPLETE corrected paragraph for that paragraph index.
9. Use SOURCE PARAGRAPH as the anchor for meaning and TRANSLATION PARAGRAPH as the text to correct.

Respond ONLY with valid JSON — no markdown fences, no prose outside the JSON.`

  const userPrompt = `SOURCE PARAGRAPH (${context.sourceEditionKey || 'not applicable'}):
${sourceParagraph || '[NOT LOADED — evaluate from the translation paragraph and user report.]'}

TRANSLATION PARAGRAPH TO REVIEW:
${fullParagraph || '[NOT LOADED — work from the user\'s selection only. Set proposed_action="needs_human".]'}

OTHER SAME-CHAPTER CANDIDATES CONTAINING RELATED TEXT:
${relatedParagraphsForPrompt(report, context.chapterParagraphs, null)}

USER REPORT:
- Book: ${report.bookId} | Edition: ${report.editionKey || '(unknown)'} | Chapter: ${report.chapterNumber}
- Selected text: "${report.selectedText}"
- Issue type: ${report.tag}
- User comment: "${report.comment || 'No comment provided'}"

JSON response shape (every field required):
{
  "is_error": boolean,
  "confidence": number,                  // 0.0 to 1.0
  "proposed_action": "apply" | "no_change" | "needs_human",
  "explanation": string,                 // what you found and what you'd do
  "corrected_paragraph": string | null,  // REQUIRED when proposed_action="apply"; null otherwise is OK
  "related_corrections": [
    {
      "paragraph_index": number,
      "corrected_paragraph": string,
      "explanation": string
    }
  ]
}`

  let evaluation: EvaluationResult
  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })
    const claudeData = await claudeRes.json() as { content: { text: string }[] }
    const raw = claudeData.content?.[0]?.text || '{}'
    // Strip markdown fences if Claude wraps in ```json ... ```
    const cleaned = raw.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
    evaluation = JSON.parse(cleaned)
  } catch (err) {
    console.error('[evaluateAndPatch] Claude call or parse failed:', err)
    await supabaseUpdate(env, 'issue_reports', report.reportId, { status: 'needs_review' })
    return
  }

  let { is_error, confidence, explanation, corrected_paragraph } = evaluation
	  let proposedAction = evaluation.proposed_action || (is_error ? 'apply' : 'no_change')

  // If AI says error but no correction, try to generate one from user's comment
  if (is_error && !corrected_paragraph && fullParagraph && report.comment) {
    const generated = tryCommentReplacement(fullParagraph, report.selectedText, report.comment)
	    if (generated) {
	      corrected_paragraph = generated
	      proposedAction = 'apply'
	      explanation += ' (Correction generated from user comment — AI did not provide one.)'
	    }
	  }

  // ── VALIDATION: corrected paragraph must be at least 50% of original length ──
  // Prevents Claude from returning fragments that destroy paragraphs
  // If we couldn't fetch the original paragraph, NEVER auto-patch (too risky)
  if (is_error && corrected_paragraph && !fullParagraph) {
    console.error('[evaluateAndPatch] Cannot validate correction — original paragraph not available. Blocking.')
    await supabaseUpdate(env, 'issue_reports', report.reportId, { status: 'needs_review' })
    return
  }
  if (is_error && corrected_paragraph && fullParagraph) {
    const validationError = validateCorrectedParagraph(fullParagraph, corrected_paragraph)
    if (validationError) {
      console.error(`[evaluateAndPatch] ${validationError} Rejecting to prevent data loss.`)
      await supabaseUpdate(env, 'issue_reports', report.reportId, { status: 'needs_review' })
      await sendEmail(env, 'contact@tinct.app',
        `[Validation failed] ${report.tag} — ${report.bookId} ch${report.chapterNumber} p${report.paragraphIndex}`,
        `<div style="font-family:sans-serif;max-width:600px">
          <p><strong>Blocked:</strong> ${htmlEscape(validationError)}</p>
          <p><strong>User reported:</strong> "${htmlEscape(report.selectedText)}"</p>
          ${report.comment ? `<p><strong>User comment:</strong> ${htmlEscape(report.comment)}</p>` : ''}
          <p><strong>Original:</strong></p>
          <blockquote style="border-left:3px solid #e88;padding:8px 16px;background:#fff5f5;white-space:pre-wrap">${htmlEscape(fullParagraph)}</blockquote>
          <p><strong>Proposed (rejected):</strong></p>
          <blockquote style="border-left:3px solid #c66;padding:8px 16px;background:#fff0f0;white-space:pre-wrap">${htmlEscape(corrected_paragraph)}</blockquote>
        </div>`
      )
      return
    }
  }

  const relatedCorrections = (evaluation.related_corrections || [])
    .filter(c => Number.isInteger(c.paragraph_index) && c.paragraph_index !== report.paragraphIndex)
    .filter(c => {
      const original = context.chapterParagraphs[c.paragraph_index]
      return !!original && !!c.corrected_paragraph && !validateCorrectedParagraph(original, c.corrected_paragraph)
    })
    .slice(0, 8)

  // ── UNIFIED: Store AI assessment, determine action, always email ──
  const token = crypto.randomUUID()
  const validCorrection = is_error && corrected_paragraph && corrected_paragraph.length > 0
  const autoApply = validCorrection && confidence >= 0.80

  // Store AI's assessment on every report
  await supabaseUpdate(env, 'issue_reports', report.reportId, {
    status: autoApply ? 'confirmed' : 'pending_review',
    rewarded: autoApply,
    proposed_fix: corrected_paragraph || null,
    original_paragraph: fullParagraph || null,
    review_token: token,
    ai_confidence: confidence,
    ai_explanation: relatedCorrections.length
      ? `${explanation} Same-chapter related corrections proposed: ${relatedCorrections.map(c => `p${c.paragraph_index}`).join(', ')}.`
      : explanation,
  })

  // Auto-apply high-confidence fixes
  if (autoApply) {
    await upsertEditionPatch(env, {
      book_id: report.bookId, edition_key: report.editionKey,
      chapter_number: report.chapterNumber, paragraph_index: report.paragraphIndex,
      original_text: fullParagraph || report.selectedText,
      patched_text: corrected_paragraph, issue_report_id: report.reportId,
    })
    await queueAudioRegen(env, {
      book_id: report.bookId, edition_key: report.editionKey,
      chapter_number: report.chapterNumber, paragraph_index: report.paragraphIndex,
      patched_text: corrected_paragraph,
    })

    for (const related of relatedCorrections) {
      await upsertEditionPatch(env, {
        book_id: report.bookId,
        edition_key: report.editionKey,
        chapter_number: report.chapterNumber,
        paragraph_index: related.paragraph_index,
        original_text: context.chapterParagraphs[related.paragraph_index],
        patched_text: related.corrected_paragraph,
        issue_report_id: report.reportId,
        applied_by: 'claude-auto-related',
      })
      await queueAudioRegen(env, {
        book_id: report.bookId,
        edition_key: report.editionKey,
        chapter_number: report.chapterNumber,
        paragraph_index: related.paragraph_index,
        patched_text: related.corrected_paragraph,
      })
    }

    // Reward user
    if (report.userId) {
      const countRes = await supabaseGet(env, `issue_reports?user_id=eq.${report.userId}&status=eq.confirmed&rewarded=eq.true&select=id`)
      const confirmed = await countRes.json() as { id: string }[]
      if (confirmed?.length > 0 && confirmed.length % 5 === 0) {
        const profileRes = await supabaseGet(env, `profiles?id=eq.${report.userId}&select=subscription_period_end`)
        const profiles = await profileRes.json() as { subscription_period_end: string | null }[]
        const base = profiles?.[0]?.subscription_period_end ? new Date(profiles[0].subscription_period_end) : new Date()
        await supabaseUpdate(env, 'profiles', report.userId, { subscription_period_end: new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() })
      }
    }
  }

	  // ── ALWAYS email Anders with approve/reject links ──
	  const baseUrl = 'https://tinct.app'
	  const approveUrl = `${baseUrl}/api/approve-fix?id=${report.reportId}&action=${proposedAction === 'no_change' ? 'confirm-no-change' : 'approve'}&token=${token}`
	  const rejectUrl = `${baseUrl}/api/approve-fix?id=${report.reportId}&action=reject&token=${token}`
	  const editUrl = `${baseUrl}/api/approve-fix?id=${report.reportId}&action=edit&token=${token}`

  // Status badge mirrors the AI's proposed_action so the email always names a
  // concrete recommendation. Earlier copy left the reviewer guessing
  // ("Needs your approval — for what?"). Now: every email says exactly what
  // the AI thinks should happen.
  const statusBadge = autoApply
    ? '<span style="background:#4a9;color:#fff;padding:3px 10px;border-radius:4px;font-size:13px">Auto-applied</span>'
    : proposedAction === 'apply'
      ? '<span style="background:#e90;color:#fff;padding:3px 10px;border-radius:4px;font-size:13px">Approve to apply this fix</span>'
      : proposedAction === 'no_change'
        ? '<span style="background:#888;color:#fff;padding:3px 10px;border-radius:4px;font-size:13px">AI suggests: no change needed</span>'
        : '<span style="background:#5a8;color:#fff;padding:3px 10px;border-radius:4px;font-size:13px">Needs human judgment</span>'

  const subject = autoApply
    ? `[Auto-fix] ${report.tag} — ${report.bookId} ch${report.chapterNumber}`
    : proposedAction === 'no_change'
      ? `[No-change suggested] ${report.tag} — ${report.bookId} ch${report.chapterNumber}`
      : proposedAction === 'needs_human'
        ? `[Needs you] ${report.tag} — ${report.bookId} ch${report.chapterNumber}`
        : `[Review] ${report.tag} — ${report.bookId} ch${report.chapterNumber}`

  // Both buttons always present. Labels reflect the recommended path so a
  // skim reads "do the obvious thing". Approve = accept AI's recommendation
  // (apply the fix, OR keep the text as-is). Reject = override.
  const approveLabel = autoApply
    ? 'Keep fix'
    : proposedAction === 'apply'
      ? 'Approve fix'
      : proposedAction === 'no_change'
        ? 'Confirm: no change'
        : 'Approve as-is'
	  const rejectLabel = autoApply
	    ? 'Revert'
	    : proposedAction === 'no_change'
	      ? 'Override — apply user fix'
	      : 'Reject'
	  const showApproveButton = autoApply || proposedAction === 'apply' || proposedAction === 'no_change'

  // Original block is hidden behind a "couldn't load" notice when fullParagraph
  // is empty, so the reviewer immediately sees that the AI was blind and
  // should verify against the source themselves.
  const originalBlock = fullParagraph
    ? `<p><strong>Original paragraph:</strong></p>
       <blockquote style="border-left:3px solid #e88;padding:8px 16px;background:#fff5f5;white-space:pre-wrap">${htmlEscape(fullParagraph)}</blockquote>`
    : `<p style="background:#fff8e1;border-left:3px solid #e8b020;padding:10px 14px;margin:0 0 12px"><strong>⚠ Could not load full paragraph.</strong> The AI evaluated using only the selected text below. Please open the book and verify before approving.</p>
       <p><strong>Selected text only (no surrounding context):</strong></p>
       <blockquote style="border-left:3px solid #e88;padding:8px 16px;background:#fff5f5;white-space:pre-wrap">${htmlEscape(report.selectedText)}</blockquote>`

  const proposalBlock = corrected_paragraph
    ? `<p><strong>Proposed correction:</strong></p>
       <blockquote style="border-left:3px solid #8c8;padding:8px 16px;background:#f5fff5;white-space:pre-wrap">${htmlEscape(corrected_paragraph)}</blockquote>`
    : proposedAction === 'no_change'
      ? `<p><strong>AI proposes:</strong> no change to the original paragraph.</p>`
      : `<p style="background:#fff8e1;border-left:3px solid #e8b020;padding:10px 14px"><strong>No correction proposed.</strong> Use the manual edit button to write the exact paragraph to apply.</p>`

  const relatedBlock = relatedCorrections.length
    ? `<p><strong>Same-chapter related corrections:</strong></p>${relatedCorrections.map(c => `
       <p style="margin:12px 0 4px"><strong>p${c.paragraph_index}</strong>${c.explanation ? ` — ${htmlEscape(c.explanation)}` : ''}</p>
       <blockquote style="border-left:3px solid #8c8;padding:8px 16px;background:#f5fff5;white-space:pre-wrap">${htmlEscape(c.corrected_paragraph)}</blockquote>`).join('')}`
    : ''

	  await sendEmail(env, 'contact@tinct.app', subject,
	    `<div style="font-family:sans-serif;max-width:600px">
      <p>${statusBadge} &nbsp; <strong>Confidence:</strong> ${Math.round(confidence * 100)}%</p>
	      <p><strong>AI says:</strong> ${htmlEscape(explanation)}</p>
	      <p><strong>User selected:</strong> "${htmlEscape(report.selectedText)}"</p>
	      ${report.comment ? `<p><strong>User comment:</strong> ${htmlEscape(report.comment)}</p>` : ''}
      <hr/>
      ${originalBlock}
	      ${proposalBlock}
	      ${relatedBlock}
	      <p style="margin-top:24px">
	        ${showApproveButton ? `<a href="${approveUrl}" style="display:inline-block;padding:12px 28px;background:#4a9;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin-right:12px">${approveLabel}</a>` : ''}
	        <a href="${editUrl}" style="display:inline-block;padding:12px 28px;background:#567;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin-right:12px">Manual edit</a>
	        <a href="${rejectUrl}" style="display:inline-block;padding:12px 28px;background:#c66;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">${rejectLabel}</a>
	      </p>
      <p style="color:#aaa;font-size:12px;margin-top:16px">User: ${report.userId || 'anonymous'} | ${report.bookId} ch${report.chapterNumber} p${report.paragraphIndex} | edition: ${report.editionKey || '(missing)'}</p>
    </div>`
  )

  } catch (err) {
    console.error('[evaluateAndPatch] unexpected error:', err)
    try {
      await supabaseUpdate(env, 'issue_reports', report.reportId, { status: 'needs_review' })
    } catch { /* last resort */ }
  }
}

// ===== API: Report Issue =====

export async function handleReportIssue(
  request: Request,
  env: IssueReportsEnv,
  ctx: ExecutionContext,
  verifyUser: VerifyUser,
  sendEmail: SendEmail,
): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, request)
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return jsonResponse({ success: true }, 200, request)

  let body: { bookId?: string; editionKey?: string; chapterNumber?: number; paragraphIndex?: number; selectedText?: string; tag?: string; comment?: string }
  try {
    body = await request.json() as typeof body
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, request)
  }

  const bookId = typeof body.bookId === 'string' ? body.bookId.trim() : ''
  const editionKey = typeof body.editionKey === 'string' ? body.editionKey.trim() : ''
  const chapterNumber = Number(body.chapterNumber)
  const paragraphIndex = Number(body.paragraphIndex)
  const selectedText = typeof body.selectedText === 'string' ? body.selectedText.trim() : ''
  const tag = typeof body.tag === 'string' ? body.tag.trim() : ''
  const comment = typeof body.comment === 'string' ? body.comment.trim() : ''

  if (!tag || !selectedText) return jsonResponse({ error: 'Missing required fields' }, 400, request)
  if (!bookId || !editionKey || !Number.isInteger(chapterNumber) || chapterNumber < 1 || !Number.isInteger(paragraphIndex) || paragraphIndex < 0) {
    console.warn('[report-issue] rejected report with missing context:', {
      hasBookId: Boolean(bookId),
      hasEditionKey: Boolean(editionKey),
      chapterNumber: body.chapterNumber,
      paragraphIndex: body.paragraphIndex,
    })
    return jsonResponse({ error: 'Missing report context' }, 400, request)
  }

  // Get optional user context (anonymous reports allowed)
  let userId: string | null = null
  try {
    const user = await verifyUser(env, request)
    userId = user?.id || null
  } catch { /* anonymous */ }

  const insertRes = await supabaseInsert(env, 'issue_reports', {
    user_id: userId,
    book_id: bookId,
    edition_key: editionKey,
    chapter_number: chapterNumber,
    paragraph_index: paragraphIndex,
    selected_text: selectedText.slice(0, 1000),
    tag,
    comment: comment.slice(0, 500) || null,
    status: 'open',
  })

  if (!insertRes.ok) {
    const errText = await insertRes.text()
    console.error('[report-issue] insert failed:', insertRes.status, errText)
    return jsonResponse({ error: 'Failed to save report' }, 500, request)
  }

  // Parse the inserted row directly from the response
  let reportId = ''
  try {
    const rows = await insertRes.json() as { id: string }[]
    reportId = rows?.[0]?.id || ''
  } catch {
    console.error('[report-issue] could not parse insert response')
  }

  // Kick off background evaluation (returns immediately to user)
  if (reportId) {
    ctx.waitUntil(evaluateAndPatch(env, {
      reportId,
      bookId,
      editionKey,
      chapterNumber,
      paragraphIndex,
      selectedText,
      tag,
      comment,
      userId,
    }, sendEmail))
  }

  return jsonResponse({ success: true, reportId }, 200, request)
}
