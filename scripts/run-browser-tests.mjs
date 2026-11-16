import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {SITE_FILES} from './site-files.mjs';
const suites=['browser','pure-browser','popular-browser','hpe-browser','evolution-browser','zoning-safety-browser','pure-safety-browser','p1-browser','p2-browser','performance-browser','website-browser'];
const selected=process.env.BROWSER_SUITES ? process.env.BROWSER_SUITES.split(',') : suites;
if(!selected.length||selected.some(s=>!suites.includes(s)))throw new Error('Unknown browser suite');
const run=(cmd,args,env=process.env)=>new Promise((ok,no)=>{const c=spawn(cmd,args,{stdio:'inherit',env,timeout:240000});c.on('error',no);c.on('exit',(code,signal)=>code===0?ok():no(new Error(`${args.join(' ')} failed: ${code??signal}`)));});
let server;
try{
 let base=process.env.TEST_URL;
 if(!base){
  await run(process.execPath,['scripts/package-site.mjs']);
  server=http.createServer(async(req,res)=>{const file=req.url==='/'?'index.html':req.url?.slice(1);if(!SITE_FILES.includes(file)){res.writeHead(404).end();return;}try{const data=await readFile(`_site/${file}`);res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.txt')?'text/plain; charset=utf-8':'text/html');res.end(data);}catch{res.writeHead(500).end();}});
  await new Promise((ok,no)=>{server.once('error',no);server.listen({host:'127.0.0.1',port:0,backlog:128},ok);});
  base=`http://127.0.0.1:${server.address().port}/`;
 }
 await mkdir('test-artifacts',{recursive:true});
 for(const s of selected){console.log(`Browser suite: ${s}`);await run(process.execPath,[`tests/${s}.cjs`],{...process.env,TEST_URL:base,TMPDIR:resolve('test-artifacts')});}
}finally{if(server)await new Promise(ok=>server.close(ok));}
