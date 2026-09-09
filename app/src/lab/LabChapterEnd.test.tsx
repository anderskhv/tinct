// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LabChapterEnd } from './LabChapterEnd'
afterEach(cleanup)
it('is optional UI with no automatic action, and offers only discussion at the book end', () => {
 const onDiscuss=vi.fn(),onPrepare=vi.fn()
 const {rerender}=render(<LabChapterEnd label="Canto XXXIII" hasNext={false} busy={false} onDiscuss={onDiscuss} onPrepare={onPrepare} />)
 expect(onDiscuss).not.toHaveBeenCalled();expect(onPrepare).not.toHaveBeenCalled()
 expect(screen.getByText('End of Canto XXXIII')).toBeTruthy()
 expect(screen.queryByRole('button',{name:/Prepare/})).toBeNull()
 fireEvent.click(screen.getByRole('button',{name:/Discuss/}));expect(onDiscuss).toHaveBeenCalledTimes(1)
 rerender(<LabChapterEnd label="Canto XXXII" hasNext busy onDiscuss={onDiscuss} onPrepare={onPrepare} />)
 fireEvent.click(screen.getByRole('button',{name:/Prepare/}));expect(onPrepare).not.toHaveBeenCalled()
 expect(screen.getAllByRole('button')).toHaveLength(2)
})
