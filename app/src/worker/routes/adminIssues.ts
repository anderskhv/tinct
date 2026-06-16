import { htmlEscape } from '../lib/html'
import { supabaseGet, type SupabaseEnv } from '../lib/supabase'

export type AdminIssuesEnv = SupabaseEnv

type VerifySiteAdmin = (env: AdminIssuesEnv, request: Request) => Promise<boolean>

export async function handleAdminIssues(
  request: Request,
  env: AdminIssuesEnv,
  verifySiteAdmin: VerifySiteAdmin,
): Promise<Response> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response('Not configured', { status: 500 })
  }
  if (!await verifySiteAdmin(env, request)) {
    return new Response('Forbidden', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  }

  const url = new URL(request.url)
  const bookFilter = url.searchParams.get('book') || ''

  let query = 'issue_reports?select=id,status,book_id,edition_key,chapter_number,paragraph_index,selected_text,comment,ai_confidence,ai_explanation,proposed_fix,review_token,created_at&order=created_at.desc&limit=100'
  if (bookFilter) query += `&book_id=eq.${encodeURIComponent(bookFilter)}`

  const res = await supabaseGet(env, query)
  const rows = await res.json() as Record<string, unknown>[]

  const baseUrl = url.origin

  const tableRows = rows.map((r: Record<string, unknown>) => {
    const status = r.status as string
    const statusColor = status === 'confirmed' ? '#4a9' : status === 'rejected' ? '#c66' : status === 'pending_review' ? '#e90' : '#888'
    const hasProposal = !!(r.proposed_fix as string)
    const conf = r.ai_confidence ? `${Math.round((r.ai_confidence as number) * 100)}%` : '—'
    const token = r.review_token as string
    const reportId = String(r.id || '')
    const approveLink = token ? `${baseUrl}/api/approve-fix?id=${encodeURIComponent(reportId)}&action=approve&token=${encodeURIComponent(token)}` : ''
    const editLink = token ? `${baseUrl}/api/approve-fix?id=${encodeURIComponent(reportId)}&action=edit&token=${encodeURIComponent(token)}` : ''
    const rejectLink = token ? `${baseUrl}/api/approve-fix?id=${encodeURIComponent(reportId)}&action=reject&token=${encodeURIComponent(token)}` : ''

    return `<tr>
      <td style="color:${statusColor};font-weight:600">${htmlEscape(status)}</td>
      <td>${htmlEscape(r.book_id || '?')}</td>
      <td>ch${htmlEscape(r.chapter_number)} p${htmlEscape(r.paragraph_index)}</td>
      <td>"${htmlEscape(((r.selected_text as string) || '').slice(0, 30))}"</td>
      <td>${htmlEscape(((r.comment as string) || '').slice(0, 40))}</td>
      <td>${conf}</td>
      <td>${htmlEscape(((r.ai_explanation as string) || '').slice(0, 50))}</td>
      <td>${hasProposal ? '✓' : '✗'}</td>
      <td>
        ${status === 'pending_review' && approveLink ? `<a href="${approveLink}" style="color:#4a9">Approve</a> · <a href="${editLink}" style="color:#567">Edit</a> · <a href="${rejectLink}" style="color:#c66">Reject</a>` : status}
      </td>
    </tr>`
  }).join('')

  const books = [...new Set(rows.map((r: Record<string, unknown>) => r.book_id as string).filter(Boolean))]
  const bookLinks = books.map(b => `<a href="?book=${encodeURIComponent(b)}" style="margin-right:12px;${bookFilter === b ? 'font-weight:bold' : ''}">${htmlEscape(b)}</a>`).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Issue Reports — Tinct Admin</title>
<style>body{font-family:system-ui;margin:20px;color:#2a2a2a}table{border-collapse:collapse;width:100%;font-size:0.85rem}th,td{padding:6px 10px;border-bottom:1px solid #ddd;text-align:left}th{background:#f5f5f5;font-weight:600}tr:hover{background:#fafafa}a{color:#4a9;text-decoration:none}.filters{margin-bottom:16px}h1{font-size:1.3rem;margin-bottom:8px}</style>
</head><body>
<h1>Issue Reports</h1>
<div class="filters"><a href="?" style="margin-right:12px;${!bookFilter ? 'font-weight:bold' : ''}">All</a>${bookLinks}</div>
<table><thead><tr><th>Status</th><th>Book</th><th>Location</th><th>Selected</th><th>Comment</th><th>AI Conf</th><th>AI Says</th><th>Fix?</th><th>Action</th></tr></thead>
<tbody>${tableRows}</tbody></table>
<p style="color:#888;font-size:0.8rem;margin-top:16px">${rows.length} reports</p>
</body></html>`

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
