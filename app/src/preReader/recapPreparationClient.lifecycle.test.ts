// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
vi.mock('../lab/labAuth',()=>({readSupabaseAccessToken:async()=> 'test-token'}))
const fetcher=vi.fn()
beforeEach(()=>{vi.resetModules();fetcher.mockReset();fetcher.mockResolvedValue({ok:true,json:async()=>({summaries:[]})});vi.stubGlobal('fetch',fetcher)})
afterEach(()=>{window.dispatchEvent(new Event('pageshow'));vi.unstubAllGlobals()})
it('does not start optional shelf preparation after departure, and resumes on pageshow',async()=>{
 const {prepareShelfRecaps}=await import('./recapPreparationClient')
 window.dispatchEvent(new Event('beforeunload'))
 await prepareShelfRecaps([],'test-token')
 expect(fetcher).not.toHaveBeenCalled()
 window.dispatchEvent(new Event('pageshow'))
 await prepareShelfRecaps([],'test-token')
 expect(fetcher).toHaveBeenCalledTimes(1)
})
it('still sends the reader presence flush on departure',async()=>{
 const {sendRecapPreparation}=await import('./recapPreparationClient')
 window.dispatchEvent(new Event('beforeunload'))
 const update={kind:'presence' as const,clientId:'test-client',sequence:1,active:false,request:{bookId:'frankenstein',editionKey:'original-en',chapterNumber:1,paragraphIndex:0}}
 await sendRecapPreparation(update,'test-token',true)
 expect(fetcher).toHaveBeenCalledWith(expect.any(String),expect.objectContaining({keepalive:true,body:JSON.stringify(update)}))
})
