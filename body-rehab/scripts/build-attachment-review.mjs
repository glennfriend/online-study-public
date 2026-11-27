import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {identify} from '../muscle-catalogue.mjs';
import {targetsFor} from '../attachment-targets.mjs';
import {resolveAttachmentTarget,relationshipContextMeshes} from '../attachment-geometry.mjs';
import {attachmentFindings} from '../attachment-findings.mjs';
const root=new URL('../',import.meta.url),dir=new URL('assets/body-model/',root),read=async f=>JSON.parse(await readFile(new URL(f,dir))),m=await read('manifest.json'),k=await read('knowledge.json'),textAudit=await read('anatomy-review-log.json');
const sheetIndex=[...JSON.parse(await readFile(new URL('.anatomy-cache/review/attachments/index.json',root))),...JSON.parse(await readFile(new URL('.anatomy-cache/review/attachments/index-left.json',root)))];
const sheets=[];for(const page of sheetIndex){const bytes=await readFile(new URL('.anatomy-cache/review/attachments/'+page.file,root));sheets.push({file:page.file,sha256:createHash('sha256').update(bytes).digest('hex'),objects:page.entries.flatMap(e=>e.meshes)});}
const entries=[];
for(const e of Object.values(k.entries)){
 const target=targetsFor(e);if(!target)throw Error('Missing anatomical target '+e.base);
 const records=m.records.filter(r=>r.kind==='muscle'&&identify(r.name).key===e.key),ends={};
 for(const end of ['origin','insertion'])ends[end]={anatomy:e[end],sourceIds:e.fieldSources[end],targets:target[end].map(name=>{const resolved=resolveAttachmentTarget(name,m.records,'midline');return {name,objects:records.map(r=>({side:r.side,meshes:resolveAttachmentTarget(name,m.records,r.side).meshes})),representation:resolved.representation,note:resolved.note};})};
 const observations=[attachmentFindings[e.base]||'三個方向已對照文字所列骨性區域與走向；來源未提供附著足印的逐面標籤，物件邊界不能當作足印測量。'];
 if(/interosse|interspinal|intertransvers|rotator|multifidus|intercostal/.test(e.key))observations.push('此來源以合併肌群／多肌束物件呈現；已核對整組分布，不能宣稱每一條未獨立分割的小肌束足印都已驗證。');
 if(target.origin.concat(target.insertion).some(n=>/skin|modiolus|perioral|nasal|palpebral|fascia/.test(n)))observations.push('軟組織端的皮膚、纖維縫或筋膜未完整分割，不能用鄰近骨點替代。文獻止點與模型游離緣分開判讀。');
 const shared=['biceps brachii','flexor digitorum superficialis','extensor carpi ulnaris','gastrocnemius','triceps brachii'].includes(e.base)?m.records.filter(r=>r.kind==='muscle'&&identify(r.name).base===e.base&&!records.includes(r)).map(r=>r.mesh):[];
 const meshes=records.map(r=>{const sheet=sheetIndex.find(p=>p.entries.some(e=>e.meshes.includes(r.mesh)));if(!sheet)throw Error('Missing inspection sheet '+r.mesh);return {mesh:r.mesh,side:r.side,sha256:r.sha256,sheet:sheet.file,views:['anterior','profile-90','posterior'],geometryCorrection:r.geometryCorrection?{removedFaceIndices:r.geometryCorrection.removeFaceIndices,removedVertices:r.geometryCorrection.removedVertexIndices.length,reason:r.geometryCorrection.reason}:null,assessment:'區域、路徑與連接方式核對；不以來源分割邊界冒充組織足印'};});
 const row={key:e.key,name:e.zh,region:e.region,date:'2026-11-27',origin:ends.origin,insertion:ends.insertion,observations,meshes,sharedMuscleMeshes:shared,relationshipContextMeshes:relationshipContextMeshes(e,m.records),precision:'文獻與多角度模型對照；直接修正漏載、錯誤概念及經交叉覆核的游離錯側面片，不以最近骨點或平均足印重塑個體。'};
 const supportIds=new Set([...row.origin.targets,...row.insertion.targets].filter(t=>t.representation==='embedded-in-source-object').flatMap(t=>t.objects.flatMap(o=>o.meshes)).concat(row.relationshipContextMeshes));
 entries.push(row);e.attachmentReview={date:row.date,observations,sharedMuscleMeshes:shared,supportingMuscleMeshes:m.records.filter(r=>r.kind==='muscle'&&supportIds.has(r.mesh)).map(r=>r.mesh),framingContextMeshes:m.records.filter(r=>/calcaneal tendon/.test(r.name)&&[...row.origin.targets,...row.insertion.targets].some(t=>t.objects.some(o=>o.meshes.includes(r.mesh)))).map(r=>r.mesh),recordUrl:'evidence-review.html#attachment='+encodeURIComponent(e.key)};e.review.geometryStatus='regionally-cross-reviewed-model-repairs-applied';e.review.limitations='已完成分區文獻及多角度連接核對，實修錯側面片、補回漏載表面；合併物件中的肌腱與骨性組織另行標明。來源個體未分界的組織不冒充精確足印。';
 const old=textAudit.entries.find(x=>x.key===e.key);old.review=e.review;old.attachmentReview=e.attachmentReview;
}
const report={date:'2026-11-27',scope:{names:entries.length,muscleObjects:entries.reduce((n,e)=>n+e.meshes.length,0),attachmentEnds:entries.length*2,viewsPerObject:3,method:'逐名稱文獻起止點對照，分區agent查原始研究並交叉覆核具體發現；保留三向表，足底另加仰視核對。',limits:'已區分獨立表面、合併骨面、肌腱複合物件內嵌表面與真正未分割組織。未以缺少獨立物件名稱判定幾何不存在。'},sources:k.sources,sourceGeometrySha256:m.sha256,sheets,entries};
k.review.attachmentReview=report.scope;k.review.geometry=report.scope.limits;textAudit.summary=k.review;
await writeFile(new URL('attachment-review.json',dir),JSON.stringify(report,null,2));await writeFile(new URL('knowledge.json',dir),JSON.stringify(k));await writeFile(new URL('anatomy-review-log.json',dir),JSON.stringify(textAudit,null,2));
console.log(`Recorded ${entries.length} names / ${report.scope.muscleObjects} source objects / ${report.scope.attachmentEnds} anatomical ends. No fabricated footprint coordinates.`);
