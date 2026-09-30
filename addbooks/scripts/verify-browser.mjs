// Optional QA dependency only; point PLAYWRIGHT_MODULE at an existing installation.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const base = process.env.ADDBOOKS_URL || 'http://127.0.0.1:4173';
const out = new URL('../qa/', import.meta.url);
await fs.mkdir(out,{recursive:true});
const browser = await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || undefined,args:['--mute-audio']});
const report = {viewports:[],queries:{},errors:[]};
let lastPage;
try {
  for (const [name,viewport] of [['desktop',{width:1440,height:1080}],['phone',{width:390,height:844}]]) {
    const context = await browser.newContext({viewport,deviceScaleFactor:1,serviceWorkers:'allow'});
    const page = await context.newPage(); lastPage = page;
    page.on('pageerror',error=>report.errors.push(error.message));
    const started=Date.now();
    await page.goto(base,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!document.querySelector('#query').disabled,null,{timeout:90000});
    await page.evaluate(()=>document.fonts.ready);
    const coldLoadMs=Date.now()-started;
    async function checkLayout(state) {
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${name} ${state}: overflow`);
      await page.screenshot({path:new URL(`${name}-${state}.png`,out).pathname,fullPage:false});
    }
    async function search(q) {
      await page.locator('#query').fill(q);
      await page.locator('#search-form').evaluate(el=>el.requestSubmit());
      await page.waitForFunction(()=>document.querySelector('.results-panel').getAttribute('aria-busy')==='false');
    }
    await checkLayout('empty');
    for(const q of ['Odyssey','dostoevsky','pride prejudice','meditations marcus']) {
      await search(q);
      const titles=await page.locator('.card h2').allTextContents();
      assert.ok(titles.length>0);
      report.queries[q]={top3:titles.slice(0,3),searchMs:Number(await page.locator('#status').getAttribute('data-search-ms'))};
    }
    await search('Odyssey');
    await page.locator('.cover img').first().waitFor({state:'attached'});
    await page.waitForFunction(()=>[...document.querySelectorAll('.cover img')].slice(0,4).every(i=>i.complete),{timeout:15000});
    await checkLayout('results');
    assert.ok(await page.locator('.badge.tinct').count()>0);
    assert.equal(await page.locator('.add').first().isDisabled(),true);
    await search('zzzxqvnonexistent');
    assert.equal(await page.locator('#no-results').isVisible(),true);
    await checkLayout('no-results');
    await page.locator('#clear-search').click();
    await page.locator('#standard-only').check();
    await page.locator('#subject').selectOption({label:'Fiction'});
    await page.waitForFunction(()=>document.querySelector('.results-panel').getAttribute('aria-busy')==='false');
    assert.ok(await page.locator('.card').count()>0);
    assert.ok((await page.locator('.badges .badge:first-child').allTextContents()).every(t=>t==='Standard Ebooks'));
    await checkLayout('filters');
    await page.locator('#reset').click();
    await page.locator('#language').selectOption('fr');
    await search('hugo');
    assert.ok(await page.locator('.card').count()>0);
    const metadata = await page.locator('.card-content').evaluateAll(cards=>cards.map(c=>c.querySelector('.metadata').textContent));
    assert.ok(metadata.length > 0 && metadata.every(t=>t.includes('French')));
    await page.locator('#reset').click();
    await search('prdie prejudice');
    assert.equal(await page.locator('.card h2').first().textContent(),'Pride and Prejudice');
    await page.waitForFunction(()=>document.querySelector('#offline-status').textContent === 'Available offline');
    await context.setOffline(true);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!document.querySelector('#query').disabled,null,{timeout:90000});
    await search('meditations marcus');
    assert.equal(await page.locator('.card h2').first().textContent(),'Meditations');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    report.viewports.push({name,viewport,coldLoadMs,offlineReload:true,noHorizontalOverflow:true});
    await context.close();
  }
  assert.deepEqual(report.errors,[]);
  await fs.writeFile(new URL('browser-report.json',out),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
} catch (error) {
  if (lastPage && !lastPage.isClosed()) {
    console.error(await lastPage.locator('body').innerText());
    console.error(await lastPage.evaluate(async()=>({keys:await caches.keys(),files:(await Promise.all((await caches.keys()).map(async k=>(await (await caches.open(k)).keys()).map(r=>r.url)))).flat()})));
    await lastPage.screenshot({path:new URL('../.cache/browser-failure.png',out).pathname});
  }
  throw error;
} finally {await browser.close();}
