// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest'
import {registerReaderOffline} from './registerReaderOffline'
afterEach(()=>vi.unstubAllGlobals())
it('registers caching from a direct reader entry without reloading it',async()=>{
 const postMessage=vi.fn(),update=vi.fn().mockResolvedValue(undefined),register=vi.fn().mockResolvedValue({update,waiting:{postMessage}})
 vi.stubGlobal('navigator',{serviceWorker:{register}})
 expect(await registerReaderOffline(false)).toBe(true)
 expect(register).toHaveBeenCalledWith('/sw.js')
 expect(postMessage).toHaveBeenCalledWith({type:'SKIP_WAITING'})
 expect(update).toHaveBeenCalledOnce()
})
it('leaves native asset handling alone and tolerates blocked browser storage',async()=>{
 const register=vi.fn().mockRejectedValue(new Error('blocked'))
 vi.stubGlobal('navigator',{serviceWorker:{register}})
 expect(await registerReaderOffline(true)).toBe(false)
 expect(register).not.toHaveBeenCalled()
 expect(await registerReaderOffline(false)).toBe(false)
})
