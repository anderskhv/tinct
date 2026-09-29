import fs from 'node:fs/promises'

/** Diagnose emulator audio setup without playing anything. */
export async function prepareSilentEmulator(device,output){
 const results=[]
 for(const command of [
  'cmd media_session volume --stream 3 --set 0 --get',
  'cmd audio help',
  'cmd audio set-volume 3 0',
  'cmd media_session volume --stream 3 --get',
 ]){
  results.push({command,result:String(await device.shell(command))})
  await new Promise(resolve=>setTimeout(resolve,300))
 }
 const audio=String(await device.shell('dumpsys audio'))
 const log=String(await device.shell('logcat -d -t 500'))
 const diagnostics={commands:results,audio,volumeMessages:log.split('\n').filter(line=>/AudioService|Error noting op|package.*uid|VolumeCtrl|HardeningEnforcer/.test(line))}
 await fs.writeFile(output+'/emulator-audio-setup.json',JSON.stringify(diagnostics,null,2))
 console.log(JSON.stringify({emulatorAudioSetup:{commands:results,volumeMessages:diagnostics.volumeMessages,audio:audio.slice(0,14000)}}))
}
