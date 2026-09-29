// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest'
vi.mock('./nativePlatform',()=>({isNativeCapacitor:vi.fn(()=>true)}))
import {isNativeCapacitor} from './nativePlatform'
import {consumeNativeAuthNotice} from './nativeAuth'
import {NATIVE_AUTH_NOTICE} from './nativeAuthReturn'
afterEach(()=>{localStorage.clear();vi.mocked(isNativeCapacitor).mockReturnValue(true)})
it('keeps the failure notice through intermediate account-page initialization',()=>{
 localStorage.setItem(NATIVE_AUTH_NOTICE,'Sign-in could not be completed. Please try again.')
 expect(consumeNativeAuthNotice('?returnTo=%2Freader')).toBeNull()
 expect(localStorage.getItem(NATIVE_AUTH_NOTICE)).not.toBeNull()
 expect(consumeNativeAuthNotice('?native-error=1&returnTo=%2Freader')).toBe('Sign-in could not be completed. Please try again.')
 expect(localStorage.getItem(NATIVE_AUTH_NOTICE)).toBeNull()
})
it('the final error landing is still understandable if the notice was already consumed',()=>{
 expect(consumeNativeAuthNotice('?native-error=1')).toBe('Sign-in could not be completed. Please try again.')
 expect(consumeNativeAuthNotice('?native-return=1')).toBeNull()
})
it('web sign-in never consumes a native notice',()=>{
 localStorage.setItem(NATIVE_AUTH_NOTICE,'Native-only error')
 vi.mocked(isNativeCapacitor).mockReturnValue(false)
 expect(consumeNativeAuthNotice('?native-error=1')).toBeNull()
 expect(localStorage.getItem(NATIVE_AUTH_NOTICE)).toBe('Native-only error')
})
