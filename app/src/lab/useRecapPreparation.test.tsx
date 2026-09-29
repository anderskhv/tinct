// @vitest-environment jsdom
import {act,cleanup,renderHook} from '@testing-library/react'
import {afterEach,beforeEach,expect,it,vi} from 'vitest'
import {useRecapPreparation} from './useRecapPreparation'
const send=vi.hoisted(()=>vi.fn().mockResolvedValue(undefined))
vi.mock('../preReader/recapPreparationClient',()=>({sendRecapPreparation:send}))
beforeEach(()=>{vi.useFakeTimers();send.mockClear();Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'})})
afterEach(()=>{cleanup();vi.useRealTimers()})
it('renews long-session presence with a refreshed token and leaves at the latest paragraph',async()=>{
 const readToken=vi.fn().mockResolvedValueOnce('first-token').mockResolvedValue('refreshed-token')
 const request={bookId:'frankenstein',editionKey:'original-en',chapterNumber:3,paragraphIndex:0}
 const {rerender,unmount}=renderHook(({paragraphIndex})=>useRecapPreparation({userId:'reader',ready:true,request:{...request,paragraphIndex},readToken}),{initialProps:{paragraphIndex:0}})
 await act(async()=>{})
 expect(send.mock.calls[0][1]).toBe('first-token')
 rerender({paragraphIndex:9})
 await act(async()=>{await vi.advanceTimersByTimeAsync(30000)})
 expect(send.mock.lastCall[1]).toBe('refreshed-token')
 expect(send.mock.lastCall[0]).toMatchObject({active:true,request:{paragraphIndex:9}})
 unmount()
 expect(send.mock.lastCall[0]).toMatchObject({active:false,request:{paragraphIndex:9}})
 expect(send.mock.lastCall[1]).toBe('refreshed-token')
})
it('does not announce active presence when an old token lookup resolves after leaving',async()=>{
 let resolve!:(token:string)=>void
 const readToken=()=>new Promise<string>(done=>{resolve=done})
 const {unmount}=renderHook(()=>useRecapPreparation({userId:'reader',ready:true,request:{bookId:'frankenstein',editionKey:'original-en',chapterNumber:3,paragraphIndex:0},readToken}))
 unmount()
 await act(async()=>{resolve('late-token')})
 expect(send).not.toHaveBeenCalled()
})
