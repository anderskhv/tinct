#!/usr/bin/env node
/**
 * build-seo-pages.cjs — generate the Odyssey-template SEO page set for any
 * book from a per-book data file at `app/scripts/seo/{bookId}.js`.
 *
 * USAGE
 *   node app/scripts/build-seo-pages.cjs <bookId>
 *
 * INPUT
 *   app/scripts/seo/{bookId}.js  — exports a `book` object (see schema below)
 *
 * OUTPUT
 *   app/public/read/{bookId}/{summary,chapters,themes,cast,chapter-1..N}.html
 *   app/public/read/{bookId}/_tour.js (copied from /read/odyssey/_tour.js)
 *
 * The CSS is inlined per-page via the `STYLES` constants below. To change
 * the visual design, edit STYLES then re-run for each affected book.
 */

const fs = require('fs')
const path = require('path')

const APP_DIR = path.resolve(__dirname, '..')
const ODYSSEY_DIR = path.join(APP_DIR, 'public/read/odyssey')

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const ROMAN_VALUES = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }

function toRoman(value) {
  const parts = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
  let remaining = value
  let out = ''
  for (const [n, roman] of parts) {
    while (remaining >= n) {
      out += roman
      remaining -= n
    }
  }
  return out
}

function romanToNumber(value) {
  const roman = String(value || '').toUpperCase()
  if (!/^[IVXLCDM]+$/.test(roman)) return null
  let total = 0
  for (let i = 0; i < roman.length; i++) {
    const current = ROMAN_VALUES[roman[i]]
    const next = ROMAN_VALUES[roman[i + 1]]
    if (!current) return null
    total += next && current < next ? -current : current
  }
  return toRoman(total) === roman ? total : null
}

function normalizeChapterCopy(text) {
  return String(text ?? '').replace(
    /\b(Book|Chapter|Part|Act|Scene|Canto|Meditation)\s+([IVXLCDM]+)\b/gi,
    (match, label, roman) => {
      const value = romanToNumber(roman)
      return value ? `${label} ${value}` : match
    },
  )
}

function chapterLabel(book, n) {
  return normalizeChapterCopy(book.chapterLabel ? book.chapterLabel(n) : `Chapter ${n}`)
}

function chapterTitle(ch) {
  return normalizeChapterCopy(ch.title)
}

// =====================================================================
// SHARED CSS — inlined per page; matches the Odyssey originals byte-for-byte
// =====================================================================

const STYLES_COMMON = `:root { --paper: #ece7db; --paper-alt: #dfd8c4; --ink: #0b0b0b; --dim: #6a6555; --accent: #1f4a5c; --rule: rgba(11, 11, 11, 0.12); }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: var(--paper); color: var(--ink); font-family: 'IBM Plex Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; min-height: 100vh; line-height: 1.6; }
    a { color: inherit; }
    .wrap { position: relative; z-index: 2; }

    nav.top { padding: 24px 48px; border-bottom: 1px solid var(--ink); display: flex; justify-content: space-between; align-items: center; }
    .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 700; text-decoration: none; color: var(--ink); }
    .logo span { color: var(--accent); }
    .top-cta { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink); text-decoration: none; border: 1px solid var(--ink); padding: 8px 14px; transition: background 0.15s, color 0.15s; }
    .top-cta:hover { background: var(--ink); color: var(--paper); }

    main { max-width: 1180px; margin: 0 auto; padding: 64px 48px 96px; }

    .breadcrumb { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 24px; }
    .breadcrumb a { color: var(--dim); text-decoration: none; }
    .breadcrumb a:hover { color: var(--accent); }
    .breadcrumb span { color: var(--ink); }

    footer.site { padding: 24px 48px; border-top: 1px solid var(--ink); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; }
    footer.site a { color: inherit; text-decoration: none; transition: color 0.15s; }
    footer.site a:hover { color: var(--accent); }
    .footer-links { display: flex; gap: 18px; flex-wrap: wrap; }`

