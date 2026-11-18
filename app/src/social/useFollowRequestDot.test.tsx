// @vitest-environment jsdom
/** The reader menu's Profile dot (Anders, 20 Oct 2026): asked for after the book, cleared once the requests were shown. */
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LabSuperMenu } from '../lab/LabSuperMenu.tsx'
import { useFollowRequestDot } from './useFollowRequestDot'
import { markRequestsSeen } from './followRequests'

const USER = '11111111-1111-4111-8111-111111111111'
const ellen = { handle: 'ellen', name: 'Ellen Ravn', link: 'tinct.app/@ellen', picture: { src: null, pos: '', cover: false, private: false, initial: 'E' }, relation: 'followed', book: null }

function Menu({ userId }: { userId: string | null }) {
  const dot = useFollowRequestDot(userId, async () => 'tok', 0)
  return <LabSuperMenu open phone profileDot={dot} onSelect={() => {}} onClose={() => {}} />
}

const settle = async () => { await act(async () => { for (let i = 0; i < 10; i++) await new Promise(resolve => setTimeout(resolve, 0)) }) }

beforeEach(() => {
  localStorage.clear()
  document.head.innerHTML = '<meta name="tinct-social" content="1"><meta name="tinct-friends" content="1">'
  vi.stubGlobal('fetch', vi.fn(async (url: string) => String(url) === '/api/social/find?only=following-you' ? Response.json({ followingYou: [ellen] }) : Response.json({}, { status: 404 })))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); document.head.innerHTML = '' })

describe('the Profile row dot', () => {
  it('shows on the Profile row only while a request is unseen, and goes once shown', async () => {
    render(<Menu userId={USER} />)
    await settle()
    const profile = screen.getByTestId('lab-super-row-account')
    expect(profile.querySelector('[data-testid="request-dot"]')).toBeTruthy()
    expect(document.querySelectorAll('[data-testid="request-dot"]').length).toBe(1)
    act(() => markRequestsSeen(USER, [ellen as never]))
    expect(document.querySelector('[data-testid="request-dot"]')).toBeNull()
  })

  it('asks nothing signed out or while Friends is off', async () => {
    render(<Menu userId={null} />)
    await settle()
    cleanup()
    document.head.innerHTML = ''
    render(<Menu userId={USER} />)
    await settle()
    expect(fetch).not.toHaveBeenCalled()
    expect(document.querySelector('[data-testid="request-dot"]')).toBeNull()
  })
})
