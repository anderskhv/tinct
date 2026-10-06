import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * iPhone Safari zooms the page in when an input with a font size under 16px
 * takes focus, and does not zoom back out: the sign-up form ended up cut off
 * on the right (Anders, 2026-10-06). Every account surface must keep its
 * fields at 16px or more on a phone, and nothing may be wider than the
 * screen. Zoom itself stays allowed (no maximum-scale, no user-scalable=no).
 *
 * Run with `playwright.auth-phone.config.ts` (WebKit, 390×844, isMobile).
 * ARTIFACT_DIR=<dir> also saves a screenshot of each surface.
 */

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || ''

interface Surface {
  name: string
  path: string
  ready: string
  /**
   * Controls that only exist once the page is in use (the Add-a-book reader,
   * the signed-in bookshelf), added hidden so the page's own stylesheet can
   * be measured on them.
   */
  fixture?: string
}

const SURFACES: Surface[] = [
  { name: 'sign-in', path: '/sign-in', ready: '[data-auth-form]' },
  { name: 'create-account', path: '/sign-in?mode=create', ready: '[data-auth-form]' },
  { name: 'forgot-password', path: '/sign-in?mode=forgot', ready: '[data-auth-form]' },
  { name: 'reset-password', path: '/sign-in?mode=reset', ready: '[data-auth-form]' },
  {
    name: 'add-a-book',
    path: '/lab/addbook/index.html',
    ready: '#abQuery',
    fixture: '<div class="lab byob"><div class="lab-ask"><textarea class="lab-ask-input"></textarea></div><form class="byob-jump"><input inputmode="numeric"></form><div class="byob-row"><span class="seg"><select><option>1</option></select></span></div></div>',
  },
  {
    name: 'library',
    path: '/library',
    ready: 'body',
    fixture: '<div class="bookshelf"><input id="bs-find-book" type="search"></div>',
  },
]

/** Every text-entry control on the page, shown or not yet shown: a tap focuses it (and iOS would zoom). */
async function fieldFontSizes(page: Page): Promise<Array<{ field: string; px: number }>> {
  return page.evaluate(() => {
    const skip = new Set(['checkbox', 'radio', 'range', 'file', 'hidden', 'button', 'submit', 'reset', 'color', 'image'])
    return [...document.querySelectorAll<HTMLElement>('input, select, textarea')]
      .filter(node => !(node instanceof HTMLInputElement && skip.has(node.type)))
      .map(node => ({
        field: `${node.tagName.toLowerCase()}${node.getAttribute('name') ? `[name=${node.getAttribute('name')}]` : node.id ? `#${node.id}` : `.${node.className}`}`,
        px: parseFloat(getComputedStyle(node).fontSize),
      }))
  })
}

/** Page-level horizontal overflow, and any visible part of the form or page body that pokes past the screen edge. */
async function overflow(page: Page): Promise<{ scrollWidth: number; width: number; wide: string[] }> {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth
    const scope = document.querySelector('form') ?? document.querySelector('main') ?? document.body
    const wide = [...scope.querySelectorAll<HTMLElement>('*')]
      .filter(node => node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden')
      .filter(node => {
        // Content inside a sideways-scrolling strip is the strip's business, not the page's.
        for (let parent = node.parentElement; parent && parent !== scope; parent = parent.parentElement) {
          if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(parent).overflowX)) return false
        }
        const box = node.getBoundingClientRect()
        return box.width > 0 && (box.right > width + 0.5 || box.left < -0.5)
      })
      .map(node => `${node.tagName.toLowerCase()}.${String(node.className)}`)
    return { scrollWidth: document.documentElement.scrollWidth, width, wide }
  })
}

test.describe('account surfaces on a phone', () => {
  // The desktop look is unchanged by design; these checks are for a phone.
  test.beforeEach(({}, testInfo) => { test.skip(!testInfo.project.use.isMobile, 'phone-only check') })

  test('the viewport never forbids zooming', async ({ page }) => {
    for (const path of ['/sign-in', '/lab/addbook/index.html', '/library']) {
      await page.goto(path)
      const content = await page.locator('meta[name=viewport]').first().getAttribute('content')
      expect(content, path).not.toMatch(/maximum-scale|user-scalable\s*=\s*(no|0)/i)
    }
  })

  for (const surface of SURFACES) {
    test(`${surface.name}: fields are 16px or more and nothing is wider than the screen`, async ({ page }) => {
      await page.goto(surface.path)
      await expect(page.locator(surface.ready).first()).toBeVisible()
      await page.waitForTimeout(300)
      if (ARTIFACT_DIR) {
        mkdirSync(ARTIFACT_DIR, { recursive: true })
        await page.screenshot({ path: join(ARTIFACT_DIR, `${surface.name}.png`) })
      }

      const before = await overflow(page)
      expect(before.scrollWidth, `${surface.name} scrollWidth`).toBeLessThanOrEqual(before.width)
      expect(before.wide, `${surface.name} elements past the edge`).toEqual([])

      // Focusing the first visible field must not leave the page wider or zoomed.
      const first = page.locator('input:not([type=checkbox]):not([type=hidden]):not([type=file]):visible, textarea:visible').first()
      if (await first.count()) {
        await first.tap()
        await page.waitForTimeout(300)
        const after = await overflow(page)
        expect(after.scrollWidth, `${surface.name} scrollWidth after focus`).toBeLessThanOrEqual(after.width)
        expect(await page.evaluate(() => window.visualViewport?.scale ?? 1)).toBe(1)
      }

      if (surface.fixture) {
        await page.evaluate(html => {
          const holder = document.createElement('div')
          holder.setAttribute('aria-hidden', 'true')
          holder.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;visibility:hidden'
          holder.innerHTML = html
          document.body.append(holder)
        }, surface.fixture)
      }
      const fields = await fieldFontSizes(page)
      expect(fields.length).toBeGreaterThan(0)
      for (const field of fields) expect(field.px, `${surface.name} ${field.field}`).toBeGreaterThanOrEqual(16)
    })
  }
})