const STYLES_CHAPTER = `${STYLES_COMMON}

    .booknum { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 6px; }
    h1.title { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(1.8rem, 4vw, 2.6rem); line-height: 1.05; font-weight: 700; letter-spacing: -0.015em; color: var(--ink); margin: 0 0 14px 0; }
    h1.title em { color: var(--accent); font-style: italic; font-weight: 400; }
    .hook { font-family: 'EB Garamond', Georgia, serif; font-size: 22px; font-style: italic; color: var(--ink); margin: 0 0 32px 0; max-width: 720px; }

    .glance-section { margin: 36px 0; padding: 18px 0; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
    .glance-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 12px; }
    .glance { list-style: none; counter-reset: gl; padding: 0; margin: 0; display: grid; gap: 4px; }
    .glance li { counter-increment: gl; }
    .glance li a { font-family: 'EB Garamond', Georgia, serif; font-size: 16px; color: var(--ink); text-decoration: none; display: flex; gap: 12px; align-items: baseline; padding: 4px 0; }
    .glance li a:hover { color: var(--accent); }
    .glance li.active a { color: var(--accent); font-weight: 500; }
    .glance-num { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.14em; color: var(--dim); min-width: 80px; }
    .glance li.active .glance-num { color: var(--accent); }
    .glance-text { flex: 1; }

    h2.section { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(1.6rem, 3vw, 2rem); line-height: 1.05; font-weight: 700; letter-spacing: -0.015em; margin: 56px 0 14px 0; color: var(--ink); }
    h2.section em { color: var(--accent); font-style: italic; font-weight: 400; }

    .body p { font-family: 'EB Garamond', Georgia, serif; font-size: 19px; line-height: 1.6; margin: 0 0 16px 0; }
    .body p strong { font-weight: 600; }
    .body p em { font-style: italic; }

    .meta-block { display: grid; grid-template-columns: 100px 1fr; gap: 18px 24px; margin: 36px 0 0 0; padding: 22px 0; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
    .meta-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); padding-top: 4px; }
    .meta-row { display: flex; flex-wrap: wrap; gap: 6px; }
    .appears-chip, .theme-chip { display: inline-block; font-family: 'EB Garamond', Georgia, serif; font-size: 14px; padding: 4px 10px; border: 1px solid var(--rule); border-radius: 2px; text-decoration: none; color: var(--ink); transition: background 0.12s, border-color 0.12s; }
    .appears-chip:hover { background: rgba(31, 74, 92, 0.06); border-color: var(--accent); }
    .theme-chip { font-style: italic; color: var(--accent); }
    .theme-chip:hover { background: rgba(31, 74, 92, 0.06); border-color: var(--accent); }

    .chapter-nav { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 48px 0 0 0; }
    .nav-prev, .nav-next { display: block; border: 1px solid var(--rule); padding: 16px 18px; text-decoration: none; color: var(--ink); transition: border-color 0.12s, background 0.12s; }
    .nav-prev:hover, .nav-next:hover { border-color: var(--accent); background: rgba(31, 74, 92, 0.05); }
    .nav-next { text-align: right; }
    .nav-spacer { display: block; }
    .nav-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 4px; }
    .nav-title { font-family: 'Playfair Display', Georgia, serif; font-size: 17px; font-weight: 600; letter-spacing: -0.01em; line-height: 1.2; }

    .guides { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 48px 0 0 0; }
    .guide-card { border: 1px solid var(--ink); padding: 18px 20px; text-decoration: none; color: var(--ink); transition: background 0.12s; }
    .guide-card:hover { background: rgba(31, 74, 92, 0.06); }
    .guide-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 8px; }
    .guide-title { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 600; letter-spacing: -0.01em; margin-bottom: 4px; }
    .guide-desc { font-family: 'EB Garamond', Georgia, serif; font-size: 14px; line-height: 1.45; color: var(--dim); }

    .end-cta { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; margin: 48px 0 0 0; text-align: center; }
    .end-cta a { color: var(--accent); text-decoration: none; border-bottom: 1px solid var(--accent); padding-bottom: 2px; }
    .end-cta a:hover { color: var(--ink); border-bottom-color: var(--ink); }

    @media (max-width: 960px) { main { padding: 48px 32px 80px; } }
    @media (max-width: 720px) {
      nav.top { padding: 18px 22px; }
      main { padding: 32px 22px 56px; }
      .meta-block { grid-template-columns: 1fr; gap: 8px; }
      .chapter-nav { grid-template-columns: 1fr; }
      .guides { grid-template-columns: 1fr; }
      footer.site { padding: 22px; flex-direction: column; align-items: flex-start; }
    }`

const STYLES_CHAPTERS_INDEX = `${STYLES_COMMON}

    h1.title { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.0; font-weight: 900; letter-spacing: -0.025em; margin: 0 0 12px 0; }
    h1.title em { color: var(--accent); font-style: italic; font-weight: 400; }
    .subtitle { font-family: 'EB Garamond', Georgia, serif; font-size: 22px; font-style: italic; color: var(--dim); margin-bottom: 32px; }

    .lead { font-family: 'EB Garamond', Georgia, serif; font-size: 19px; line-height: 1.6; margin-bottom: 36px; max-width: 720px; }

    h2.part-heading { font-family: 'Playfair Display', Georgia, serif; font-size: 1.6rem; font-weight: 700; margin: 56px 0 4px 0; color: var(--accent); letter-spacing: -0.015em; }
    h2.part-heading em { font-style: italic; font-weight: 400; }
    .part-sub { font-family: 'EB Garamond', Georgia, serif; font-size: 17px; font-style: italic; color: var(--dim); margin-bottom: 22px; }

    article.chapter { padding: 22px 0; border-top: 1px solid var(--rule); }
    article.chapter:last-child { border-bottom: 1px solid var(--rule); }
    .chapter-num { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 4px; }
    h3.chapter-title { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; line-height: 1.2; font-weight: 600; letter-spacing: -0.01em; margin: 0 0 8px 0; }
    h3.chapter-title a { color: var(--ink); text-decoration: none; }
    h3.chapter-title a:hover { color: var(--accent); }
    .chapter-summary { font-family: 'EB Garamond', Georgia, serif; font-size: 18px; line-height: 1.55; color: var(--ink); margin: 0 0 8px 0; }
    .chapter-summary em { font-style: italic; }
    .chapter-meta { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--dim); }

    .related-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 56px 0 24px 0; }
    .related-card { border: 1px solid var(--ink); padding: 20px 22px; text-decoration: none; color: var(--ink); transition: background 0.12s; }
    .related-card:hover { background: rgba(31, 74, 92, 0.06); }
    .related-card-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 10px; }
    .related-card-title { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; margin-bottom: 6px; }
    .related-card-desc { font-family: 'EB Garamond', Georgia, serif; font-size: 15px; line-height: 1.45; color: var(--dim); }

    .btn { display: inline-block; font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; padding: 12px 22px; text-decoration: none; transition: background 0.12s, color 0.12s; }
    .btn-primary { background: var(--ink); color: var(--paper); }
    .btn-primary:hover { background: var(--accent); }

    .end-cta { margin: 56px 0 0 0; text-align: center; }

    @media (max-width: 720px) {
      nav.top { padding: 18px 22px; }
      main { padding: 36px 22px 64px; }
      .related-cards { grid-template-columns: 1fr; }
      footer.site { padding: 22px; flex-direction: column; align-items: flex-start; }
    }`

