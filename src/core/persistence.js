// Only application preferences and explicitly supported scratch fields may cross this boundary.
export const STORAGE_KEY='seh-v1';
const SESSION_KEY='seh-session-only';
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const text=v=>typeof v==='string'?v:'';
const strings=v=>Object.fromEntries(Object.entries(object(v)?v:{}).filter(([k,v])=>!['__proto__','constructor','prototype'].includes(k)&&typeof v==='string').map(([k,v])=>[k,text(v)]));
export function sanitizeState(value,commands){
 const v=object(value)?value:{};
 const ids=new Set(commands.map(c=>c.id));
 const params=Object.fromEntries(commands.filter(c=>object(v.params?.[c.id])).map(c=>[c.id,Object.fromEntries(Object.keys(c.values).filter(k=>typeof v.params[c.id][k]==='string').map(k=>[k,v.params[c.id][k].slice(0,80)]))]));
 const zoningKeys=['vendor','host','array','mode','aHost','bHost','aTargets','bTargets','aCfg','bCfg','aVsan','bVsan'];
 return {theme:v.theme==='dark'?'dark':'light',favorites:[...new Set(Array.isArray(v.favorites)?v.favorites.filter(id=>ids.has(id)):[])],params,
 checks:Object.fromEntries(Object.entries(object(v.checks)?v.checks:{}).filter(([k,arr])=>!['__proto__','constructor','prototype'].includes(k)&&Array.isArray(arr)).map(([k,arr])=>[k,[...new Set(arr.filter(n=>Number.isInteger(n)&&n>=0&&n<1000))]])),
 notes:strings(v.notes),translation:strings(v.translation),
 upgradeInfo:Object.fromEntries(Object.entries(object(v.upgradeInfo)?v.upgradeInfo:{}).filter(([k])=>['netapp','powermax','pure','cisco','brocade','hpe'].includes(k)).map(([k,x])=>[k,strings(x)])),
 zoning:{...Object.fromEntries(zoningKeys.filter(k=>typeof v.zoning?.[k]==='string').map(k=>[k,text(v.zoning[k])])),enhanced:v.zoning?.enhanced===true}};
}
export function createPersistence(commands,{storage=()=>globalThis.localStorage,session=()=>globalThis.sessionStorage,onError=()=>{}}={}){
 let enabled=true;
 try{enabled=session().getItem(SESSION_KEY)!=='true';}catch{enabled=false;onError();}
 return {
 get enabled(){return enabled;},
 load(){try{return sanitizeState(enabled?JSON.parse(storage().getItem(STORAGE_KEY)||'{}'):{},commands);}catch{onError();return sanitizeState({},commands);}},
 save(state){if(!enabled)return false;try{storage().setItem(STORAGE_KEY,JSON.stringify(sanitizeState(state,commands)));return true;}catch{enabled=false;onError();return false;}},
 setEnabled(value){
  // Fail closed on removal failures; do not report that durable data was deleted.
  if(!value){enabled=false;try{storage().removeItem(STORAGE_KEY);session().setItem(SESSION_KEY,'true');return true;}catch{onError();return false;}}
  try{session().removeItem(SESSION_KEY);enabled=true;return true;}catch{onError();return false;}
 },
 clear(){try{storage().removeItem(STORAGE_KEY);return true;}catch{onError();return false;}}
 };
}
