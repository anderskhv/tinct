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

  it('keeps the approved content, interactions, and reader destinations in the embedded artifact', () => {
    const wireframe = readFileSync(resolve(process.cwd(), 'public/lab-wireframe.html'), 'utf8')
    const runtime = readFileSync(resolve(process.cwd(), 'public/lab-wireframe-runtime.js'), 'utf8')
    expect(wireframe).toContain('Fall in love with the books that fight back.')
    expect(wireframe).toContain("Immerse yourself in the world's greatest books.")
    expect(wireframe).toContain('data-frame-panel="library-demo"')
    expect(wireframe).toContain('data-frame-panel="versions"')
    expect(wireframe).toContain('data-frame-panel="chat"')
    expect(wireframe).toContain('Not sure where to begin?')
    expect(wireframe).toContain('Ask the librarian.')
    expect(wireframe).toContain('Search 90+ classics')
    expect(wireframe).toContain('Ideas for living')
    expect(wireframe).toContain('Stories that shaped the world')
    expect(runtime).toContain("stopAndNavigate('/lab/library')")
    expect(runtime).toContain("stopAndNavigate('/lab/phone')")
  })
})
