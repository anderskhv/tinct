// @vitest-environment jsdom
import {afterEach,expect,test} from 'vitest'
import {readEinkProfile,setEinkProfile} from '../../public/lab/display-profile.js'
afterEach(()=>{setEinkProfile(false);localStorage.clear();history.replaceState(null,'','/')})
test('explicit e-ink choice persists and can be reversed after a query link',()=>{
 history.replaceState(null,'','/?eink=1')
 expect(readEinkProfile()).toBe(true)
 setEinkProfile(false)
 expect(readEinkProfile()).toBe(false)
 expect(document.documentElement.hasAttribute('data-eink')).toBe(false)
 setEinkProfile(true)
 expect(readEinkProfile()).toBe(true)
 expect(document.documentElement.dataset.eink).toBe('true')
 expect(localStorage.getItem('tinct:display-profile')).toBe('eink')
})
test('a normal Android browser is not automatically made e-ink',()=>{
 expect(readEinkProfile()).toBe(false)
})
