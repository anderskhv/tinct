/**
 * Fills the approved lifecycle templates (docs/lifecycle-emails/templates)
 * with a reader's values, per the README's "Variables" section:
 *
 * - every variable is HTML-escaped, except `opening_line` and `month_summary`,
 *   which may carry `<em>` for book titles (and nothing else);
 * - the text part gets the same values with tags stripped;
 * - an empty `month_summary` drops its paragraph.
 *
 * The templates put each block on its own line, so an optional block that has
 * no value (the month summary, the classic quote of a pairing without one,
 * the book lines of a welcome without a book) is dropped line by line in both
 * parts. A filled email never keeps a `{{…}}`: render throws instead, and the
 * caller sends nothing.
 */
import { EMAIL_TEMPLATES, type EmailTemplateName } from './templates.generated'

export type EmailVars = Record<string, string>

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

const RAW_HTML_VARS = new Set(['opening_line', 'month_summary'])
/** Variables whose whole line (block) is dropped when the value is empty. */
const OPTIONAL_LINE_VARS = ['month_summary', 'classic_quote', 'classic_source', 'classic_context', 'book_title', 'continue_url']

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Escapes everything except a bare `<em>` / `</em>`. */
export function emOnlyHtml(value: string): string {
  return value.split(/(<\/?em>)/g).map(part => (part === '<em>' || part === '</em>' ? part : escapeHtml(part))).join('')
}

export function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, '')
}

const ENTITIES: Record<string, string> = {
  '&rsquo;': '’', '&lsquo;': '‘', '&ldquo;': '“', '&rdquo;': '”',
  '&nbsp;': ' ', '&amp;': '&', '&mdash;': '—', '&ndash;': '–', '&hellip;': '…',
}
function decodeEntities(value: string): string {
  return value.replace(/&[a-z]+;/g, entity => ENTITIES[entity] ?? entity)
}

/** Sentence/row text of a feature marked `<!-- feature: id ... -->` in the announcement. */
function featureSnippets(html: string, feature: string): { rows: string[]; inline: string[] } {
  const rows: string[] = []
  const inline: string[] = []
  const lines = html.split('\n')
  const marker = new RegExp(`<!-- feature: ${feature.replace(/[^a-z0-9-]/g, '')}(?: [^>]*)? -->`)
  lines.forEach((line, index) => {
    if (!marker.test(line)) return
    if (line.trim().match(/^<!--.*-->$/)) {
      const next = lines[index + 1]
      if (next !== undefined) rows.push(next)
    }
    const after = line.split(marker).slice(1)
    for (const chunk of after) {
      const sentence = chunk.split(/<!--|<\/p>/)[0]
      if (sentence.trim()) inline.push(sentence)
    }
  })
  return { rows, inline }
}

function dropFeatures(html: string, text: string, features: string[]): { html: string; text: string } {
  for (const feature of features) {
    const { rows, inline } = featureSnippets(html, feature)
    for (const row of rows) {
      const plain = decodeEntities(stripTags(row)).trim()
      html = html.split('\n').filter(line => line !== row).join('\n')
      text = text.split('\n').filter(line => line.trim() !== `- ${plain}`).join('\n')
    }
    for (const sentence of inline) {
      html = html.replace(sentence, '')
      text = text.replace(decodeEntities(stripTags(sentence)), '')
    }
  }
  return { html, text }
}

function dropLinesWith(source: string, variable: string): string {
  return source.split('\n').filter(line => !line.includes(`{{${variable}}}`)).join('\n')
}

export class TemplateFillError extends Error {}

export function renderEmail(name: EmailTemplateName, vars: EmailVars, options: { omitFeatures?: string[] } = {}): RenderedEmail {
  const template = EMAIL_TEMPLATES[name]
  if (!template) throw new TemplateFillError(`unknown template ${name}`)
  let html: string = template.html
  let text: string = template.text

  if (options.omitFeatures?.length) ({ html, text } = dropFeatures(html, text, options.omitFeatures))
  // Internal notes in the templates never go out.
  html = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<p [^>]*>\s*<\/p>\n?/g, '')

  // "Welcome, {{first_name}}" without a name reads "Welcome".
  if (vars.first_name === '') {
    html = html.split(', {{first_name}}').join('')
    text = text.split(', {{first_name}}').join('')
  }
  // A display-line card has no label (README: leave lead_label empty).
  if (vars.lead_label === '') {
    html = html.split('{{lead_label}} ').join('')
    text = text.split('{{lead_label}} ').join('')
  }
  for (const variable of OPTIONAL_LINE_VARS) {
    if (vars[variable] === '') {
      html = dropLinesWith(html, variable)
      text = dropLinesWith(text, variable)
    }
  }
  text = text.replace(/\n{3,}/g, '\n\n')

  const fill = (source: string, asHtml: boolean) => source.replace(/\{\{([a-z_]+)\}\}/g, (match, key: string) => {
    const value = vars[key]
    if (typeof value !== 'string') return match
    if (!asHtml) return stripTags(value)
    return RAW_HTML_VARS.has(key) ? emOnlyHtml(value) : escapeHtml(value)
  })
  const filledHtml = fill(html, true)
  const filledText = fill(text, false)
  const leftover = `${filledHtml}\n${filledText}`.match(/\{\{[^}]*\}\}/)
  if (leftover) throw new TemplateFillError(`${name}: unfilled ${leftover[0]}`)
  const subject = stripTags(vars.subject ?? '')
  if (!subject) throw new TemplateFillError(`${name}: no subject`)
  return { subject, html: filledHtml, text: filledText }
}
