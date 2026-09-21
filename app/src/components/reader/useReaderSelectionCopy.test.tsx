// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useReaderSelectionCopy } from './useReaderSelectionCopy'
function Sample({text='Selected passage'}:{text?:string}) { useReaderSelectionCopy(text); return <><input aria-label="Note" /><p>Panel content</p></> }
afterEach(() => { cleanup(); window.getSelection()?.removeAllRanges(); vi.restoreAllMocks() })
describe('reader selection copy', () => {
  it.each(['ctrlKey','metaKey'])('copies the custom selection with %s+C', async key => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText}})
    render(<Sample />)
    fireEvent.keyDown(document.body,{key:'c',[key]:true})
    expect(writeText).toHaveBeenCalledExactlyOnceWith('Selected passage')
  })
  it('supplies plain text to browser Copy and stops after unmount', () => {
    const {unmount} = render(<Sample />)
    const setData = vi.fn(), event = new Event('copy',{bubbles:true,cancelable:true})
    Object.defineProperty(event,'clipboardData',{value:{setData}})
    document.dispatchEvent(event)
    expect(setData).toHaveBeenCalledWith('text/plain','Selected passage')
    expect(event.defaultPrevented).toBe(true)
    unmount(); setData.mockClear(); document.dispatchEvent(event)
    expect(setData).not.toHaveBeenCalled()
  })
  it('lets editable fields and native panel selections copy their own content', () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText}})
    const {container} = render(<Sample />)
    fireEvent.keyDown(container.querySelector('input')!,{key:'c',metaKey:true})
    const range=document.createRange(); range.selectNodeContents(container.querySelector('p')!)
    window.getSelection()?.addRange(range)
    fireEvent.keyDown(document.body,{key:'c',ctrlKey:true})
    expect(writeText).not.toHaveBeenCalled()
  })
})
