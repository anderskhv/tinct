// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
// @ts-expect-error -- plain .mjs test helper shared with the Add-a-book e2e tests
import { bmp, gif, jpeg, png, tiff, webp } from '../../../../addbooks/web/test/make-epub.mjs'
import { declarePrefixes, imageSize, pictureType, preparePicture, sniffImageType, standaloneSvg } from './epubPictures'

const bytes = (value: Uint8Array) => new Uint8Array(value)

describe('a book’s picture files', () => {
  it('are typed by their bytes, whatever the manifest says', () => {
    expect(sniffImageType(bytes(png(120, 80)))).toBe('image/png')
    expect(sniffImageType(bytes(jpeg()))).toBe('image/jpeg')
    expect(sniffImageType(bytes(gif(120, 80)))).toBe('image/gif')
    expect(sniffImageType(bytes(webp()))).toBe('image/webp')
    expect(sniffImageType(bytes(bmp(120, 80)))).toBe('image/bmp')
    expect(sniffImageType(bytes(tiff(120, 80)))).toBe('image/tiff')
    expect(sniffImageType(new TextEncoder().encode('﻿<?xml version="1.0"?>\n<!DOCTYPE svg><svg xmlns="http://www.w3.org/2000/svg"/>'))).toBe('image/svg+xml')
    // A PNG declared as a JPEG is a PNG; an SVG declared image/jpeg (or image/svg) is an SVG.
    expect(pictureType(bytes(png(120, 80)), 'image/jpeg', 'x.jpg')).toBe('image/png')
    expect(pictureType(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), 'image/jpeg', 'x.jpg')).toBe('image/svg+xml')
    // Unrecognised bytes: the declared type (normalised), else the extension.
    expect(pictureType(new Uint8Array([1, 2, 3, 4]), 'image/jpg', 'x')).toBe('image/jpeg')
    expect(pictureType(new Uint8Array([1, 2, 3, 4]), '', 'Images/Plate.TIF')).toBe('image/tiff')
  })

  it('give their pixel size from their headers, BMP and TIFF too', () => {
    expect(imageSize(bytes(bmp(240, 150)), 'image/bmp')).toEqual({ width: 240, height: 150 })
    expect(imageSize(bytes(tiff(240, 150)), 'image/tiff')).toEqual({ width: 240, height: 150 })
    expect(imageSize(bytes(gif(240, 150)), 'image/gif')).toEqual({ width: 240, height: 150 })
    expect(imageSize(bytes(jpeg()), 'image/jpeg')).toEqual({ width: 240, height: 150 })
    expect(imageSize(bytes(webp()), 'image/webp')).toEqual({ width: 240, height: 150 })
  })
})

describe('an SVG picture', () => {
  const parses = (svg: string) => new DOMParser().parseFromString(svg, 'image/svg+xml').getElementsByTagName('parsererror').length === 0

  it('that is well-formed is kept as written', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>'
    expect(standaloneSvg(svg)).toBe(svg)
  })

  it('with undeclared prefixes, HTML entities or no namespace is repaired to draw on its own', () => {
    const repaired = standaloneSvg('<?xml version="1.0"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "x" [<!ENTITY ns "y">]><svg width="300" height="200" inkscape:label="a" sodipodi:docname="b"><text>A&nbsp;B</text><script>alert(1)</script><rect onclick="x()" width="10" height="10"/></svg>')
    expect(repaired).not.toBeNull()
    expect(parses(repaired!)).toBe(true)
    expect(repaired).toMatch(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
    expect(repaired).toMatch(/xmlns:inkscape=/)
    expect(repaired).not.toMatch(/<script|onclick|&nbsp;/)
  })

  it('declares what an element serialised from an HTML page leaves undeclared', () => {
    const out = declarePrefixes('<svg width="1" height="1"><use xlink:href="#a"/></svg>')
    expect(out).toMatch(/xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)
    expect(parses(out)).toBe(true)
  })

  it('that is not an SVG at all cannot be drawn', async () => {
    expect(standaloneSvg('<html><body>no drawing</body></html>')).toBeNull()
    expect(await preparePicture(new TextEncoder().encode('<p>not svg'), 'image/svg+xml')).toBeNull()
  })
})