const STYLES_THEMES = `${STYLES_COMMON}

    h1.title { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.25rem, 5.5vw, 3.75rem); line-height: 1.0; font-weight: 900; letter-spacing: -0.025em; margin: 0 0 12px 0; }
    h1.title em { color: var(--accent); font-style: italic; font-weight: 400; }
    .byline { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--dim); margin-bottom: 28px; }
    .lead { font-family: 'EB Garamond', Georgia, serif; font-size: 20px; line-height: 1.55; margin-bottom: 36px; max-width: 660px; }
    .lead em { font-style: italic; }

    .toc { margin: 28px 0 56px 0; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding: 18px 0; }
    .toc-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 10px; }
    .toc ol { list-style: none; counter-reset: theme; padding: 0; margin: 0; display: grid; gap: 4px; }
    .toc ol li { counter-increment: theme; }
    .toc ol li a { font-family: 'EB Garamond', Georgia, serif; font-size: 17px; color: var(--ink); text-decoration: none; display: flex; gap: 10px; align-items: baseline; }
    .toc ol li a::before { content: counter(theme, decimal-leading-zero); font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.14em; color: var(--dim); }
    .toc ol li a:hover { color: var(--accent); }
    .toc ol li a em { font-style: italic; color: var(--accent); }

    h2.theme { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(1.7rem, 3.4vw, 2.3rem); line-height: 1.05; font-weight: 700; letter-spacing: -0.015em; margin: 56px 0 4px 0; color: var(--ink); scroll-margin-top: 24px; }
    h2.theme em { color: var(--accent); font-style: italic; font-weight: 400; }
    .theme-greek { font-family: 'EB Garamond', Georgia, serif; font-size: 18px; font-style: italic; color: var(--dim); margin-bottom: 18px; }

    .body p { font-family: 'EB Garamond', Georgia, serif; font-size: 19px; line-height: 1.6; margin: 0 0 16px 0; }
    .body p strong { font-weight: 600; }
    .body p em { font-style: italic; }

    .where { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--dim); margin: 14px 0 28px 0; }
    .where a { color: var(--accent); text-decoration: none; border-bottom: 1px solid rgba(31, 74, 92, 0.3); padding-bottom: 1px; }
    .where a:hover { border-bottom-color: var(--accent); }
    .where strong { color: var(--ink); font-weight: 500; }

    .guides { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 64px 0 0 0; }
    .guide-card { border: 1px solid var(--ink); padding: 20px 22px; text-decoration: none; color: var(--ink); transition: background 0.12s; }
    .guide-card:hover { background: rgba(31, 74, 92, 0.06); }
    .guide-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 10px; }
    .guide-title { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; margin-bottom: 6px; }
    .guide-desc { font-family: 'EB Garamond', Georgia, serif; font-size: 15px; line-height: 1.45; color: var(--dim); }

    .end-cta { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; margin: 56px 0 0 0; text-align: center; }
    .end-cta a { color: var(--accent); text-decoration: none; border-bottom: 1px solid var(--accent); padding-bottom: 2px; }
    .end-cta a:hover { color: var(--ink); border-bottom-color: var(--ink); }

    @media (max-width: 720px) {
      nav.top { padding: 18px 22px; }
      main { padding: 36px 22px 64px; }
      .guides { grid-template-columns: 1fr; }
      footer.site { padding: 22px; flex-direction: column; align-items: flex-start; }
    }`

const STYLES_CAST = `${STYLES_COMMON}

    h1.title { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.02; font-weight: 900; letter-spacing: -0.025em; margin: 0 0 12px 0; }
    h1.title em { color: var(--accent); font-style: italic; font-weight: 400; }
    .subtitle { font-family: 'EB Garamond', Georgia, serif; font-size: 22px; font-style: italic; color: var(--dim); margin-bottom: 32px; }

    .lead { font-family: 'EB Garamond', Georgia, serif; font-size: 19px; line-height: 1.6; margin-bottom: 36px; max-width: 720px; }
    .lead p + p { margin-top: 14px; }
    .lead em { font-style: italic; }

    h2.group { font-family: 'Playfair Display', Georgia, serif; font-size: 1.6rem; font-weight: 700; margin: 56px 0 6px 0; color: var(--accent); letter-spacing: -0.015em; }
    h2.group em { font-style: italic; font-weight: 400; }
    .group-sub { font-family: 'EB Garamond', Georgia, serif; font-size: 17px; font-style: italic; color: var(--dim); margin-bottom: 22px; }

    .character { padding: 22px 0; border-top: 1px solid var(--rule); scroll-margin-top: 24px; display: grid; grid-template-columns: minmax(180px, 200px) 1fr; gap: 24px; }
    .character:last-child { border-bottom: 1px solid var(--rule); }
    .character-name { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; line-height: 1.05; font-weight: 700; letter-spacing: -0.015em; margin-bottom: 6px; }
    .character-tag { display: inline-block; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--paper); background: var(--accent); padding: 3px 8px; margin-bottom: 8px; }
    .character-tag.god { background: #8a4a1f; }
    .character-tag.creature { background: #5a3a8a; }
    .character-epithet { font-family: 'EB Garamond', Georgia, serif; font-size: 16px; font-style: italic; color: var(--dim); line-height: 1.4; }
    .character-body { font-family: 'EB Garamond', Georgia, serif; font-size: 18px; line-height: 1.55; color: var(--ink); }
    .character-body em { font-style: italic; }
    .character-body strong { font-weight: 600; }

    .where { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--dim); margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .where strong { color: var(--ink); font-weight: 500; margin-right: 4px; }
    .where a { color: var(--accent); text-decoration: none; padding: 2px 8px; border: 1px solid var(--rule); border-radius: 2px; transition: background 0.12s, border-color 0.12s; }
    .where a:hover { background: rgba(31, 74, 92, 0.06); border-color: var(--accent); }

    .related-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 56px 0 24px 0; }
    .related-card { border: 1px solid var(--ink); padding: 20px 22px; text-decoration: none; color: var(--ink); transition: background 0.12s; }
    .related-card:hover { background: rgba(31, 74, 92, 0.06); }
    .related-card-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 10px; }
    .related-card-title { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; margin-bottom: 6px; }
    .related-card-desc { font-family: 'EB Garamond', Georgia, serif; font-size: 15px; line-height: 1.45; color: var(--dim); }

    .end-cta { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; margin: 56px 0 0 0; text-align: center; }
    .end-cta a { color: var(--accent); text-decoration: none; border-bottom: 1px solid var(--accent); padding-bottom: 2px; }
    .end-cta a:hover { color: var(--ink); border-bottom-color: var(--ink); }

    @media (max-width: 720px) {
      nav.top { padding: 18px 22px; }
      main { padding: 36px 22px 64px; }
      .character { grid-template-columns: 1fr; gap: 12px; }
      .related-cards { grid-template-columns: 1fr; }
      footer.site { padding: 22px; flex-direction: column; align-items: flex-start; }
    }`

