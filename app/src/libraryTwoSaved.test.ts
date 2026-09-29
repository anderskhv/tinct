// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
const mock = vi.hoisted(() => ({ user: null as string | null, rows: [] as unknown[], rpc: vi.fn(), read: vi.fn() }))
vi.mock('./services/supabase', () => ({ supabase: {
 auth: { getSession: async () => ({data:{session:mock.user?{user:{id:mock.user}}:null}}), onAuthStateChange: vi.fn() },
 from: () => ({select:()=>({eq:()=>({like:mock.read})})}), rpc:mock.rpc,
}}))
beforeEach(()=>{localStorage.clear();vi.resetModules();mock.user=null;mock.rows=[];mock.read.mockImplementation(async()=>({data:mock.rows,error:null}));mock.rpc.mockReset();})
afterEach(()=>vi.unstubAllGlobals())
it('preserves guest saves across reloads, including removal of a migrated legacy book',async()=>{
 localStorage.setItem('tinct-library-2-to-read','["hamlet"]');
 let api=await import('./libraryTwoSaved');expect((await api.loadSavedBooks()).ids).toEqual(['hamlet']);
 await api.setSavedBook('hamlet',false);await api.setSavedBook('frankenstein',true);
 vi.resetModules();api=await import('./libraryTwoSaved');expect((await api.loadSavedBooks()).ids).toEqual(['frankenstein']);expect(mock.rpc).not.toHaveBeenCalled();
})
it('isolates account shelves from the guest and other accounts',async()=>{
 localStorage.setItem('tinct-library-2-to-read','["hamlet"]');mock.user='alice';
 let api=await import('./libraryTwoSaved');expect((await api.loadSavedBooks()).ids).toEqual([]);
 mock.rpc.mockResolvedValue({data:[{applied:true,rev:1}],error:null});await api.setSavedBook('frankenstein',true);
 vi.resetModules();mock.user='bob';api=await import('./libraryTwoSaved');expect((await api.loadSavedBooks()).ids).toEqual([]);
 vi.resetModules();mock.user=null;api=await import('./libraryTwoSaved');expect((await api.loadSavedBooks()).ids).toEqual(['hamlet']);
})
it('uses revision-checked tombstones and retains offline actions for reconnect',async()=>{
 mock.user='alice';mock.rows=[{key:'library-shelf:hamlet',value:{saved:true,at:1},rev:7}];
 const api=await import('./libraryTwoSaved');expect((await api.loadSavedBooks()).ids).toEqual(['hamlet']);
 mock.read.mockResolvedValueOnce({data:null,error:{message:'offline'}});expect(await api.setSavedBook('hamlet',false)).toEqual({ids:[],synced:false});
 mock.rpc.mockResolvedValueOnce({data:[{applied:false,conflict:true,rev:8}],error:null}).mockResolvedValueOnce({data:[{applied:true,rev:9}],error:null});
 expect(await api.loadSavedBooks()).toEqual({ids:[],synced:true});
 expect(mock.rpc.mock.calls.map(c=>c[1])).toEqual([{p_user_id:'alice',p_key:'library-shelf:hamlet',p_value:null,p_expected_rev:7},{p_user_id:'alice',p_key:'library-shelf:hamlet',p_value:null,p_expected_rev:8}]);
})
it('honours deletion from another device without resurrecting cached saves',async()=>{
 mock.user='alice';mock.rows=[{key:'library-shelf:hamlet',value:{saved:true,at:1},rev:7}];const api=await import('./libraryTwoSaved');await api.loadSavedBooks();
 mock.rows=[{key:'library-shelf:hamlet',value:null,rev:8}];expect((await api.loadSavedBooks()).ids).toEqual([]);expect(mock.rpc).not.toHaveBeenCalled();
})
it('never writes reading state keys',async()=>{const api=await import('./libraryTwoSaved');await api.setSavedBook('hamlet',true);expect(Object.keys(localStorage)).toEqual(['tinct:library-2-saved:guest']);})
it('keeps this visit usable when device storage is full',async()=>{
 const api=await import('./libraryTwoSaved');const write=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota')});
 try{await api.setSavedBook('hamlet',true);expect((await api.loadSavedBooks()).ids).toEqual(['hamlet']);await api.setSavedBook('hamlet',false);expect((await api.loadSavedBooks()).ids).toEqual([]);}finally{write.mockRestore();}
})
it('persists rapid clicks during a stalled cloud read and does not undo a newer toggle',async()=>{
 mock.user='alice';let release!: (value:unknown)=>void;
 mock.read.mockImplementationOnce(()=>new Promise(resolve=>release=resolve));
 mock.rpc.mockResolvedValue({data:[{applied:true,rev:1}],error:null});
 const api=await import('./libraryTwoSaved');const cached=vi.fn();const loading=api.loadSavedBooks({onCached:cached});
 await vi.waitFor(()=>expect(cached).toHaveBeenCalled());
 const one=api.setSavedBook('hamlet',true),two=api.setSavedBook('frankenstein',true),three=api.setSavedBook('hamlet',false);
 await vi.waitFor(()=>{const state=JSON.parse(localStorage.getItem('tinct:library-2-saved:alice')!);expect(state.items.frankenstein.saved).toBe(true);expect(state.items.hamlet.saved).toBe(false)});
 release({data:[],error:null});await Promise.all([loading,one,two,three]);
 expect((await api.loadSavedBooks()).ids).toEqual(['frankenstein']);
})

