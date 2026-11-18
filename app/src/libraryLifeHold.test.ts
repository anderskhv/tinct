import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// The room's life (2026-10-21, scripts/check-library-speed.mjs). The library's ambient loop
// redrew the whole scene and the orb on every other frame from the first frame on: on a
// throttled phone the main thread was 95% busy at rest, a returning reader's desk arrived at
// 6.3 s instead of 2.9 s, and a tap waited behind the frame being painted. The life now holds
// still while the page arrives and where the room cannot be seen;
// a change to the picture itself (a scene, the canvas size, the featured book) still draws.
const app = readFileSync(resolve(__dirname, '../public/lab/library_2/app.js'), 'utf8')
const ambient = app.slice(app.indexOf('function ambient(now)'), app.indexOf('function refreshAmbient'))

describe("the library room's life", () => {
  it('asks whether to hold before drawing the scene and the orb', () => {
    expect(ambient).toContain('const held=lifeHeld(now)')
    // Held, the scene still draws when the picture itself changed (heldSceneKey).
    expect(ambient).toMatch(/if\(!held\|\|key!==heldSceneKey\)\{heldSceneKey=key;drawScene\(now\);\}/)
    // The open librarian's orb is what the reader is looking at: it keeps turning.
    expect(ambient).toContain("(!held||mode!=='minimized'))drawOrb(now)")
  })

  it('never holds a crossfade or under reduced motion', () => {
    expect(ambient).toContain('function lifeHeld(now){return !reduced.matches&&!sceneFrom&&')
  })

  it('starts once the library is ready and the returning desk has settled, or after 4 s', () => {
    expect(ambient).toContain("c.contains('library-ready')&&!c.contains('returning-pending')&&!c.contains('returning-scene-pending')")
    expect(ambient).toContain('performance.now()-since>4000')
  })

  it('holds only where the room cannot be seen', () => {
    const covered = ambient.slice(ambient.indexOf('function heroCovered'), ambient.indexOf('function lifeHeld'))
    for (const layer of ['searchOpen', "collectionChoice!=='home'", 'openingReader', 'leaving', "innerWidth<700&&mode!=='minimized'"]) expect(covered).toContain(layer)
    // The menu and an open book let the room show through: it keeps moving behind them.
    for (const layer of ['menuOpen', 'activeBook']) expect(covered).not.toContain(layer)
  })
})
