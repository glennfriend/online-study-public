// NCBI bibliographic/abstract retrieval; no copyrighted atlas images.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {injurySources} from '../sports-injury-review.mjs';
import {cleanHTML} from './read-muscle-table.mjs';
const root=new URL('../',import.meta.url),ids=[...new Set([...Object.values(injurySources).map(r=>r[1].match(/pubmed.ncbi.nlm.nih.gov\/(\d+)/)?.[1]).filter(Boolean),'18451386','25914209'])];
const url='https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id='+ids.join(','),cache=new URL('.anatomy-cache/review/new-evidence-pubmed.xml',root);
let bytes=await readFile(cache).catch(()=>null);if(!bytes){const response=await fetch(url);if(!response.ok)throw Error('NCBI '+response.status);bytes=Buffer.from(await response.arrayBuffer());}
const xml=bytes.toString();if(!xml.includes('<PubmedArticle>'))throw Error('Not PubMed XML');await writeFile(cache,bytes);
const records=[...xml.matchAll(/<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g)].map(m=>{const t=m[1];return {pmid:t.match(/<PMID[^>]*>(\d+)/)[1],title:cleanHTML(t.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)?.[1]||''),abstract:cleanHTML([...t.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)].map(m=>m[1]).join('\n'))};});
for(const id of ids)if(!records.some(r=>r.pmid===id))throw Error('Missing PMID '+id);
await writeFile(new URL('.anatomy-cache/review/new-evidence-pubmed.json',root),JSON.stringify(records,null,2));
await writeFile(new URL('assets/body-model/evidence-source-versions.json',root),JSON.stringify({retrieved:'2026-11-27',retrieval:url,sha256:createHash('sha256').update(bytes).digest('hex'),records:records.map(({abstract,...meta})=>({...meta,url:'https://pubmed.ncbi.nlm.nih.gov/'+meta.pmid+'/'}))},null,2));
console.log('Retrieved '+records.length+' source records. Abstracts remain in the private review cache.');