it('retains a table-hidden book and its visibility across devices and reloads',async()=>{
 mock.user='alice';mock.rpc.mockResolvedValue({data:[{applied:true,rev:1}],error:null});
 let api=await import('./libraryTwoSaved');
 await api.setSavedBook('hamlet',true,{tableHidden:true});
 expect(mock.rpc.mock.calls[0][1].p_value).toMatchObject({saved:true,tableHidden:true});
 mock.rows=[{key:'library-shelf:hamlet',value:{saved:true,at:10,tableHidden:true},rev:1}];
 vi.resetModules();api=await import('./libraryTwoSaved');
 expect((await api.loadSavedBooks()).ids).toEqual(['hamlet']);
 expect(await api.loadShelfMembership()).toEqual({removed:[],tableHidden:['hamlet']});
 mock.rows=[{key:'library-shelf:hamlet',value:null,rev:2}];
 expect(await api.loadShelfMembership()).toEqual({removed:['hamlet'],tableHidden:[]});
})
it('keeps an offline shelf removal explicit without deleting any reader data',async()=>{
 mock.user='alice';mock.read.mockResolvedValue({data:null,error:{message:'offline'}});
 localStorage.setItem('tinct-lab-position','saved-place');
 localStorage.setItem('tinct:highlights:hamlet','saved-highlights');
 let api=await import('./libraryTwoSaved');await api.setSavedBook('hamlet',false);
 vi.resetModules();api=await import('./libraryTwoSaved');
 expect(await api.loadShelfMembership()).toEqual({removed:['hamlet'],tableHidden:[]});
 expect(localStorage.getItem('tinct-lab-position')).toBe('saved-place');
 expect(localStorage.getItem('tinct:highlights:hamlet')).toBe('saved-highlights');
})

it('does not replace an acknowledged re-add with an older tombstone, even after reload',async()=>{
 mock.user='alice';mock.rows=[{key:'library-shelf:confessions',value:null,rev:7}]
 let api=await import('./libraryTwoSaved');await api.loadSavedBooks()
 mock.rpc.mockResolvedValue({data:[{applied:true,rev:8}],error:null})
 await api.setSavedBook('confessions',true)
 expect((await api.loadSavedBooks()).ids).toEqual(['confessions'])
 vi.resetModules();api=await import('./libraryTwoSaved')
 expect((await api.loadSavedBooks()).ids).toEqual(['confessions'])
 // A genuine later removal still removes it everywhere.
 mock.rows=[{key:'library-shelf:confessions',value:null,rev:9}]
 expect((await api.loadSavedBooks()).ids).toEqual([])
})
it('does not resurrect a removed book from an older saved row',async()=>{
 mock.user='alice';mock.rows=[{key:'library-shelf:confessions',value:{saved:true,at:10},rev:7}]
 const api=await import('./libraryTwoSaved');await api.loadSavedBooks()
 mock.rpc.mockResolvedValue({data:[{applied:true,rev:8}],error:null})
 await api.setSavedBook('confessions',false)
 expect((await api.loadSavedBooks()).ids).toEqual([])
})
it('does not replay an old offline removal over a later re-add on another device',async()=>{
 mock.user='alice'
 localStorage.setItem('tinct:library-2-saved:alice',JSON.stringify({items:{confessions:{saved:false,at:100}},pending:{confessions:{saved:false,at:100}},revisions:{confessions:7}}))
 mock.rows=[{key:'library-shelf:confessions',value:{saved:true,at:200},rev:9}]
 const api=await import('./libraryTwoSaved')
 expect(await api.loadSavedBooks()).toEqual({ids:['confessions'],synced:true})
 expect(mock.rpc).not.toHaveBeenCalled()
})
it('honours a later re-add returned by a concurrent write conflict instead of retrying the stale deletion',async()=>{
 mock.user='alice'
 localStorage.setItem('tinct:library-2-saved:alice',JSON.stringify({items:{confessions:{saved:false,at:100}},pending:{confessions:{saved:false,at:100}},revisions:{confessions:7}}))
 mock.rows=[{key:'library-shelf:confessions',value:{saved:true,at:50},rev:7}]
 mock.rpc.mockResolvedValue({data:[{applied:false,conflict:true,rev:8,value:{saved:true,at:200}}],error:null})
 const api=await import('./libraryTwoSaved')
 expect(await api.loadSavedBooks()).toEqual({ids:['confessions'],synced:true})
 expect(mock.rpc).toHaveBeenCalledOnce()
})
