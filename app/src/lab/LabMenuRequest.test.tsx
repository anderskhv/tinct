// @vitest-environment jsdom
/** The follow request on the t button and at the top of the t menu (Anders, 16 Nov 2026). */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LabSuperButton } from './LabSuperButton.tsx'
import { LabSuperMenu } from './LabSuperMenu.tsx'
import { LabMenuRequest } from './LabMenuRequest.tsx'
import { menuRequest } from '../social/followRequests'
import { useFollowRequests } from '../social/useFollowRequestDot'
import type { FindRow } from '../social/friendsClient'

const USER = '11111111-1111-4111-8111-111111111111'
const pic = (initial: string) => ({ src: null, pos: '50% 50%', cover: false, private: false, initial })
const anna: FindRow = { handle: 'anna', name: 'Anna Berg', link: 'tinct.app/@anna', picture: pic('A'), relation: 'followed', book: null }
const bo: FindRow = { handle: 'bo', name: 'Bo Lund', link: 'tinct.app/@bo', picture: pic('B'), relation: 'followed', book: null }
const settle = async () => { await act(async () => { for (let i = 0; i < 10; i++) await new Promise(resolve => setTimeout(resolve, 0)) }) }

afterEach(() => { cleanup(); vi.unstubAllGlobals(); document.head.innerHTML = '' })
beforeEach(() => localStorage.clear())

describe('the t button dot', () => {
  it('is an overlay inside the button, there only while due', () => {
    const { rerender } = render(<LabSuperButton open={false} onToggle={() => {}} />)
    expect(screen.queryByTestId('lab-super-dot')).toBeNull()
    expect(screen.getByTestId('lab-super').getAttribute('aria-label')).toBe('Menu')
    rerender(<LabSuperButton open={false} onToggle={() => {}} dot />)
    const dot = screen.getByTestId('lab-super-dot')
    expect(dot.parentElement).toBe(screen.getByTestId('lab-super'))
    expect(dot.classList.contains('tinct-request-dot')).toBe(true)
    expect(dot.getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByTestId('lab-super').getAttribute('aria-label')).toBe('Menu, follow request waiting')
  })
})

describe('the menu request row', () => {
  it('one request: names them with their picture and follows back in place', () => {
    const onFollowBack = vi.fn()
    const request = menuRequest([anna])!
    const row = (followBack: 'idle' | 'done') => <LabMenuRequest request={request} followBack={followBack} getToken={async () => 'tok'} onFollowBack={onFollowBack} onOpenRequests={() => {}} />
    const { rerender } = render(<LabSuperMenu open phone onSelect={() => {}} onClose={() => {}} request={row('idle')} />)
    expect(screen.getByTestId('lab-super-menu').firstElementChild).toBe(screen.getByTestId('lab-super-request'))
    expect(screen.getByTestId('lab-super-request-line').textContent).toBe('Anna Berg wants to follow you')
    expect(screen.getByTestId('lab-super-request-picture').textContent).toBe('A')
    fireEvent.click(screen.getByRole('button', { name: 'Follow back' }))
    expect(onFollowBack).toHaveBeenCalledTimes(1)
    rerender(<LabSuperMenu open phone onSelect={() => {}} onClose={() => {}} request={row('done')} />)
    const done = screen.getByTestId('lab-super-request-follow') as HTMLButtonElement
    expect(done.textContent).toBe('Friends')
    expect(done.disabled).toBe(true)
  })

  it('a refused follow back says so and offers it again', () => {
    render(<LabMenuRequest request={menuRequest([anna])!} followBack="failed" getToken={async () => null} onFollowBack={() => {}} onOpenRequests={() => {}} />)
    expect(screen.getByTestId('lab-super-request-follow').textContent).toBe('Follow back')
    expect(screen.getByTestId('lab-super-request-status').textContent).toBe('That did not work. Please try again.')
  })

  it('several requests: one row that opens Following you', () => {
    const onOpen = vi.fn()
    render(<LabMenuRequest request={menuRequest([anna, bo])!} followBack="idle" getToken={async () => 'tok'} onFollowBack={() => {}} onOpenRequests={onOpen} />)
    expect(screen.getByTestId('lab-super-request-line').textContent).toBe('Anna Berg and 1 other want to follow you')
    expect(screen.queryByTestId('lab-super-request-follow')).toBeNull()
    fireEvent.click(screen.getByTestId('lab-super-request'))
    expect(onOpen).toHaveBeenCalledTimes(1)
  })
})

describe('useFollowRequests', () => {
  function Probe() {
    const state = useFollowRequests(USER, async () => 'tok', 0)
    return <button type="button" data-testid="probe" data-due={String(state.due)} data-rows={state.rows.map(r => `${r.handle}:${r.relation}`).join(',')} onClick={() => state.settle('anna', 'friend')} />
  }
  it('reads Following you once, and a settled follow back clears the dot', async () => {
    document.head.innerHTML = '<meta name="tinct-social" content="1"><meta name="tinct-friends" content="1">'
    vi.stubGlobal('fetch', vi.fn(async (url: string) => String(url) === '/api/social/find?only=following-you' ? Response.json({ followingYou: [anna] }) : Response.json({}, { status: 404 })))
    render(<Probe />)
    await settle()
    const probe = screen.getByTestId('probe')
    expect(probe.dataset.due).toBe('true')
    expect(probe.dataset.rows).toBe('anna:followed')
    act(() => { fireEvent.click(probe) })
    expect(probe.dataset.due).toBe('false')
    expect(probe.dataset.rows).toBe('anna:friend')
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
