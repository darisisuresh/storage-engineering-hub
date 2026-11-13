export const GEOMETRIES={legacy:{label:'DMX-3/4 & legacy VMAX',blocksPerTrack:128},modern:{label:'VMAX3 / VMAX All Flash / PowerMax',blocksPerTrack:256}};
export function convertStorageSize(value,unit,geometry){
 const g=GEOMETRIES[geometry];if(!g)throw new Error('Select a supported geometry preset.');
 const text=String(value).trim();if(!/^\d+(?:\.\d+)?$/.test(text))throw new Error('Enter a nonnegative number without exponent notation.');
 const n=Number(text);if(!Number.isFinite(n))throw new Error('Size is outside the supported range.');
 const trackBytes=g.blocksPerTrack*512,cylinderBytes=trackBytes*15;
 const units={cylinders:cylinderBytes,tracks:trackBytes,bytes:1,GB:1e9,GiB:2**30,TB:1e12,TiB:2**40};
 if(!Object.hasOwn(units,unit))throw new Error('Select a supported input unit.');
 if(['cylinders','tracks','bytes'].includes(unit)&&!Number.isSafeInteger(n))throw new Error('Cylinders, tracks and bytes require whole numbers.');
 const [whole,fraction='']=text.split('.');
 if(text.length>60)throw new Error('Use a size with at most 60 characters.');
 const numerator=BigInt(whole+fraction)*BigInt(units[unit]),denominator=10n**BigInt(fraction.length);
 if(numerator%denominator!==0n)throw new Error('The requested size is not a whole number of bytes; use fewer decimal places.');
 const bytes=Number(numerator/denominator);if(!Number.isFinite(bytes)||bytes>Number.MAX_SAFE_INTEGER)throw new Error('The requested size exceeds the calculator’s exact-integer byte range.');
 if(!Number.isSafeInteger(bytes))throw new Error('The requested size is not an exact whole number of bytes; use fewer decimal places.');
 const roundedCylinders=Math.ceil(bytes/cylinderBytes),roundedTracks=Math.ceil(bytes/trackBytes);
 if(!Number.isSafeInteger(roundedCylinders*cylinderBytes))throw new Error('Cylinder rounding exceeds the supported exact-byte range.');
 return {bytes,trackBytes,cylinderBytes,cylinders:bytes/cylinderBytes,tracks:bytes/trackBytes,roundedCylinders,roundedTracks,gb:bytes/1e9,gib:bytes/2**30,tb:bytes/1e12,tib:bytes/2**40,roundingBytes:roundedCylinders*cylinderBytes-bytes};
}
export function normalizeIdentifier(value){
 const raw=String(value).trim().replace(/^naa\./i,'').replace(/^0x/i,'').replace(/[\s:.\-]/g,'');
 if(!/^(?:[0-9a-f]{16}|[0-9a-f]{32})$/i.test(raw))throw new Error('Expected exactly 16 or 32 hexadecimal digits, optionally separated by spaces, colons, dots or hyphens.');
 return raw.toLowerCase();
}
export function formatIdentifiers(text,mode){
 if(!['add','remove'].includes(mode))throw new Error('Choose whether to add or remove colons.');
 const lines=String(text).split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
 if(!lines.length||lines.length>1000)throw new Error('Provide 1–1000 identifiers, one per line.');
 return lines.map((line,i)=>{try{const raw=normalizeIdentifier(line);return mode==='add'?raw.match(/../g).join(':'):raw;}catch(e){throw new Error(`Line ${i+1}: ${e.message}`);}}).join('\n');
}
export function decodeSymdev(value){
 const raw=normalizeIdentifier(value);
 if(raw.length!==32)throw new Error('A device NAA requires 32 hexadecimal digits; a 16-digit port WWPN is not a device NAA.');
 if(!['60000970','60060480'].includes(raw.slice(0,8)))throw new Error('Unsupported vendor/layout. This decoder handles the documented classic Symmetrix/VMAX ASCII layout only.');
 const sid=raw.slice(8,20),marker=raw.slice(20,22),tail=raw.slice(22);
 const device=tail.match(/../g).map(b=>String.fromCharCode(parseInt(b,16))).join('');
 if(!/^\d{12}$/.test(sid)||marker!=='53'||! /^[0-9a-f]{5}$/i.test(device))throw new Error('Not the supported classic ASCII device layout. Use array-side WWN mapping for newer, migrated or non-native identifiers.');
 return {raw,sid,device:device.toUpperCase(),prefix:raw.slice(0,8)};
}
export function formatDeviceList(text,{deduplicate=false,sort=false}={}){
 const devices=String(text).trim().split(/[\s,]+/).filter(Boolean);
 if(!devices.length||devices.length>10000)throw new Error('Provide 1–10,000 device IDs.');
 devices.forEach((v,i)=>{if(!/^[a-f0-9]{1,8}$/i.test(v))throw new Error(`Item ${i+1}: use a hexadecimal device ID of 1–8 characters. Ranges and command text are not accepted.`);});
 let out=devices.map(v=>v.toUpperCase());
 if(deduplicate){const seen=new Set();out=out.filter(v=>{const key=parseInt(v,16);if(seen.has(key))return false;seen.add(key);return true;});}
 if(sort)out.sort((a,b)=>parseInt(a,16)-parseInt(b,16));
 return {text:out.join(','),inputCount:devices.length,outputCount:out.length};
}
