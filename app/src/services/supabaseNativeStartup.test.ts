// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest'
const native=vi.hoisted(()=>({value:true}))
const install=vi.hoisted(()=>vi.fn(async()=>{}))
vi.mock('../utils/nativePlatform',()=>({isNativeCapacitor:()=>native.value}))
vi.mock('../utils/nativeAuth',()=>({installNativeAuth:install}))
vi.mock('@supabase/supabase-js',()=>({createClient:()=>({auth:{}})}))
afterEach(()=>{vi.resetModules();vi.unstubAllEnvs();vi.unstubAllGlobals();install.mockClear();native.value=true})
async function boot(pathname:string){
 vi.stubEnv('VITE_SUPABASE_URL','https://fixture.invalid')
 vi.stubEnv('VITE_SUPABASE_ANON_KEY','fixture')
 vi.stubGlobal('window',{location:{pathname}})
 await import('./supabase')
}
it('does not start a callback handler in the outgoing native root document',async()=>{
 await boot('/')
 expect(install).not.toHaveBeenCalled()
})
it.each(['/lab/library_2/index.html','/lab/sign-in/index.html','/reader'])('handles callbacks once the real native surface is loaded: %s',async path=>{
 await boot(path)
 expect(install).toHaveBeenCalledOnce()
})
it('leaves web authentication unchanged',async()=>{
 native.value=false
 await boot('/reader')
 expect(install).not.toHaveBeenCalled()
})
