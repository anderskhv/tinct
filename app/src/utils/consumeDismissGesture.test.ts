// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { consumeDismissGesture } from './consumeDismissGesture'
afterEach(()=>window.dispatchEvent(new Event('pointercancel')))
it('blocks the closing click after dismissal but lets the next gesture activate its target',()=>{
 const action=vi.fn(),button=document.createElement('button')
 document.body.append(button);button.addEventListener('click',action)
 const dismiss=(event:Event)=>consumeDismissGesture(event as PointerEvent)
 window.addEventListener('pointerdown',dismiss,{capture:true,once:true})
 button.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true,cancelable:true}))
 button.dispatchEvent(new MouseEvent('pointerup',{bubbles:true,cancelable:true}))
 button.click()
 expect(action).not.toHaveBeenCalled()
 button.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true,cancelable:true}))
 button.click()
 expect(action).toHaveBeenCalledOnce()
 button.remove()
})
it('an abandoned closing gesture does not swallow the next pointer sequence',()=>{
 const action=vi.fn(),button=document.createElement('button')
 document.body.append(button);button.addEventListener('click',action)
 consumeDismissGesture(new MouseEvent('pointerdown') as PointerEvent)
 button.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true,cancelable:true}))
 button.click()
 expect(action).toHaveBeenCalledOnce()
 button.remove()
})
