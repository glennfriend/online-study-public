// Cache reference text for content review, never the copyrighted atlas images.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {cleanHTML} from './read-muscle-table.mjs';
const root=new URL('../.anatomy-cache/review/',import.meta.url);await mkdir(root,{recursive:true});
const base='https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/';
async function get(url,file){let bytes=await readFile(new URL(file,root)).catch(()=>null);if(!bytes){const response=await fetch(url);if(!response.ok)throw Error(`${response.status} ${url}`);bytes=Buffer.from(await response.arrayBuffer());await writeFile(new URL(file,root),bytes);}return {html:bytes.toString('utf8'),sha256:createHash('sha256').update(bytes).digest('hex')};}
const links=html=>[...html.matchAll(/<a\b[^>]*href\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi)].map(m=>({href:m[1]||m[2]||m[3],label:cleanHTML(m[4])}));
const jobs=new Map();
for(const file of ['back.htm','upper.htm','headneck.htm','thorax.htm','abdomen.htm','pelvis.htm','lower.htm']){const {html}=await get(base+file,'lumen-'+file);for(const link of links(html))if(/\.htm$/i.test(link.href)&&!link.href.includes('/')&&link.label&&!/index|region|welcome|back|upper|headneck|thorax|abdomen|pelvis|lower/.test(link.href))jobs.set(base+link.href,{url:base+link.href,file:'lumen-'+link.href,label:link.label,publisher:'Loyola University Chicago・LUMEN'});}
const uwIndex=await get('https://www.rad.washington.edu/muscle-atlas','uw-index.html');for(const link of links(uwIndex.html))if(/\/muscle-atlas\//.test(link.href)&&link.label){const url=new URL(link.href,'https://www.rad.washington.edu').href;const slug=url.split('/').filter(Boolean).at(-1);jobs.set(url,{url,file:'uw-'+slug+'.html',label:link.label,publisher:'University of Washington・Muscle Atlas'});}
const queue=[...jobs.values()];let done=0;await Promise.all(Array.from({length:5},async()=>{while(queue.length){const job=queue.shift();try{const r=await get(job.url,job.file);job.sha256=r.sha256;job.text=cleanHTML(r.html.replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<style\b[\s\S]*?<\/style>/gi,''));}catch(e){job.error=e.message;}done++;if(done%25===0)console.log(`${done}/${jobs.size} references`);}}));
await writeFile(new URL('references.json',root),JSON.stringify([...jobs.values()],null,2));console.log(`Cached ${jobs.size} references, ${[...jobs.values()].filter(j=>j.error).length} errors`);
