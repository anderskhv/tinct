import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const root='/Users/andershvelplund/Documents/Tinct-Danish-Handoff/recovery-worker-a';
const base='/Users/andershvelplund/Developer/Tinct';
const calls=JSON.parse(fs.readFileSync(root+'/ethics-exec-evidence.json'));
const memory=new Map(), reports=[],shell=[],logs=[];
let current;
const tool=async(name,args)=>{
 if(name==='mcp__codex_apps__github_fetch_file'){
  if(!args.path.startsWith('app/public/data/'))throw Error('unpermitted base read');
  const b=fs.readFileSync(base+'/'+args.path);const sha=crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');
  return {structuredContent:{content:b.toString(),sha}};
 }
 if(name==='exec_command'){shell.push({index:current,args});return {output:'',exit_code:0};}
 return {content:[],structuredContent:{}};
};
const ctx=vm.createContext({structuredClone,ALL_TOOLS:[],image:()=>{},load:k=>structuredClone(memory.get(k)),store:(k,v)=>memory.set(k,structuredClone(v)),text:v=>logs.push({index:current,value:v}),tools:new Proxy({}, {get:(_,name)=>args=>tool(name,args)})});
for(let i=265;i<440;i++){
 current=i;
 try {await vm.runInContext('(async()=>{'+calls[i].input+'})()',ctx,{timeout:1500});reports.push({index:i,line:calls[i].line,status:'replayed-no-shell'});}
 catch(e){reports.push({index:i,line:calls[i].line,status:'error',error:String(e)});}
}
for(const [k,v]of memory){if(typeof v==='object')fs.writeFileSync(root+'/'+k.replaceAll('/','_')+'.json',JSON.stringify(v,null,2)+'\n');}
fs.writeFileSync(root+'/replay-report.json',JSON.stringify(reports,null,2));
fs.writeFileSync(root+'/skipped-shell.json',JSON.stringify(shell,null,2));
fs.writeFileSync(root+'/replay-log.json',JSON.stringify(logs,null,2));
console.log(JSON.stringify({objects:memory.size,errors:reports.filter(x=>x.status==='error'),shellSkipped:shell.length},null,2));