const STYLES_SUMMARY = `${STYLES_COMMON}

    main { --prose-w: 100%; }
    .prose { max-width: var(--prose-w); }

    h1.title { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 0.98; font-weight: 900; letter-spacing: -0.025em; margin: 0 0 12px 0; }
    h1.title em { color: var(--accent); font-style: italic; font-weight: 400; }
    .byline { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--dim); margin-bottom: 28px; }
    .hook { font-family: 'EB Garamond', Georgia, serif; font-size: 23px; line-height: 1.45; font-style: italic; color: var(--ink); margin: 0 0 24px 0; }

    h2.section { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(1.75rem, 3.5vw, 2.6rem); line-height: 1.05; font-weight: 700; letter-spacing: -0.015em; margin: 72px 0 14px 0; color: var(--ink); }
    h2.section em { color: var(--accent); font-style: italic; font-weight: 400; }
    .section-sub { font-family: 'EB Garamond', Georgia, serif; font-size: 18px; line-height: 1.5; color: var(--dim); margin: 0 0 24px 0; max-width: var(--prose-w); }
    .section-sub a { color: var(--accent); text-decoration: none; border-bottom: 1px solid rgba(31, 74, 92, 0.3); }
    .section-sub a:hover { border-bottom-color: var(--accent); }

    .body p { font-family: 'EB Garamond', Georgia, serif; font-size: 19px; line-height: 1.6; margin: 0 0 16px 0; }
    .body p strong { font-weight: 600; }
    .body p em { font-style: italic; }

    .tour { margin: 8px 0 0 0; }
    .tour-bar { display: flex; justify-content: space-between; align-items: center; gap: 18px; margin: 0 0 12px 0; }
    .tour-counter { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--dim); }
    .tour-counter strong { color: var(--ink); font-weight: 500; }
    .tour-controls { display: flex; gap: 8px; }
    .tour-btn { background: none; border: 1px solid var(--ink); width: 36px; height: 36px; cursor: pointer; font-size: 14px; transition: background 0.12s, color 0.12s; color: var(--ink); }
    .tour-btn:hover:not([disabled]) { background: var(--ink); color: var(--paper); }
    .tour-btn[disabled] { opacity: 0.3; cursor: not-allowed; }

    .tour-progress { height: 2px; background: var(--rule); position: relative; margin-bottom: 18px; }
    .tour-progress-bar { position: absolute; top: 0; left: 0; height: 100%; background: var(--accent); width: 0; transition: width 0.3s; }

    .tour-viewport { position: relative; }
    .tour-track { display: grid; grid-auto-flow: column; grid-auto-columns: 100%; gap: 24px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
    .tour-track::-webkit-scrollbar { display: none; }
    .tour-card { scroll-snap-align: start; padding: 36px 32px; border: 1px solid var(--ink); background: var(--paper-alt); min-height: 280px; display: flex; flex-direction: column; gap: 14px; }
    .tour-num { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); }
    .tour-title { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; line-height: 1.15; font-weight: 700; letter-spacing: -0.015em; margin: 0; color: var(--ink); }
    .tour-text { font-family: 'EB Garamond', Georgia, serif; font-size: 17px; line-height: 1.55; margin: 0; flex: 1; }
    .tour-text em { font-style: italic; }
    .tour-foot { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; }
    .tour-foot a { color: var(--accent); text-decoration: none; border-bottom: 1px solid rgba(31, 74, 92, 0.4); padding-bottom: 1px; }
    .tour-foot a:hover { border-bottom-color: var(--accent); }

    .themes-list { display: grid; gap: 4px; margin-bottom: 20px; }
    .theme-item { padding: 16px 0; border-bottom: 1px solid var(--rule); }
    .theme-item:last-child { border-bottom: none; }
    .theme-item h3 { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; line-height: 1.15; font-weight: 700; margin: 0 0 6px 0; }
    .theme-item h3 em { font-style: italic; color: var(--accent); font-weight: 400; }
    .theme-item p { font-family: 'EB Garamond', Georgia, serif; font-size: 17px; line-height: 1.55; margin: 0; }

    .figures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; margin-bottom: 12px; }
    .figure { padding: 22px 24px; border: 1px solid var(--rule); background: var(--paper-alt); }
    .figure-name { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; line-height: 1.15; font-weight: 700; margin-bottom: 4px; }
    .figure-role { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
    .figure-body { font-family: 'EB Garamond', Georgia, serif; font-size: 16px; line-height: 1.55; color: var(--ink); margin: 0; }
    .figure-body em { font-style: italic; }

    .guides { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 24px 0 0 0; }
    .guide-card { border: 1px solid var(--ink); padding: 20px 22px; text-decoration: none; color: var(--ink); transition: background 0.12s; }
    .guide-card:hover { background: rgba(31, 74, 92, 0.06); }
    .guide-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); margin-bottom: 10px; }
    .guide-title { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; margin-bottom: 6px; }
    .guide-desc { font-family: 'EB Garamond', Georgia, serif; font-size: 15px; line-height: 1.45; color: var(--dim); }

    .end-cta { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; margin: 56px 0 0 0; text-align: center; }
    .end-cta a { color: var(--accent); text-decoration: none; border-bottom: 1px solid var(--accent); padding-bottom: 2px; }
    .end-cta a:hover { color: var(--ink); border-bottom-color: var(--ink); }

    @media (max-width: 960px) { main { padding: 48px 32px 80px; } .figures { grid-template-columns: repeat(2, 1fr); } .tour-card { padding: 32px 28px; min-height: 240px; } }
    @media (max-width: 720px) {
      nav.top { padding: 18px 22px; }
      main { padding: 32px 22px 56px; }
      h1.title { font-size: clamp(2rem, 9vw, 3rem); }
      .figures, .guides { grid-template-columns: 1fr; }
      .tour-card { padding: 28px 26px; min-height: 260px; }
      footer.site { padding: 22px; flex-direction: column; align-items: flex-start; }
    }`

