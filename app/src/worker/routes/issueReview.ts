import { htmlEscape, htmlPage } from '../lib/html'
import { supabaseGet, supabaseUpdate, type SupabaseEnv } from '../lib/supabase'

export type IssueReviewEnv = SupabaseEnv

type IssueReportForContext = {
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

type ParagraphContext = {
  fullParagraph: string
  paragraphIndex: number
}

type PatchData = {
  book_id: string
  edition_key: string
  chapter_number: number
  paragraph_index: number
  original_text: string
  patched_text: string
  issue_report_id: string
  applied_by?: string
}

type AudioRegenData = {
  book_id: string
  edition_key: string
  chapter_number: number
  paragraph_index: number
  patched_text: string
}

export type IssueReviewDeps = {
  fetchParagraphContext: (env: IssueReviewEnv, report: IssueReportForContext) => Promise<ParagraphContext>
  tryCommentReplacement: (fullParagraph: string, selectedText: string, comment?: string | null) => string | null
  validateCorrectedParagraph: (original: string, corrected: string) => string | null
  upsertEditionPatch: (env: IssueReviewEnv, data: PatchData) => Promise<Response>
  queueAudioRegen: (env: IssueReviewEnv, data: AudioRegenData) => Promise<Response>
  sendEmail: (env: IssueReviewEnv, to: string, subject: string, html: string) => Promise<boolean>
}

type ReviewReport = {
  id: string
  review_token: string
  status: string
  proposed_fix: string
  original_paragraph: string
  book_id: string
  edition_key: string
  chapter_number: number
  paragraph_index: number
  user_id: string | null
  selected_text: string
  comment: string | null
}

function reportForContext(report: ReviewReport): IssueReportForContext {
  return {
    reportId: report.id,
    bookId: report.book_id,
    editionKey: report.edition_key,
    chapterNumber: report.chapter_number,
    paragraphIndex: report.paragraph_index,
    selectedText: report.selected_text,
    tag: '',
    comment: report.comment,
    userId: report.user_id,
  }
}

export async function handleApproveFix(
  request: Request,
  env: IssueReviewEnv,
  deps: IssueReviewDeps,
): Promise<Response> {
  const url = new URL(request.url)
  let form: FormData | null = null
  if (request.method === 'POST') {
    try {
      form = await request.formData()
    } catch {
      return new Response(htmlPage('Invalid form', 'The submitted edit could not be read.'), { status: 400, headers: { 'Content-Type': 'text/html' } })
    }
  }
  const id = url.searchParams.get('id') || String(form?.get('id') || '')
  const action = url.searchParams.get('action') || String(form?.get('action') || '')
  const token = url.searchParams.get('token') || String(form?.get('token') || '')

  if (!id || !action || !token || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(htmlPage('Invalid link', 'This review link is invalid or expired.'), { status: 400, headers: { 'Content-Type': 'text/html' } })
  }

  const res = await supabaseGet(env, `issue_reports?id=eq.${id}&select=*`)
  const rows = await res.json() as ReviewReport[]
  const report = rows?.[0]

  if (!report || report.review_token !== token) {
    return new Response(htmlPage('Invalid link', 'This review link is invalid or has already been used.'), { status: 403, headers: { 'Content-Type': 'text/html' } })
  }

  if (report.status !== 'pending_review' && report.status !== 'confirmed') {
    return new Response(htmlPage('Already reviewed', `This report has already been ${report.status}.`), { status: 200, headers: { 'Content-Type': 'text/html' } })
  }

  if (action === 'edit') {
    let paragraph = report.proposed_fix || report.original_paragraph || ''
    if (!paragraph && report.book_id && report.edition_key) {
      try {
        const context = await deps.fetchParagraphContext(env, reportForContext(report))
        paragraph = context.fullParagraph
        if (!report.original_paragraph && context.fullParagraph) report.original_paragraph = context.fullParagraph
      } catch { /* best-effort */ }
    }

    const formHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Manual edit — Tinct</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;margin:0;background:#f8f5f0;color:#2a2a2a}.wrap{max-width:900px;margin:32px auto;padding:0 20px}.card{background:#fff;padding:24px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08)}h1{font-size:1.25rem;margin:0 0 8px}p{color:#555;line-height:1.45}textarea{width:100%;min-height:320px;box-sizing:border-box;font:16px/1.5 Georgia,serif;padding:14px;border:1px solid #ccc;border-radius:8px}button{background:#4a9;color:#fff;border:0;padding:12px 22px;border-radius:8px;font-weight:700;margin-top:12px;cursor:pointer}.meta{font-size:13px;color:#777;background:#f7f7f7;padding:10px;border-radius:8px}</style></head>
<body><div class="wrap"><div class="card">
<h1>Manual edit</h1>
<p class="meta">${htmlEscape(report.book_id)} / ${htmlEscape(report.edition_key)} · ch${htmlEscape(report.chapter_number)} p${htmlEscape(report.paragraph_index)}<br>
Selected: "${htmlEscape(report.selected_text)}"${report.comment ? `<br>User comment: ${htmlEscape(report.comment)}` : ''}</p>
<p>Edit the full paragraph exactly as it should appear. Submitting this applies the patch and queues audio regeneration for this paragraph.</p>
<form method="POST" action="/api/approve-fix">
<input type="hidden" name="id" value="${htmlEscape(id)}">
<input type="hidden" name="action" value="manual-apply">
<input type="hidden" name="token" value="${htmlEscape(token)}">
<textarea name="proposed_fix" required>${htmlEscape(paragraph)}</textarea>
<button type="submit">Apply manual edit</button>
</form>
</div></div></body></html>`
    return new Response(formHtml, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
  }

  if (action === 'manual-apply') {
    const manualFix = String(form?.get('proposed_fix') || '').trim()
    if (!manualFix) {
      return new Response(htmlPage('Missing edit', 'The manual correction was empty.'), { status: 400, headers: { 'Content-Type': 'text/html' } })
    }
    if (!report.original_paragraph) {
      try {
        const context = await deps.fetchParagraphContext(env, reportForContext(report))
        report.original_paragraph = context.fullParagraph
      } catch { /* validation below can still allow if original is missing */ }
    }
    if (report.original_paragraph) {
      const validationError = deps.validateCorrectedParagraph(report.original_paragraph, manualFix)
      if (validationError) {
        return new Response(htmlPage('Manual edit blocked', validationError), { status: 400, headers: { 'Content-Type': 'text/html' } })
      }
    }
    report.proposed_fix = manualFix
  }

  if (action === 'confirm-no-change') {
    await supabaseUpdate(env, 'issue_reports', report.id, { status: 'rejected', rewarded: false, review_token: null })
    return new Response(htmlPage('No change confirmed', 'The report has been closed without applying a text change.'), { status: 200, headers: { 'Content-Type': 'text/html' } })
  }

  if (action === 'approve' || action === 'manual-apply') {
    if (!report.proposed_fix && report.book_id && report.edition_key) {
      try {
        const context = await deps.fetchParagraphContext(env, reportForContext(report))
        const generated = deps.tryCommentReplacement(context.fullParagraph, report.selected_text, report.comment)
        if (generated) {
          report.proposed_fix = generated
          report.original_paragraph = context.fullParagraph
        }
      } catch { /* couldn't generate fix */ }
    }

    if (!report.proposed_fix) {
      return new Response(htmlPage('Manual edit needed', `No concrete correction exists yet. <a href="/api/approve-fix?id=${htmlEscape(id)}&action=edit&token=${htmlEscape(token)}">Write the correction manually</a>.`), { status: 400, headers: { 'Content-Type': 'text/html' } })
    }
    if (!report.original_paragraph && report.book_id && report.edition_key) {
      try {
        const context = await deps.fetchParagraphContext(env, reportForContext(report))
        report.original_paragraph = context.fullParagraph
        if (context.paragraphIndex !== report.paragraph_index) {
          report.paragraph_index = context.paragraphIndex
          await supabaseUpdate(env, 'issue_reports', report.id, { paragraph_index: context.paragraphIndex, original_paragraph: context.fullParagraph || null })
        }
      } catch { /* validation below can still allow if original is missing */ }
    }
    if (report.original_paragraph) {
      const validationError = deps.validateCorrectedParagraph(report.original_paragraph, report.proposed_fix)
      if (validationError) {
        return new Response(htmlPage('Fix rejected', validationError), { status: 400, headers: { 'Content-Type': 'text/html' } })
      }
    }

    const patchRes = await deps.upsertEditionPatch(env, {
      book_id: report.book_id,
      edition_key: report.edition_key,
      chapter_number: report.chapter_number,
      paragraph_index: report.paragraph_index,
      original_text: report.original_paragraph,
      patched_text: report.proposed_fix,
      issue_report_id: report.id,
      applied_by: action === 'manual-apply' ? 'anders-manual' : 'anders-review',
    })
    if (!patchRes.ok) console.error('[approve-fix] edition_patches upsert failed:', patchRes.status, await patchRes.text())

    await deps.queueAudioRegen(env, {
      book_id: report.book_id,
      edition_key: report.edition_key,
      chapter_number: report.chapter_number,
      paragraph_index: report.paragraph_index,
      patched_text: report.proposed_fix,
    })

    await supabaseUpdate(env, 'issue_reports', report.id, { status: 'confirmed', rewarded: true, review_token: null })

    if (report.user_id) {
      const countRes = await supabaseGet(env, `issue_reports?user_id=eq.${report.user_id}&status=eq.confirmed&rewarded=eq.true&select=id`)
      const confirmed = await countRes.json() as { id: string }[]
      const totalFixes = confirmed?.length || 0
      if (totalFixes > 0 && totalFixes % 5 === 0) {
        const profileRes = await supabaseGet(env, `profiles?id=eq.${report.user_id}&select=subscription_period_end`)
        const profiles = await profileRes.json() as { subscription_period_end: string | null }[]
        const currentEnd = profiles?.[0]?.subscription_period_end
        const base = currentEnd ? new Date(currentEnd) : new Date()
        const newEnd = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000)
        await supabaseUpdate(env, 'profiles', report.user_id, { subscription_period_end: newEnd.toISOString() })
      }
    }

    if (report.user_id) {
      try {
        const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${report.user_id}`, {
          headers: { 'apikey': env.SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
        })
        const userData = await userRes.json() as { email?: string }
        if (userData.email) {
          await deps.sendEmail(env, userData.email,
            `Your fix was approved — ${report.book_id} ch${report.chapter_number}`,
            `<div style="font-family:sans-serif;max-width:500px">
              <p>Your reported issue has been <strong style="color:#4a9">approved and applied</strong>.</p>
              <p><strong>You reported:</strong> "${htmlEscape(report.selected_text)}"</p>
              ${report.comment ? `<p><strong>Your suggestion:</strong> ${htmlEscape(report.comment)}</p>` : ''}
              <p style="color:#888;font-size:13px">${report.book_id} ch${report.chapter_number} · Every 5 approved fixes earns a free month of Premium.</p>
            </div>`
          )
        }
      } catch { /* email delivery is best-effort */ }
    }

    return new Response(htmlPage('Fix approved', 'The fix has been applied and deployed. The user has been notified.'), { status: 200, headers: { 'Content-Type': 'text/html' } })
  } else if (action === 'reject') {
    const reason = new URL(request.url).searchParams.get('reason')

    if (!reason) {
      const formHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Reject — Tinct</title>
<style>body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8f5f0;color:#2a2a2a}
.card{background:#fff;padding:32px 40px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:450px;width:100%}
h1{font-size:1.2rem;margin:0 0 8px}p{font-size:0.9rem;color:#666;margin:0 0 16px}
textarea{width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;font-size:0.9rem;font-family:inherit;resize:vertical;min-height:80px;box-sizing:border-box}
button{background:#c66;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:0.9rem;cursor:pointer;margin-top:12px}
button:hover{opacity:0.9}.meta{font-size:0.8rem;color:#999;margin-bottom:12px}</style></head>
<body><div class="card">
<h1>Reject this fix</h1>
	<p class="meta">"${htmlEscape(report.selected_text || '')}" — ${htmlEscape(report.comment || '')}</p>
<p>Please explain why this report was declined. The user will receive your explanation by email.</p>
<form method="GET" action="/api/approve-fix">
	<input type="hidden" name="id" value="${htmlEscape(id)}">
<input type="hidden" name="action" value="reject">
	<input type="hidden" name="token" value="${htmlEscape(token)}">
<textarea name="reason" placeholder="e.g., The current text is correct because..." required></textarea>
<button type="submit">Reject with explanation</button>
</form></div></body></html>`
      return new Response(formHtml, { status: 200, headers: { 'Content-Type': 'text/html' } })
    }

    if (report.status === 'confirmed') {
      await fetch(`${env.SUPABASE_URL}/rest/v1/edition_patches?book_id=eq.${encodeURIComponent(report.book_id)}&edition_key=eq.${encodeURIComponent(report.edition_key)}&chapter_number=eq.${report.chapter_number}&paragraph_index=eq.${report.paragraph_index}`, {
        method: 'DELETE',
        headers: { 'apikey': env.SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
      })
    }
    await supabaseUpdate(env, 'issue_reports', report.id, { status: 'rejected', rewarded: false, review_token: null })

    if (report.user_id) {
      try {
        const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${report.user_id}`, {
          headers: { 'apikey': env.SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
        })
        const userData = await userRes.json() as { email?: string }
        if (userData.email) {
          await deps.sendEmail(env, userData.email,
            `Update on your report — ${report.book_id} ch${report.chapter_number}`,
            `<div style="font-family:sans-serif;max-width:500px">
              <p>Thank you for reporting an issue. After review, this one was <strong>not applied</strong>.</p>
              <p><strong>You reported:</strong> "${htmlEscape(report.selected_text)}"</p>
              ${report.comment ? `<p><strong>Your suggestion:</strong> ${htmlEscape(report.comment)}</p>` : ''}
              <p><strong>Reason:</strong> ${htmlEscape(reason)}</p>
              <p style="color:#888;font-size:13px">We appreciate your help improving the text. Keep reporting — every 5 approved fixes earns a free month.</p>
            </div>`
          )
        }
      } catch { /* email delivery is best-effort */ }
    }

    return new Response(htmlPage('Fix rejected', report.status === 'confirmed' ? 'The auto-applied fix has been reverted. The user has been notified.' : 'The proposed fix has been rejected. The user has been notified.'), { status: 200, headers: { 'Content-Type': 'text/html' } })
  } else {
    return new Response(htmlPage('Invalid action', 'Use the approve or reject link from your email.'), { status: 400, headers: { 'Content-Type': 'text/html' } })
  }
}
