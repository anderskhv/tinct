// @vitest-environment jsdom

import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useLabObservability, type LabObservabilityInput } from './useLabObservability'

const { trackPageview, trackEvent } = vi.hoisted(() => ({
  trackPageview: vi.fn(),
  trackEvent: vi.fn(),
}))

vi.mock('../utils/analytics', () => ({ trackPageview, trackEvent }))

const base: LabObservabilityInput = {
  pathname: '/lab/phone',
  layout: 'phone',
  bookId: 'bible',
  chapterNumber: 1,
  pageIndex: 0,
  settledPageIndex: 0,
  totalPages: 3,
  listening: false,
  voiceActive: false,
  voicePhase: 'idle',
  turnCount: 0,
}

function Harness(props: LabObservabilityInput) {
  useLabObservability(props)
  return null
}

describe('lab observability', () => {
  it('tracks open, settled page, and state transitions without reader callbacks', () => {
    const view = render(<Harness {...base} />)
    expect(trackPageview).toHaveBeenCalledWith('/lab/phone/bible/1')
    expect(trackEvent).toHaveBeenCalledWith('lab_reader_opened', expect.objectContaining({ book_id: 'bible' }))
    expect(trackEvent).toHaveBeenCalledWith('lab_page_settled', expect.objectContaining({ page: 1, total_pages: 3 }))

    view.rerender(<Harness {...base} listening voiceActive voicePhase="listening" turnCount={1} />)
    expect(trackEvent).toHaveBeenCalledWith('lab_listen_started', expect.any(Object))
    expect(trackEvent).toHaveBeenCalledWith('lab_voice_started', expect.objectContaining({ phase: 'listening' }))
    expect(trackEvent).toHaveBeenCalledWith('lab_ask_turn_completed', expect.objectContaining({ turn_count: 1 }))
  })
})