// =====================================================================
// PAGE TEMPLATES
// =====================================================================

function head({ title, description, canonical, jsonLd }) {
  title = normalizeChapterCopy(title)
  description = normalizeChapterCopy(description)
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${canonical}">

  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="Tinct">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">${jsonLd ? `\n\n  <script type="application/ld+json">\n  ${jsonLd}\n  </script>` : ''}

  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&display=swap" rel="stylesheet">`
}

function footer() {
  return `  <footer class="site">
    <span>Tinct — 2026</span>
    <div class="footer-links">
      <a href="/read">Library</a>
      <a href="/about">About</a>
      <a href="/#pricing">Pricing</a>
      <a href="mailto:contact@tinct.app">contact@tinct.app</a>
    </div>
  </footer>

</div>
</body>
</html>`
}

// --- chapter-N.html ---------------------------------------------------

function renderChapter(book, ch) {
  const N = book.chapters.length
  const title = `${book.title}, Chapter ${ch.n}: ${chapterTitle(ch)} | Tinct`
  const description = `Chapter ${ch.n} of ${book.author}'s ${book.title}: ${chapterTitle(ch)}. Summary, characters who appear, themes, and the full text in modern translation. Free on Tinct.`
  const canonical = `https://tinct.app/read/${book.id}/chapter-${ch.n}`

  const glanceLis = book.chapters.map(c => {
    const cls = c.n === ch.n ? ' class="active"' : ''
    return `      <li${cls}><a href="/read/${book.id}/chapter-${c.n}"><span class="glance-num">${esc(chapterLabel(book, c.n))}</span><span class="glance-text">${esc(normalizeChapterCopy(c.tour ? c.tour.split('. ')[0] + '.' : c.title))}</span></a></li>`
  }).join('\n')

  const summaryParas = ch.summary.map(p => `      <p>${p}</p>`).join('\n')

  const appearsChips = (ch.appears || []).map(a =>
    `        <a href="/read/${book.id}/cast#char-${a.id}" class="appears-chip">${esc(a.name)}</a>`
  ).join('\n')
  const themeChips = (ch.themes || []).map(t =>
    `        <a href="/read/${book.id}/themes#${t.slug}" class="theme-chip">${esc(t.label)}</a>`
  ).join('\n')

  const prevCh = book.chapters.find(c => c.n === ch.n - 1)
  const nextCh = book.chapters.find(c => c.n === ch.n + 1)
  const prevHtml = prevCh
    ? `      <a href="/read/${book.id}/chapter-${prevCh.n}" class="nav-prev"><div class="nav-label">← Previous · Chapter ${prevCh.n}</div><div class="nav-title">${esc(chapterTitle(prevCh))}</div></a>`
    : `      <span class="nav-spacer"></span>`
  const nextHtml = nextCh
    ? `      <a href="/read/${book.id}/chapter-${nextCh.n}" class="nav-next"><div class="nav-label">Next · Chapter ${nextCh.n} →</div><div class="nav-title">${esc(chapterTitle(nextCh))}</div></a>`
    : `      <span class="nav-spacer"></span>`

  return `${head({ title, description, canonical })}

  <style>
    ${STYLES_CHAPTER}
  </style>
</head>
<body>
<div class="wrap">

  <nav class="top">
    <a href="/" class="logo">Tinct<span>.</span></a>
    <a href="/read/${book.id}?chapter=${ch.n}&amp;edition=modern-en" class="top-cta">Read this chapter free →</a>
  </nav>

  <main>

    <div class="breadcrumb">
      <a href="/">Tinct</a> · <a href="/read">Library</a> · <a href="/read/${book.id}/summary">${esc(book.title)}</a> · <a href="/read/${book.id}/chapters">Chapters</a> · <span>Chapter ${ch.n}</span>
    </div>

    <div class="booknum">${esc(chapterLabel(book, ch.n))} of ${N}</div>
    <h1 class="title">${esc(chapterTitle(ch))}</h1>
    <p class="hook">${ch.hook || ''}</p>

    <div class="glance-section">
      <div class="glance-label">All ${N} chapters — click to jump</div>
      <ol class="glance">
${glanceLis}
      </ol>
    </div>

    <h2 class="section">Summary</h2>
    <div class="body">
${summaryParas}
    </div>

    <div class="meta-block">
      <div class="meta-label">Appears</div>
      <div class="meta-row">
${appearsChips}
      </div>
      <div class="meta-label">Themes</div>
      <div class="meta-row">
${themeChips}
      </div>
    </div>

    <div class="chapter-nav">
${prevHtml}
${nextHtml}
    </div>

    <div class="guides">
      <a href="/read/${book.id}/summary" class="guide-card">
        <div class="guide-label">The book itself</div>
        <div class="guide-title">Summary &amp; story</div>
        <div class="guide-desc">What ${esc(book.title)} is, why it matters.</div>
      </a>
      <a href="/read/${book.id}/themes" class="guide-card">
        <div class="guide-label">Analysis</div>
        <div class="guide-title">Themes</div>
        <div class="guide-desc">${esc(book.themesBlurb || 'The threads that hold it together.')}</div>
      </a>
      <a href="/read/${book.id}/cast" class="guide-card">
        <div class="guide-label">Who's who</div>
        <div class="guide-title">${esc(book.castBlurb || 'All characters')}</div>
        <div class="guide-desc">${esc(book.castDesc || 'Everyone who appears.')}</div>
      </a>
    </div>

    <p class="end-cta"><a href="/read/${book.id}?chapter=${ch.n}&amp;edition=modern-en">Read Chapter ${ch.n} in the reader →</a></p>

  </main>

${footer()}`
}

// --- chapters.html ----------------------------------------------------

