import { _android as android } from 'playwright'
import {execFileSync} from 'node:child_process'
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
const output='artifacts/android',packageId='app.tinct.reader.review',activity=packageId+'/app.tinct.reader.MainActivity'
await fs.mkdir(output,{recursive:true})
execFileSync('adb',['install','-r','android/app/build/outputs/apk/debug/app-debug.apk'],{stdio:'inherit'})
execFileSync('adb',['shell','svc','wifi','disable'])
execFileSync('adb',['shell','svc','data','disable'])
const [device]=await android.devices()
assert(device,'Android emulator is connected')
device.setDefaultTimeout(60000)
let page
try {
 await device.shell('am start -n '+activity)
 page=await(await device.webView({pkg:packageId})).page()
 page.setDefaultTimeout(60000)
 await page.locator('#hero-book canvas[data-painted="true"]').waitFor()
 assert.equal(await page.evaluate(()=>window.Capacitor?.isNativePlatform()),true)
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
 const cover=await page.locator('#hero-book canvas').evaluate(c=>{
  const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,colors=new Set()
  for(let i=0;i<d.length;i+=Math.max(4,Math.floor(d.length/4096/4)*4))colors.add([d[i],d[i+1],d[i+2],d[i+3]].join(','))
  return {width:c.width,height:c.height,colors:colors.size,style:{display:getComputedStyle(c).display,visibility:getComputedStyle(c).visibility,opacity:getComputedStyle(c).opacity},parentFilter:getComputedStyle(c.parentElement).filter}
 })
 await fs.writeFile(output+'/native-cover-diagnostics.json',JSON.stringify(cover,null,2))
 assert(cover.colors>32,'offline cover contains painted image detail')
 await page.waitForTimeout(500)
 await page.screenshot({path:output+'/native-offline-library.png'})
 await device.screenshot({path:output+'/native-offline-library-device.png'})
 await page.locator('#read-featured').click()
 await page.locator('#book-overlay').waitFor()
 if(await page.locator('#slip-next').isVisible())await page.locator('#slip-next').click()
 await page.locator('#begin-reading').click()
 await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:60000})
 assert.match(await page.getByTestId('lab-root').innerText(),/Frankenstein/)
 await page.evaluate(()=>{
  localStorage.setItem('tinct-lab-prefs',JSON.stringify({theme:'book',fontFamily:'garamond',fontSize:1.3,compareOpen:false}))
  sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'frankenstein',primaryEditionKey:'original-en',savedPlace:{bookId:'frankenstein',chapterNumber:3,paragraphIndex:0,wordIndex:0,page:0}}))
  location.href='/reader?eink=1'
 })
 await page.waitForFunction(()=>document.querySelector('[data-testid="lab-root"]')?.dataset.readerReady==='true',null,{timeout:60000})
 await page.evaluate(()=>document.fonts.ready)
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.eink),'true')
 if(await page.getByTestId('lab-chapter-cover').isVisible())await page.keyboard.press('ArrowRight')
 const before=await page.getByTestId('lab-root').getAttribute('data-place')
 const started=Date.now()
 await device.shell('input keyevent 93')
 await page.waitForFunction(before=>document.querySelector('[data-testid="lab-root"]')?.getAttribute('data-place')!==before,before)
 const turnMs=Date.now()-started
 await page.screenshot({path:output+'/native-offline-reader.png'})
 await page.waitForTimeout(1500)
 const stored=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>/position|prefs|eink/.test(key))))
 await device.shell('am force-stop '+packageId)
 await device.shell('am start -n '+activity)
 page=await(await device.webView({pkg:packageId})).page()
 await page.locator('#hero-book canvas[data-painted="true"]').waitFor()
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.eink),'true','e-ink mode survives restart into the library')
 const metaInk=await page.locator('.rt-meta').evaluate(n=>getComputedStyle(n).color)
 assert.equal(metaInk,'rgb(51, 51, 51)','returning-library metadata has dark e-ink contrast')
 await page.screenshot({path:output+'/native-offline-library-restored.png'})
 const restored=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>/position|prefs|eink/.test(key))))
 assert.deepEqual(restored,stored,'force-close retains local reading anchors and settings')
 await fs.writeFile(output+'/native-results.json',JSON.stringify({device:device.model(),packageId,androidEmulator:true,physicalEink:false,offlineLibrary:true,offlineCovers:true,libraryReadFlow:true,restoredEinkLibrary:true,offlineReading:true,hardwarePageKey:true,pageTurnMs:turnMs,forceClosePersistence:true},null,2))
} catch(error) {
 await device.screenshot({path:output+'/native-failure.png'}).catch(()=>{})
 await fs.writeFile(output+'/native-failure.txt',String(error)+'\n'+(page?await page.locator('body').innerText().catch(()=> 'unavailable'):'no webview'))
 throw error
} finally {
 await fs.writeFile(output+'/native-logcat.txt',execFileSync('adb',['logcat','-d','-t','500']).toString())
 await device.close()
}
