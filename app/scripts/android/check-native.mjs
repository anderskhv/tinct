import { _android as android } from 'playwright'
import {execFileSync} from 'node:child_process'
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
const output='artifacts/android'
await fs.mkdir(output,{recursive:true})
execFileSync('adb',['install','-r','android/app/build/outputs/apk/debug/app-debug.apk'],{stdio:'inherit'})
execFileSync('adb',['shell','svc','wifi','disable'])
execFileSync('adb',['shell','svc','data','disable'])
const [device]=await android.devices()
assert(device,'Android emulator is connected')
device.setDefaultTimeout(60000)
let page
try {
 await device.shell('am start -n app.tinct.reader/.MainActivity')
 page=await(await device.webView({pkg:'app.tinct.reader'})).page()
 page.setDefaultTimeout(60000)
 await page.locator('#hero-book canvas[data-painted="true"]').waitFor()
 assert.equal(await page.evaluate(()=>window.Capacitor?.isNativePlatform()),true)
 await page.screenshot({path:output+'/native-offline-library.png'})
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
 await device.shell('am force-stop app.tinct.reader')
 await device.shell('am start -n app.tinct.reader/.MainActivity')
 page=await(await device.webView({pkg:'app.tinct.reader'})).page()
 await page.locator('#hero-book canvas[data-painted="true"]').waitFor()
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.eink),'true','e-ink mode survives restart into the library')
 await page.screenshot({path:output+'/native-offline-library-restored.png'})
 const restored=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>/position|prefs|eink/.test(key))))
 assert.deepEqual(restored,stored,'force-close retains local reading anchors and settings')
 await fs.writeFile(output+'/native-results.json',JSON.stringify({device:device.model(),androidEmulator:true,physicalEink:false,offlineLibrary:true,offlineCovers:true,restoredEinkLibrary:true,offlineReading:true,hardwarePageKey:true,pageTurnMs:turnMs,forceClosePersistence:true},null,2))
} catch(error) {
 await device.screenshot({path:output+'/native-failure.png'}).catch(()=>{})
 await fs.writeFile(output+'/native-failure.txt',String(error)+'\n'+(page?await page.locator('body').innerText().catch(()=> 'unavailable'):'no webview'))
 throw error
} finally {
 await fs.writeFile(output+'/native-logcat.txt',execFileSync('adb',['logcat','-d','-t','500']).toString())
 await device.close()
}
