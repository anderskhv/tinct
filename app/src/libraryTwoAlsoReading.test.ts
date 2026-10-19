// @vitest-environment jsdom
/**
 * Also reading (desktop, 20 Oct 2026): beside Continue, the most recent book of the other kind
 * (a Tinct book vs the reader's own document), one tap away. Phones show nothing new.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

// The page's data engine is not needed to draw a given table.
vi.mock('../public/lab/library_2/catalogue.js?v=20261014talkwake', () => ({ readingApi: async () => ({}), loadCatalogueData: async () => ({ books: [] }) }))

const row = (bookId: string, extra: Record<string, unknown> = {}) => ({ bookId, title: bookId, author: '', cover: `/lab/library_2/assets/${bookId}.jpg`, tone: null, chapterLabel: 'Chapter 1', headline: '', percent: 10, recap: null, ...extra })
const OWN = 'userbook-' + 'a'.repeat(24)

// jsdom draws no images.
if (!HTMLImageElement.prototype.decode) HTMLImageElement.prototype.decode = () => Promise.resolve()

function setWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
  window.matchMedia = ((query: string) => ({ matches: width < 900 && query.includes('899px'), media: query, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
}

async function mount(reading: ReturnType<typeof row>[]) {
  // @ts-expect-error -- plain browser module of the library page
  const { createReadingTable } = await import('../public/lab/library_2/reading-table.js')
  const hero = document.createElement('div')
  document.body.append(hero)
  const onOpen = vi.fn(async () => {})
  createReadingTable(hero, { table: { mode: 'returning', reading, finished: [] }, onOpen, enabled: () => true, initial: null })
  await vi.waitFor(() => expect(hero.querySelector('#rt-also')).toBeTruthy())
  return { hero, onOpen, also: hero.querySelector('#rt-also') as HTMLAnchorElement }
}

afterEach(() => { document.body.innerHTML = '' })

describe('Also reading beside Continue', () => {
  it('desktop: a Tinct book names the newest own document, and one tap opens it', async () => {
    setWidth(1440)
    const { also, onOpen } = await mount([row('emma', { title: 'Emma' }), row('frankenstein'), row(OWN, { own: true, title: 'A Paper' }), row('userbook-' + 'b'.repeat(24), { own: true, title: 'Older' })])
    expect(also.hidden).toBe(false)
    expect(also.textContent).toBe('Also reading: A Paper')
    also.click()
    await vi.waitFor(() => expect(onOpen).toHaveBeenCalled())
    expect((onOpen.mock.calls[0] as unknown[])[0]).toBe(OWN)
  })

  it('desktop: an own document names the newest Tinct book', async () => {
    setWidth(1440)
    const { also } = await mount([row(OWN, { own: true, title: 'A Paper' }), row('to-the-lighthouse', { title: 'To the Lighthouse' })])
    expect(also.textContent).toBe('Also reading: To the Lighthouse')
  })

  it('nothing when every book is the same kind', async () => {
    setWidth(1440)
    const { also } = await mount([row('emma'), row('frankenstein')])
    expect(also.hidden).toBe(true)
    expect(also.textContent).toBe('')
  })

  it('phone: nothing new beside Continue', async () => {
    setWidth(390)
    const { also } = await mount([row('emma'), row(OWN, { own: true, title: 'A Paper' })])
    expect(also.hidden).toBe(true)
    expect(also.textContent).toBe('')
  })
})

describe('Continue on an own PDF read in its pages', () => {
  it('the desk lets Add a book’s viewer open (its URL is not the reader’s)', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const shelf = readFileSync(resolve(__dirname, '../public/lab/library_2/bookshelf.js'), 'utf8')
    expect(shelf).toContain("!href.startsWith('/lab/addbook/?userBook=')")
  })
})
