import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {identify} from '../muscle-catalogue.mjs';
import {targetsFor,matchesTarget} from '../attachment-targets.mjs';
import {attachmentFindings} from '../attachment-findings.mjs';
const root=new URL('../',import.meta.url),dir=new URL('assets/body-model/',root),read=async f=>JSON.parse(await readFile(new URL(f,dir))),m=await read('manifest.json'),k=await read('knowledge.json'),textAudit=await read('anatomy-review-log.json');
const sheetIndex=[...JSON.parse(await readFile(new URL('.anatomy-cache/review/attachments/index.json',root))),...JSON.parse(await readFile(new URL('.anatomy-cache/review/attachments/index-left.json',root)))];
const sheets=[];for(const page of sheetIndex){const bytes=await readFile(new URL('.anatomy-cache/review/attachments/'+page.file,root));sheets.push({file:page.file,sha256:createHash('sha256').update(bytes).digest('hex'),objects:page.entries.flatMap(e=>e.meshes)});}
const entries=[];
for(const e of Object.values(k.entries)){
 const target=targetsFor(e);if(!target)throw Error('Missing anatomical target '+e.base);
 const records=m.records.filter(r=>r.kind==='muscle'&&identify(r.name).key===e.key),ends={};
 for(const end of ['origin','insertion'])ends[end]={anatomy:e[end],sourceIds:e.fieldSources[end],targets:target[end].map(name=>({name,objects:records.map(r=>({side:r.side,meshes:m.records.filter(x=>matchesTarget(name,x,r.side)).map(x=>x.mesh)})),representation:name.startsWith('~')?'no-independent-surface':m.records.some(x=>matchesTarget(name,x,'midline'))?'context-surface-present':'no-independent-surface'}))};
 const observations=[attachmentFindings[e.base]||'三個方向已對照文字所列骨性區域與走向；來源未提供附著足印的逐面標籤，物件邊界不能當作足印測量。'];
 if(/interosse|interspinal|intertransvers|rotator|multifidus|intercostal/.test(e.key))observations.push('此來源以合併肌群／多肌束物件呈現；已核對整組分布，不能宣稱每一條未獨立分割的小肌束足印都已驗證。');
 if(target.origin.concat(target.insertion).some(n=>/skin|modiolus|perioral|nasal|palpebral|fascia/.test(n)))observations.push('軟組織端的皮膚、纖維縫或筋膜未完整分割，不能用鄰近骨點替代。文獻止點與模型游離緣分開判讀。');
 const shared=['biceps brachii','flexor digitorum superficialis','extensor carpi ulnaris','gastrocnemius','triceps brachii'].includes(e.base)?m.records.filter(r=>r.kind==='muscle'&&identify(r.name).base===e.base&&!records.includes(r)).map(r=>r.mesh):[];
 const meshes=records.map(r=>{const sheet=sheetIndex.find(p=>p.entries.some(e=>e.meshes.includes(r.mesh)));if(!sheet)throw Error('Missing inspection sheet '+r.mesh);return {mesh:r.mesh,side:r.side,sha256:r.sha256,sheet:sheet.file,views:['anterior','profile-90','posterior'],assessment:'區域、路徑與連接方式核對；未作逐三角形足印分割認證'};});
 const row={key:e.key,name:e.zh,region:e.region,date:'2026-11-27',origin:ends.origin,insertion:ends.insertion,observations,meshes,sharedMuscleMeshes:shared,precision:'文獻與三向模型對照；無精確足印分割處已逐端列出，不以最近骨點或頂點測試判定解剖正確。'};
 entries.push(row);e.attachmentReview={date:row.date,observations,recordUrl:'evidence-review.html#attachment='+encodeURIComponent(e.key)};e.review.geometryStatus='attachment-region-and-path-reviewed-footprint-limits-recorded';e.review.limitations='已完成多角度附著區域及連接方式核對；未獨立分割的精確足印與缺少表面之處見附著核對紀錄。不能用作個體或手術足印模板。';
 const old=textAudit.entries.find(x=>x.key===e.key);old.review=e.review;old.attachmentReview=e.attachmentReview;
}
const report={date:'2026-11-27',scope:{names:entries.length,muscleObjects:entries.reduce((n,e)=>n+e.meshes.length,0),attachmentEnds:entries.length*2,viewsPerObject:3,method:'逐名稱文獻起止點對照，逐側別物件三方向透視骨骼／腱背景檢視；非自動距離判定或教師認證。',limits:'來源沒有逐面附著足印與全部軟組織；未分割的表面以缺少表面列出，不補畫虛構附著點。'},sources:k.sources,sourceGeometrySha256:m.sha256,sheets,entries};
k.review.attachmentReview=report.scope;k.review.geometry=report.scope.limits;textAudit.summary=k.review;
await writeFile(new URL('attachment-review.json',dir),JSON.stringify(report,null,2));await writeFile(new URL('knowledge.json',dir),JSON.stringify(k));await writeFile(new URL('anatomy-review-log.json',dir),JSON.stringify(textAudit,null,2));
console.log(`Recorded ${entries.length} names / ${report.scope.muscleObjects} source objects / ${report.scope.attachmentEnds} anatomical ends. No fabricated footprint coordinates.`);
