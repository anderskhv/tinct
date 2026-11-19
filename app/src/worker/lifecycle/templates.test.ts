import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { EMAIL_TEMPLATES, type EmailTemplateName } from './templates.generated'
import { renderEmail, TemplateFillError } from './render'
import { EMAIL_ART_BOOK_IDS } from './emailArt.generated'
import { bookArt, LIBRARY_ART } from './engine'

const docs = path.resolve(__dirname, '../../../../docs/lifecycle-emails')
const sample = JSON.parse(fs.readFileSync(path.join(docs, 'sample-data.json'), 'utf8')) as Record<string, Record<string, string>>
const names = Object.keys(EMAIL_TEMPLATES) as EmailTemplateName[]
const OPT_IN = new Set(['keep-reading', 'keep-reading-with-question', 'next-book', 'next-book-classic-lead'])

function sampleVars(name: string): Record<string, string> {
  return { ...sample._common, ...sample[name] }
}

function jpegSize(bytes: Buffer): { width: number; height: number } | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null
  let offset = 2
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) return null
    const marker = bytes[offset + 1]
    const length = bytes.readUInt16BE(offset + 2)
    if (marker >= 0xc0 && marker <= 0xc3) return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) }
    offset += 2 + length
  }
  return null
}

describe('lifecycle templates', () => {
  it('bundles exactly the approved files in docs/lifecycle-emails/templates', () => {
    const files = fs.readdirSync(path.join(docs, 'templates')).filter(f => /\.(html|txt)$/.test(f))
    expect(files.length).toBe(names.length * 2)
    for (const name of names) {
      expect(EMAIL_TEMPLATES[name].html).toBe(fs.readFileSync(path.join(docs, 'templates', `${name}.html`), 'utf8'))
      expect(EMAIL_TEMPLATES[name].text).toBe(fs.readFileSync(path.join(docs, 'templates', `${name}.txt`), 'utf8'))
    }
    expect(names.sort()).toEqual(['announce', 'keep-reading', 'keep-reading-with-question', 'next-book', 'next-book-classic-lead', 'trial-ended', 'trial-ending', 'welcome', 'welcome-google'])
  })

  it.each(names)('%s fills from the sample data with no {{…}} left, in HTML and text', name => {
    const email = renderEmail(name, sampleVars(name))
    expect(email.html).not.toMatch(/\{\{|\}\}/)
    expect(email.text).not.toMatch(/\{\{|\}\}/)
    expect(email.subject).toBe(sample[name].subject)
    expect(email.text.trim().length).toBeGreaterThan(80)
    expect(email.text).not.toMatch(/<[a-z/]/i)
    expect(email.html).not.toContain('<!--')
    if (OPT_IN.has(name)) {
      expect(email.html).toContain('Stop reading emails')
      expect(email.text).toContain(`Stop reading emails: ${sample._common.unsubscribe_url}`)
    } else {
      expect(email.text).toContain("You're getting this because you have a Tinct account.")
    }
    for (const src of email.html.match(/<img [^>]*src="([^"]+)"/g) ?? []) expect(src).toMatch(/\.jpg"/)
  })

  it('escapes every variable except the <em> of opening_line and month_summary', () => {
    const email = renderEmail('next-book', { ...sampleVars('next-book'), opening_line: 'You finished <em>A & B</em><script>x</script>.', reason: '<b>bold</b>' })
    expect(email.html).toContain('You finished <em>A &amp; B</em>&lt;script&gt;x&lt;/script&gt;.')
    expect(email.html).toContain('&lt;b&gt;bold&lt;/b&gt;')
    expect(email.text).toContain('You finished A & B')
    expect(email.text).toContain('<b>bold</b>'.replace(/<[^>]+>/g, ''))
  })

  it('drops the month summary paragraph when it is empty', () => {
    const email = renderEmail('trial-ending', { ...sampleVars('trial-ending'), month_summary: '' })
    expect(email.html).not.toContain('This month')
    expect(email.text).not.toMatch(/\n\n\n/)
    expect(email.text).toContain('Keep Premium:')
  })

  it('a welcome without a book or a name keeps no book lines and reads "Welcome"', () => {
    const email = renderEmail('welcome-google', { ...sampleVars('welcome-google'), first_name: '', book_title: '', continue_url: '', ...LIBRARY_ART })
    expect(email.html).toContain('>Welcome</h1>')
    expect(email.html).not.toMatch(/Your place in|Continue /)
    expect(email.text.startsWith('Welcome\n')).toBe(true)
    expect(email.html).toContain('/email-art/library.jpg')
  })

  it('a next-book without a classic quote drops that block; a display card has no label', () => {
    const vars = { ...sampleVars('next-book'), classic_quote: '', classic_source: '', classic_context: '', lead_label: '' }
    const email = renderEmail('next-book', vars)
    expect(email.html).not.toContain('Simone Weil')
    expect(email.text).not.toContain('Simone Weil')
    expect(email.text).toContain('Helen Keller, The Story of My Life')
  })

  it('refuses to render with a variable missing', () => {
    const vars = sampleVars('keep-reading')
    delete vars.recap
    expect(() => renderEmail('keep-reading', vars)).toThrow(TemplateFillError)
  })

  it('announce can drop a feature row and its privacy sentence from both parts', () => {
    const email = renderEmail('announce', sampleVars('announce'), { omitFeatures: ['listen-own-books', 'librarian'] })
    expect(email.html).not.toContain('Listen to your own books')
    expect(email.html).not.toContain('xAI')
    expect(email.html).not.toContain('A librarian')
    expect(email.text).not.toContain('Listen to your own books')
    expect(email.text).not.toContain('xAI')
    expect(email.text).not.toContain('A librarian')
    expect(email.text).toContain('- Better search.')
    expect(email.html).toContain('Better search.')
    expect(email.text).toContain('If you make a profile, you control it')
  })
})

describe('email art', () => {
  it('is a hosted 1200 × 600 JPEG of at most 150 KB for every listed book and the library hero', () => {
    const dir = path.resolve(__dirname, '../../../public/email-art')
    for (const id of [...EMAIL_ART_BOOK_IDS, 'library']) {
      const bytes = fs.readFileSync(path.join(dir, `${id}.jpg`))
      expect(bytes.length, id).toBeLessThanOrEqual(150 * 1024)
      expect(jpegSize(bytes), id).toEqual({ width: 1200, height: 600 })
    }
    expect(EMAIL_ART_BOOK_IDS.has('frankenstein')).toBe(true)
  })

  it('uses the book art when there is one and the library hero otherwise, always .jpg', () => {
    expect(bookArt('frankenstein', 'Frankenstein')).toEqual({ art_url: 'https://tinct.app/email-art/frankenstein.jpg', art_alt: 'The painted cover of Frankenstein' })
    expect(bookArt('no-such-book', 'X').art_url).toBe('https://tinct.app/email-art/library.jpg')
    expect(bookArt(null, null).art_url).toMatch(/\.jpg$/)
  })
})