function renderChapters(book) {
  const title = `${book.title} — All ${book.chapters.length} Chapters Summarized | Tinct`
  const description = `Every chapter of ${book.author}'s ${book.title} summarized. ${book.chapters.length} chapters at a glance, each linked to a deeper page and the reader.`
  const canonical = `https://tinct.app/read/${book.id}/chapters`

  const groups = book.groups || [{ label: '', subtitle: '', chapters: book.chapters.map(c => c.n) }]
  const groupsHtml = groups.map(g => {
    const articles = g.chapters.map(n => {
      const ch = book.chapters.find(c => c.n === n)
      if (!ch) return ''
      const appears = (ch.appears || []).slice(0, 5).map(a => esc(a.name)).join(' · ')
      return `    <article class="chapter">
      <div class="chapter-num">${esc(chapterLabel(book, ch.n))}</div>
      <h3 class="chapter-title"><a href="/read/${book.id}/chapter-${ch.n}">${esc(chapterTitle(ch))}</a></h3>
      <p class="chapter-summary">${ch.blurb || ''}</p>${appears ? `\n      <div class="chapter-meta">\n        <span><strong>Appears:</strong> ${appears}</span>\n      </div>` : ''}
    </article>`
    }).join('\n\n')

    const heading = g.label ? `    <h2 class="part-heading">${g.label.replace(/·/g, '·').replace(/(\w[^·]+?)(\s·\s)(.+)/, '$1$2<em>$3</em>')}</h2>${g.subtitle ? `\n    <p class="part-sub">${esc(g.subtitle)}</p>` : ''}\n\n` : ''
    return heading + articles
  }).join('\n\n')

  return `${head({ title, description, canonical })}

  <style>
    ${STYLES_CHAPTERS_INDEX}
  </style>
</head>
<body>
<div class="wrap">

  <nav class="top">
    <a href="/" class="logo">Tinct<span>.</span></a>
    <a href="/read/${book.id}" class="top-cta">Read the full book for free →</a>
  </nav>

  <main>

    <div class="breadcrumb">
      <a href="/">Tinct</a> · <a href="/read">Library</a> · <a href="/read/${book.id}/summary">${esc(book.title)}</a> · <span>Chapter guide</span>
    </div>

    <h1 class="title">${esc(book.title)} — <em>chapter by chapter</em></h1>
    <p class="subtitle">${esc(book.chaptersSubtitle || `All ${book.chapters.length} chapters summarized.`)}</p>

    <div class="lead">${book.chaptersLead || ''}</div>

${groupsHtml}

    <div class="related-cards">
      <a href="/read/${book.id}/summary" class="related-card">
        <div class="related-card-label">The book itself</div>
        <div class="related-card-title">Summary &amp; story</div>
        <div class="related-card-desc">What ${esc(book.title)} is, the story without spoilers, the themes.</div>
      </a>
      <a href="/read/${book.id}/themes" class="related-card">
        <div class="related-card-label">Analysis</div>
        <div class="related-card-title">Themes</div>
        <div class="related-card-desc">${esc(book.themesBlurb || 'The threads that hold it together.')}</div>
      </a>
      <a href="/read/${book.id}/cast" class="related-card">
        <div class="related-card-label">Who's who</div>
        <div class="related-card-title">${esc(book.castBlurb || 'Characters')}</div>
        <div class="related-card-desc">${esc(book.castDesc || 'Everyone who appears.')}</div>
      </a>
    </div>

    <p class="end-cta">
      <a href="/read/${book.id}" class="btn btn-primary">Start reading →</a>
    </p>

  </main>

${footer()}`
}

// --- themes.html ------------------------------------------------------

function renderThemes(book) {
  const title = `${book.title} — Themes & Analysis | Tinct`
  const description = `Themes and analysis of ${book.author}'s ${book.title}. ${book.themes.map(t => t.title).join(', ')}.`
  const canonical = `https://tinct.app/read/${book.id}/themes`

  const tocLis = book.themes.map(t =>
    `        <li><a href="#${t.slug}">${t.title.includes('—') || t.title.includes('·') ? t.title : t.title}</a></li>`
  ).join('\n')

  const themesHtml = book.themes.map((t, i) => {
    const num = i + 1
    const paras = t.essay.map(p => `      <p>${p}</p>`).join('\n')
    const greek = t.greek ? `    <p class="theme-greek">${t.greek}</p>` : ''
    const pull = t.pull ? `      <blockquote class="pull">\n        ${esc(t.pull.text)}\n        <cite>— ${esc(t.pull.cite)}</cite>\n      </blockquote>` : ''
    const where = t.where ? `      <p class="where"><strong>Where to follow it:</strong> ${t.where.map(w => `<a href="/read/${book.id}/chapter-${w.n}">${esc(w.label)}</a>`).join(', ')}.</p>` : ''
    return `    <h2 class="theme" id="${t.slug}">${num} · ${t.title}</h2>
${greek}
    <div class="body">
${paras}
${pull}
${where}
    </div>`
  }).join('\n\n')

  return `${head({ title, description, canonical })}

  <style>
    ${STYLES_THEMES}
  </style>
</head>
<body>
<div class="wrap">

  <nav class="top">
    <a href="/" class="logo">Tinct<span>.</span></a>
    <a href="/read/${book.id}" class="top-cta">Read the full book for free →</a>
  </nav>

  <main>

    <div class="breadcrumb">
      <a href="/">Tinct</a> · <a href="/read">Library</a> · <a href="/read/${book.id}/summary">${esc(book.title)}</a> · <span>Themes &amp; analysis</span>
    </div>

    <h1 class="title">${esc(book.title)} — <em>themes &amp; analysis</em></h1>
    <p class="byline">${esc(book.themesByline || `${book.themes.length} threads that hold the book together`)}</p>

    <p class="lead">${book.themesLead || ''}</p>

    <nav class="toc">
      <div class="toc-label">In this analysis</div>
      <ol>
${tocLis}
      </ol>
    </nav>

${themesHtml}

    <div class="guides">
      <a href="/read/${book.id}/summary" class="guide-card">
        <div class="guide-label">The book itself</div>
        <div class="guide-title">Summary &amp; story</div>
        <div class="guide-desc">What ${esc(book.title)} is, the story, all chapters at a glance.</div>
      </a>
      <a href="/read/${book.id}/chapters" class="guide-card">
        <div class="guide-label">In 5 minutes</div>
        <div class="guide-title">Chapter-by-chapter</div>
        <div class="guide-desc">All ${book.chapters.length} chapters summarized. The full plot, told fast — or in depth.</div>
      </a>
      <a href="/read/${book.id}/cast" class="guide-card">
        <div class="guide-label">Who's who</div>
        <div class="guide-title">${esc(book.castBlurb || 'All characters')}</div>
        <div class="guide-desc">${esc(book.castDesc || 'Everyone who appears.')}</div>
      </a>
    </div>

    <p class="end-cta"><a href="/read/${book.id}">Open ${esc(book.title)} in the reader →</a></p>

  </main>

${footer()}`
}

