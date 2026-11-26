import { readFile } from 'node:fs/promises';
export function cleanHTML(value) {
  return value.replace(/<br\s*\/?\s*>/gi,'; ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n))).replace(/\s+/g,' ').trim();
}
export async function readMuscleTable(path) {
  const html=await readFile(path,'utf8');
  let region='';const muscles=[];
  // The source uses HTML's optional </tr> closing tags in several tables.
  for(const item of html.matchAll(/<h[1-4][^>]*>[\s\S]*?<\/h[1-4]>|<tr\b[^>]*>[\s\S]*?(?=<tr\b|<\/table>|$)/gi)){
    if(/^<h/i.test(item[0])){region=cleanHTML(item[0]);continue;}
    const cells=[...item[0].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(match=>cleanHTML(match[1]));
    if(cells.length<5||!cells[0]||!cells[1]||!cells[2])continue;
    muscles.push({name:cells[0],origin:cells[1],insertion:cells[2],action:cells[3],nerve:cells[4],region});
  }
  return muscles;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/read-muscle-table.mjs')){
  const muscles=await readMuscleTable(new URL('../.anatomy-cache/knowledge/ttuhsc.html',import.meta.url));
  console.log(JSON.stringify(muscles.map(m=>({name:m.name,region:m.region})),null,2));
}
