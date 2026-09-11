const {webkit,chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path')
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:5191',dir=process.env.ARTIFACT_DIR||'/tmp/tinct-chapter-chat-edges';fs.mkdirSync(dir,{recursive:true})
async function main(){const results=[];for(const [desktop,chapter] of [[false,779],[false,1189],[true,779],[true,1189]]){const b=await(desktop?chromium:webkit).launch();try{
 const p=await b.newPage({viewport:desktop?{width:1440,height:950}:{width:360,height:640},isMobile:!desktop,hasTouch:!desktop});const requests=[]; p.setDefaultTimeout(15000);p.on('pageerror',e=>console.error(e.message))
 await p.route('**/api/{chat,lab-chat}',async route=>{requests.push(route.request().postDataJSON());await route.fulfill({contentType:'application/json',body:JSON.stringify({content:[{text:'The chapter closes with its final invitation and blessing.'}]})})})
 await p.addInitScript(chapter=>{sessionStorage.setItem('tinct:lab-reader-handoff',JSON.stringify({kind:'open-reader',bookId:'bible',primaryEditionKey:'kjv-en',compareEditionKey:'web-en',savedPlace:{bookId:'bible',chapterNumber:chapter,paragraphIndex:0,page:0}}))},chapter)
 await p.goto(origin+'/lab/phone'); // Requirement: verify the production phone entry point too.
 if(!desktop) { await p.getByTestId('lab-book').waitFor(); await p.screenshot({path:path.join(dir,'lab-phone-entry.png')}) }
 await p.goto(origin+'/reader')
 await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.readerReady==='true');await p.waitForTimeout(700)
 if(chapter===779){await p.getByTestId('lab-super').click();await p.getByTestId('lab-super-row-compare').click();await p.waitForTimeout(500)}
 for(let i=0;i<60&&await p.getByTestId('lab-chapter-end').count()===0;i++){await p.keyboard.press('ArrowRight');await p.waitForTimeout(100)}
 await p.waitForTimeout(1000)
 for(let i=0;i<10&&await p.getByTestId('lab-chapter-end').count()===0;i++){await p.keyboard.press('ArrowRight');await p.waitForTimeout(500)}
 const root=p.getByTestId('lab-root');const place=await root.getAttribute('data-place')
 assert.equal(await root.getAttribute('data-chapter'),String(chapter),'Still in the requested chapter')
 if (!await p.getByRole('button',{name:'Recap this chapter'}).isVisible()) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(150) }
 assert.equal(await p.getByRole('button',{name:'Prepare for the next chapter'}).count(),chapter===1189?0:1)
 assert.equal(await p.getByRole('button',{name:'Continue to next chapter'}).count(),chapter===1189?0:1)
 await p.getByRole('button',{name:'Recap this chapter'}).scrollIntoViewIfNeeded()
 assert.equal(requests.length,0)
 await p.screenshot({path:path.join(dir,(desktop?'desktop':'phone')+'-'+chapter+'-end.png')})
 // Actual audiobook can be started at the final page; opening Chat pauses it.
 if(chapter===1189 && !process.env.SKIP_AUDIO_VERIFY){await p.getByTestId('lab-v2-play').click()
 await p.waitForFunction(()=>document.querySelector('.lab')?.dataset.playing==='true',{}, {timeout:20000})}
 await p.getByRole('button',{name:'Recap this chapter'}).click()
 await p.getByTestId('lab-ask-turn-assistant').waitFor()
 assert.equal(requests.length,1);assert.equal(requests[0].book.chapterNumber,chapter)
 assert.equal(requests[0].book.editionKey,desktop||chapter===1189?'kjv-en':'web-en')
 assert.match(requests[0].system,/never a whole-book retrospective/)
 assert.equal(await root.getAttribute('data-playing'),'false')
 await (desktop?p.getByTestId('lab-desktop-companion-close'):p.getByTestId('lab-ask-done')).click();await p.waitForTimeout(250)
 assert.equal(await root.getAttribute('data-chapter'),String(chapter))
 // Audio can move within the page before the click; actions must not advance chapter.
 await p.screenshot({path:path.join(dir,(desktop?'desktop':'phone')+'-'+chapter+'-return.png')})
 results.push({desktop,requestedChapter:chapter,place,chapter:await root.getAttribute('data-chapter'),edition:requests[0].book.editionKey,playingAfterChat:await root.getAttribute('data-playing')})
 }finally{await b.close()}}
fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2))}
main().catch(e=>{console.error(e);process.exitCode=1})