// --- cast.html --------------------------------------------------------

function renderCast(book) {
  const title = `${book.title} — Characters | Tinct`
  const description = `Every character in ${book.author}'s ${book.title}. ${book.castGroups.flatMap(g => g.characters.map(c => c.name)).slice(0, 6).join(', ')}, and more. Each linked to the chapters they appear in.`
  const canonical = `https://tinct.app/read/${book.id}/cast`

  const groupsHtml = book.castGroups.map(g => {
    const chars = g.characters.map(c => {
      const tagClass = c.tagClass || 'mortal'
      const where = c.appears && c.appears.length > 0
        ? `        <div class="where"><strong>${esc(c.appearsLabel || 'Appears in:')}</strong> ${c.appears.map(n => `<a href="/read/${book.id}/chapter-${n}">${typeof n === 'number' ? (n === c.appears[0] ? 'Chapter ' + n : String(n)) : esc(n)}</a>`).join(' · ')}</div>`
        : ''
      return `    <article class="character" id="char-${c.id}">
      <div>
        <div class="character-tag${tagClass !== 'mortal' ? ' ' + tagClass : ''}">${esc(c.tag || 'Mortal')}</div>
        <div class="character-name">${esc(c.name)}</div>
        <div class="character-epithet">${esc(c.epithet || '')}</div>
      </div>
      <div>
        <p class="character-body">${c.body}</p>
${where}
      </div>
    </article>`
    }).join('\n\n')
    return `    <h2 class="group">${g.label.replace(/·\s(.+)/, '· <em>$1</em>')}</h2>${g.subtitle ? `\n    <p class="group-sub">${esc(g.subtitle)}</p>` : ''}\n\n${chars}`
  }).join('\n\n')

  return `${head({ title, description, canonical })}

  <style>
    ${STYLES_CAST}
  </style>
</head>
<body>
<div class="wrap">

  <nav class="top">
    <a href="/" class="logo">Tinct<span>.</span></a>
    <a href="/read/${book.id}" class="top-cta">Read the full book for free →</a>
  </nav>

  <main>

    <div class="breadcrumb">
      <a href="/">Tinct</a> · <a href="/read">Library</a> · <a href="/read/${book.id}/summary">${esc(book.title)}</a> · <span>Characters</span>
    </div>

    <h1 class="title">${esc(book.title)} — <em>who's who</em></h1>
    <p class="subtitle">${esc(book.castSubtitle || 'Every named figure in the book.')}</p>

    <div class="lead">${book.castLead || ''}</div>

${groupsHtml}

    <div class="related-cards">
      <a href="/read/${book.id}/summary" class="related-card">
        <div class="related-card-label">The book itself</div>
        <div class="related-card-title">Summary &amp; story</div>
        <div class="related-card-desc">What ${esc(book.title)} is, the story, all chapters at a glance.</div>
      </a>
      <a href="/read/${book.id}/chapters" class="related-card">
        <div class="related-card-label">In 5 minutes</div>
        <div class="related-card-title">Chapter-by-chapter</div>
        <div class="related-card-desc">All ${book.chapters.length} chapters summarized.</div>
      </a>
      <a href="/read/${book.id}/themes" class="related-card">
        <div class="related-card-label">Analysis</div>
        <div class="related-card-title">Themes</div>
        <div class="related-card-desc">${esc(book.themesBlurb || 'The threads that hold it together.')}</div>
      </a>
    </div>

    <p class="end-cta"><a href="/read/${book.id}">Open ${esc(book.title)} in the reader →</a></p>

  </main>

${footer()}`
}

// --- summary.html -----------------------------------------------------

