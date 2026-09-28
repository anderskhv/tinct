// A visit survives reader navigation and reloads, but expires after a long
// absence. Only presentation lives here: never positions or account data.
const KEY='tinct:library-2-visit',MAX_IDLE=4*60*60*1000;
export function readVisit(now=Date.now()) {try{const v=JSON.parse(sessionStorage.getItem(KEY)||'null');return v&&now-v.at<MAX_IDLE?v:null;}catch{return null;}}
export function rememberVisit(patch) {const v={...readVisit(),...patch,at:Date.now()};try{sessionStorage.setItem(KEY,JSON.stringify(v));}catch{}return v;}
export function visitMode(returning,override) {if(override)return override;return readVisit()?.mode||(returning?'shelf':'discovery');}
