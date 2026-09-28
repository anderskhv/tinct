import { expect, it } from 'vitest'
import { LIBRARY_TWO_DEFAULT, libraryEntryPath } from './libraryTwoRelease'
it('keeps public rollout off until explicit go',()=>{expect(LIBRARY_TWO_DEFAULT).toBe(false);expect(libraryEntryPath(null)).toBe('/lab/');expect(libraryEntryPath('tinct_auth=1')).toBe('/lab/')})
it('opts in only the exact private preview cookie',()=>{expect(libraryEntryPath('tinct_auth=1; tinct_library_preview=1; other=yes')).toBe('/lab/library_2/');for(const cookie of ['tinct_library_preview=0','other_tinct_library_preview=1','tinct_library_preview=10'])expect(libraryEntryPath(cookie)).toBe('/lab/')})
it('prepares the public switch and rollback without changing reader routes',()=>{expect(libraryEntryPath(null,true)).toBe('/lab/library_2/');expect(libraryEntryPath(null,false)).toBe('/lab/')})