function renderSummary(book) {
  const title = `${book.title} by ${book.author} — Summary, Story & Why It Matters | Tinct`
  const description = `A clear summary of ${book.author}'s ${book.title}. The full story without spoilers, all ${book.chapters.length} chapters at a glance, the key characters, the central themes.`
  const canonical = `https://tinct.app/read/${book.id}/summary`
  const jsonLd = `{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${esc(book.title)} by ${esc(book.author)} — Summary, Story and Why It Matters",
    "description": "${esc(description)}",
    "about": {
      "@type": "Book",
      "name": "${esc(book.title)}",
      "author": { "@type": "Person", "name": "${esc(book.author)}" },
      "inLanguage": "en",
      "isAccessibleForFree": true,
      "genre": ${JSON.stringify(book.genre || ['Classical literature'])}
    },
    "isPartOf": { "@type": "WebSite", "name": "Tinct", "url": "https://tinct.app" },
    "publisher": { "@type": "Organization", "name": "Tinct", "url": "https://tinct.app" }
  }`

  const aboutParas = (book.about || []).map(p => `      <p>${p}</p>`).join('\n')

  const tourCards = book.chapters.map(ch =>
    `          <article class="tour-card" data-decimal="${ch.n}">
            <div class="tour-num">${esc(chapterLabel(book, ch.n))}</div>
            <h3 class="tour-title">${esc(normalizeChapterCopy(ch.tourTitle || ch.title))}</h3>
            <p class="tour-text">${ch.tour || ''}</p>
            <div class="tour-foot"><a href="/read/${book.id}?chapter=${ch.n}&amp;edition=modern-en">Read ${esc(chapterLabel(book, ch.n))} in the reader →</a></div>
          </article>`
  ).join('\n\n')

  const themePreview = book.themes.map(t =>
    `      <article class="theme-item">
        <h3>${t.title.includes('—') ? t.title : `<em>${t.title}</em>`}</h3>
        <p>${t.preview || (t.essay && t.essay[0]) || ''}</p>
      </article>`
  ).join('\n')

  const figures = (book.keyFigures || []).map(f =>
    `      <div class="figure">
        <div class="figure-name">${esc(f.name)}</div>
        <div class="figure-role">${esc(f.role)}</div>
        <p class="figure-body">${f.body}</p>
      </div>`
  ).join('\n')

  return `${head({ title, description, canonical, jsonLd })}

  <style>
    ${STYLES_SUMMARY}
  </style>
  <script src="/read/${book.id}/_tour.js" defer></script>
</head>
<body>
<div class="wrap">

  <nav class="top">
    <a href="/" class="logo">Tinct<span>.</span></a>
    <a href="/read/${book.id}" class="top-cta">Read the full book for free →</a>
  </nav>

  <main>

    <div class="breadcrumb">
      <a href="/">Tinct</a> · <a href="/read">Library</a> · <span>${esc(book.title)}</span>
    </div>

    <h1 class="title">${esc(book.title)} ${book.titleAccent ? `<em>${esc(book.titleAccent)}</em>` : ''}</h1>
    <p class="byline">${esc(book.byline || `by ${book.author}`)}</p>

    <p class="hook">${book.hook || ''}</p>

    <h2 class="section">${book.aboutHeading || 'The book in <em>brief</em>'}</h2>
    <div class="body prose">
${aboutParas}
    </div>

    <h2 class="section">${esc(book.title)}, <em>chapter by chapter</em></h2>
    <p class="section-sub">Click through the ${book.chapters.length} chapters like a tour. Each card picks up where the last left off — a quick way to read ${esc(book.title)} in five minutes. Open any book in depth, or jump straight into the reader.</p>

    <div class="tour" id="tour">
      <header class="tour-bar">
        <div class="tour-counter">${chapterLabel(book, 1).replace(/\d+/, '')}<strong id="tour-num-display">1</strong> of ${book.chapters.length}</div>
        <div class="tour-controls">
          <button class="tour-btn" data-tour-prev aria-label="Previous chapter">←</button>
          <button class="tour-btn" data-tour-next aria-label="Next chapter">→</button>
        </div>
      </header>
      <div class="tour-progress"><div class="tour-progress-bar" id="tour-bar"></div></div>
      <div class="tour-viewport">
        <div class="tour-track" id="tour-track">

${tourCards}

        </div>
      </div>
    </div>

    <h2 class="section">Key <em>themes</em></h2>
    <p class="section-sub">${book.themes.length} threads that hold the book together. <a href="/read/${book.id}/themes">Full analysis →</a></p>

    <div class="themes-list">
${themePreview}
    </div>

    <h2 class="section">Key <em>figures</em></h2>
    <p class="section-sub">The ${(book.keyFigures || []).length} who matter most. ${book.castGroups ? `More in the <a href="/read/${book.id}/cast">full character guide</a>.` : ''}</p>

    <div class="figures">
${figures}
    </div>

    <h2 class="section">Go <em>deeper</em></h2>
    <div class="guides">
      <a href="/read/${book.id}/chapters" class="guide-card">
        <div class="guide-label">In 5 minutes — or in depth</div>
        <div class="guide-title">Chapter-by-chapter</div>
        <div class="guide-desc">All ${book.chapters.length} chapters summarized. The full plot in detail, told fast or told slow.</div>
      </a>
      <a href="/read/${book.id}/themes" class="guide-card">
        <div class="guide-label">Analysis</div>
        <div class="guide-title">Themes &amp; meaning</div>
        <div class="guide-desc">${esc(book.themesBlurb || 'The threads that hold it together.')}</div>
      </a>
      <a href="/read/${book.id}/cast" class="guide-card">
        <div class="guide-label">Who's who</div>
        <div class="guide-title">${esc(book.castBlurb || 'All characters')}</div>
        <div class="guide-desc">${esc(book.castDesc || 'Everyone who appears.')}</div>
      </a>
    </div>

    <p class="end-cta"><a href="/read/${book.id}">Open ${esc(book.title)} in the reader →</a></p>

  </main>

${footer()}`
}

// =====================================================================
// MAIN
// =====================================================================

function main() {
  const bookId = process.argv[2]
  if (!bookId) {
    console.error('Usage: node app/scripts/build-seo-pages.cjs <bookId>')
    process.exit(1)
  }

  const dataPath = path.join(__dirname, 'seo', `${bookId}.cjs`)
  if (!fs.existsSync(dataPath)) {
    console.error(`[build-seo] No data file at ${dataPath}`)
    process.exit(1)
  }

  delete require.cache[require.resolve(dataPath)]
  const book = require(dataPath)
  if (!book.id || book.id !== bookId) throw new Error(`book.id "${book.id}" doesn't match arg "${bookId}"`)

  const outDir = path.join(APP_DIR, 'public/read', bookId)
  fs.mkdirSync(outDir, { recursive: true })

  // _tour.js — copy from Odyssey (script is generic)
  fs.copyFileSync(path.join(ODYSSEY_DIR, '_tour.js'), path.join(outDir, '_tour.js'))

  const writeHtml = (name, html) => fs.writeFileSync(path.join(outDir, name), normalizeChapterCopy(html))

  writeHtml('summary.html', renderSummary(book))
  writeHtml('chapters.html', renderChapters(book))
  writeHtml('themes.html', renderThemes(book))
  writeHtml('cast.html', renderCast(book))
  for (const ch of book.chapters) {
    writeHtml(`chapter-${ch.n}.html`, renderChapter(book, ch))
  }

  console.log(`[build-seo] Wrote ${book.chapters.length + 4} HTML files + _tour.js for ${bookId}`)
}

if (require.main === module) main()
