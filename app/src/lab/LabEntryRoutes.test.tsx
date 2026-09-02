// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { LabLanding } from './LabLanding'
import { LabLibrary } from './LabLibrary'
import { labSurface } from './labRoute'

describe('Lab entry routes', () => {
  afterEach(() => cleanup())

  it('mounts the locked landing wireframe at the landing route', () => {
    render(<LabLanding />)
    const frame = screen.getByTitle('Tinct landing')
    expect(screen.getByTestId('lab-landing')).toBeTruthy()
    expect(frame.getAttribute('src')).toBe('/lab-wireframe.html?embed=1&view=landing')
  })

  it('mounts the locked library wireframe at the library route', () => {
    render(<LabLibrary />)
    const frame = screen.getByTitle('Tinct library')
    expect(screen.getByTestId('lab-library')).toBeTruthy()
    expect(frame.getAttribute('src')).toBe('/lab-wireframe.html?embed=1&view=library')
  })

  it('routes only the new entry surfaces away from the locked reader', () => {
    expect(labSurface('/lab/landing')).toBe('landing')
    expect(labSurface('/lab/library')).toBe('library')
    expect(labSurface('/lab/phone')).toBe('reader')
  })

  it('keeps the approved content and edge-to-edge mobile treatment', () => {
    const wireframe = readFileSync(resolve(process.cwd(), 'public/lab-wireframe.html'), 'utf8')
    const runtime = readFileSync(resolve(process.cwd(), 'public/lab-wireframe-runtime.js'), 'utf8')
    expect(wireframe).toContain('Fall in love with the books that fight back.')
    expect(wireframe).toContain("Immerse yourself in the world's greatest books.")
    expect(wireframe).toContain('data-frame-panel="library-demo"')
    expect(wireframe).toContain('data-frame-panel="versions"')
    expect(wireframe).toContain('data-frame-panel="chat"')
    expect(wireframe).toContain('Preview · 1 of 3')
    expect(wireframe).toContain('Not sure where to begin?')
    expect(wireframe).toContain('Ask the librarian.')
    expect(wireframe).toContain('Search 90+ classics')
    expect(wireframe).toContain('Ideas for living')
    expect(wireframe).toContain('Stories that shaped the world')
    expect(wireframe).toContain('width: 100vw !important')
    expect(wireframe).toContain('border-radius: 0 !important')
    expect(wireframe).toContain('min-height: 100dvh !important')
    expect(wireframe).toContain('font-size:clamp(33px,min(10vw,5.3dvh),58px)')
    expect(wireframe).toContain('height:clamp(334px,44dvh,455px)')
    expect(wireframe).toContain('top:clamp(168px,45vw,202px)')
    expect(wireframe).toContain('background:color-mix(in srgb,var(--tov5-world-ink) 25%,rgba(255,255,255,.10))')
    expect(runtime).toContain("window.parent.history.pushState({}, '', '/lab/library')")
    expect(runtime).toContain("['Preview · 1 of 3','Pick a book']")
  })

  it('enforces library → detail → edition → preface → reader with no earlier reader jump', () => {
    const wireframe = readFileSync(resolve(process.cwd(), 'public/lab-wireframe.html'), 'utf8')
    const runtime = readFileSync(resolve(process.cwd(), 'public/lab-wireframe-runtime.js'), 'utf8')
    expect(wireframe).toContain('data-book-detail-title')
    expect(wireframe).toContain('class="tov5-choose-edition" data-view="edition"')
    expect(wireframe).toContain('class="tov5-continue" data-view="preface"')
    expect(runtime).toContain("showView('book-detail')")
    expect(runtime).toContain("window.parent.location.assign('/lab/phone')")
    expect(runtime.match(/window\.parent\.location\.assign\('\/lab\/phone'\)/g)).toHaveLength(1)
  })

  it.each([
    ['odyssey', 'The Odyssey'],
    ['meditations', 'Meditations'],
    ['bible-old', 'The Bible'],
  ])('opens the %s library card through the common book-detail handler', (cover, title) => {
    const wireframe = readFileSync(resolve(process.cwd(), 'public/lab-wireframe.html'), 'utf8')
    const runtime = readFileSync(resolve(process.cwd(), 'public/lab-wireframe-runtime.js'), 'utf8')
    expect(wireframe).toContain(`data-cover="${cover}"`)
    expect(wireframe).toContain(title)
    expect(runtime).toContain("const libraryBookSelector='.tov5-library-track > button, .tov5-library-section > div > button")
    expect(runtime).toContain("setBook(bookKeyFromButton(button))")
  })

  it('filters title and author text and keeps full-page librarian close/chat/voice adapters', () => {
    const wireframe = readFileSync(resolve(process.cwd(), 'public/lab-wireframe.html'), 'utf8')
    const runtime = readFileSync(resolve(process.cwd(), 'public/lab-wireframe-runtime.js'), 'utf8')
    expect(runtime).toContain(".tov5-library-search input').addEventListener('input'")
    expect(runtime).toContain("(button.textContent||'').toLowerCase().includes(query)")
    expect(runtime).toContain(".tov5-librarian-close').forEach(button=>button.addEventListener('click',()=>showView('library'))")
    expect(runtime).toContain("fetch('/api/lab-chat'")
    expect(runtime).toContain("data-voice-adapter','useLabAsk/useVoiceSession")
    expect(wireframe).toContain('html.tinct-lab-embed #tinct-onboarding-worlds-v5 .tov5-librarian-focus')
    expect(wireframe).toContain('inset:0;')
  })

  it('uses the approved onboarding language and useful starter questions', () => {
    const wireframe = readFileSync(resolve(process.cwd(), 'public/lab-wireframe.html'), 'utf8')
    const runtime = readFileSync(resolve(process.cwd(), 'public/lab-wireframe-runtime.js'), 'utf8')
    expect(wireframe).toContain('Onboard to <span data-preface-title>The Odyssey</span> <em>Optional</em>')
    expect(wireframe).toContain('Ask me anything to get a good start on the book.')
    expect(wireframe).toContain('Give me a spoiler-free overview')
    expect(wireframe).toContain('Who are the main characters?')
    expect(wireframe).toContain('What should I pay attention to?')
    expect(wireframe).not.toContain('Tap to explore')
    expect(runtime).toContain("querySelectorAll('[data-preface-prompt]')")
  })
})
