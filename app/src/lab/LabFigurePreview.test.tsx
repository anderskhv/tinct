// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { figureAtReference, LabFigurePreview } from './LabFigurePreview'
const figures = [{ id: 'f2', number: 2, src: '/figure.png', caption: 'Figure 2: The ship.' }]
afterEach(cleanup)
it('matches a named figure only at its reference, including abbreviated captions', () => {
  expect(figureAtReference('See Fig. 2 here', 5, figures)).toBe(figures[0])
  expect(figureAtReference('See Fig. 2 here', 9, figures)).toBe(figures[0])
  expect(figureAtReference('See Fig. 3 here', 9, figures)).toBeNull()
  expect(figureAtReference('2 other things', 0, figures)).toBeNull()
})
it('peeks at a reference without opening a card and clears on source scroll', () => {
  render(<div className="lab is-desktop"><p className="lab-hearing-line"><span data-testid="lab-word">Figure</span> <span data-testid="lab-word">2</span></p><LabFigurePreview figures={figures} enabled /></div>)
  fireEvent.pointerMove(screen.getAllByTestId('lab-word')[1], { pointerType: 'mouse' })
  expect(screen.getByRole('tooltip').textContent).toContain('The ship.')
  fireEvent.scroll(document)
  expect(screen.queryByRole('tooltip')).toBeNull()
})
it('leaves the phone unchanged', () => {
  render(<div className="lab is-desktop"><p className="lab-hearing-line"><span data-testid="lab-word">Figure</span> <span data-testid="lab-word">2</span></p><LabFigurePreview figures={figures} enabled={false} /></div>)
  fireEvent.pointerMove(screen.getAllByTestId('lab-word')[1], { pointerType: 'mouse' })
  expect(screen.queryByRole('tooltip')).toBeNull()
})
