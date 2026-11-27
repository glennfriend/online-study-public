// Publish the actual regional investigations; no test result creates an
// anatomical conclusion. Raw reading levels and cross-reviews are retained.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),out=new URL('assets/body-model/regional-review.json',root),old=await readFile(out,'utf8').then(JSON.parse).catch(()=>null),regions=[];
for(const name of ['upper-head-neck','axial-pelvis','lower-limb']){
 const bytes=await readFile(new URL('.anatomy-cache/review/'+name+'-investigation.json',root)).catch(()=>null),report=bytes?JSON.parse(bytes):old?.regions.find(r=>r.id===name)?.report;
 if(!report)throw Error('Missing reviewed regional evidence '+name);
 regions.push({id:name,inputSha256:bytes?createHash('sha256').update(bytes).digest('hex'):old.regions.find(r=>r.id===name).inputSha256,report});
}
const entries=regions.flatMap(r=>(r.report.coveredNamedRelations||r.report.entries).map(e=>({key:e.key,reviewer:r.id,reviewedSnapshot:e}))),k=JSON.parse(await readFile(new URL('assets/body-model/knowledge.json',root))),m=JSON.parse(await readFile(new URL('assets/body-model/manifest.json',root)));
if(entries.length!==219||new Set(entries.map(e=>e.key)).size!==219||Object.keys(k.entries).some(key=>!entries.some(e=>e.key===key)))throw Error('Regional coverage overlap or gap');
const repairs=[
 {id:'right-medial-pterygoid',title:'右翼內肌：移除對側退化碎片',action:'刪除原面片1480–1487與其24個獨用頂點，重算範圍；主肌附著表面保留。',meshes:['FMA49012'],crossReviewedBy:['upper-head-neck','lower-limb'],sources:['https://pubmed.ncbi.nlm.nih.gov/17318284/']},
 {id:'left-quadratus-lumborum',title:'左腰方肌：移除對側退化碎片',action:'刪除原面片0–9與其30個獨用頂點；正常左側肌體及附著全部保留。',meshes:['FMA22349'],crossReviewedBy:['upper-head-neck','axial-pelvis'],sources:['https://pubmed.ncbi.nlm.nih.gov/18441751/']},
 {id:'missing-source-surfaces',title:'補回同座標的真實附著背景',action:'載入白線、雙側前臂骨間膜、雙側小腿骨間膜。另加入直腸供盆底關係查看，直腸不當作替代的肌肉附著面。',meshes:['FMA11336','FMA23707','FMA23708','FMA35192','FMA35193','FMA14544'],crossReviewedBy:['upper-head-neck','axial-pelvis','lower-limb'],sources:['https://pubmed.ncbi.nlm.nih.gov/18333822/','https://pubmed.ncbi.nlm.nih.gov/11181006/']},
 {id:'sacrococcyx',title:'修正薦骨物件其實包含尾骨的概念',action:'模型標示為薦骨與尾骨合併，尾骨附著端可選到原有幾何；不再誤稱尾骨完全不存在。',meshes:['FMA16202'],crossReviewedBy:['axial-pelvis','upper-head-neck'],sources:['https://pmc.ncbi.nlm.nih.gov/articles/PMC3631051/']},
 {id:'embedded-tendons',title:'顯示已有的共用腱與足底腱',action:'足底方肌／足蚓狀肌合看趾長屈肌腱；手蚓狀肌合看深指屈肌與伸肌腱；孖肌合看閉孔內肌腱，拇趾短屈肌合看脛後肌腱。原有膝下伸膝裝置亦保留，不重複造腱。',meshes:[],crossReviewedBy:['upper-head-neck','lower-limb','axial-pelvis'],sources:['https://pubmed.ncbi.nlm.nih.gov/30989352/','https://pmc.ncbi.nlm.nih.gov/articles/PMC3348305/','https://pubmed.ncbi.nlm.nih.gov/11269580/']},
 {id:'insertion-variations',title:'修正三個止點敘述並增加足底視角',action:'脛前肌補內側至蹠側；脛後肌補多束足底附著的變異；拇短屈肌深頭補橈側／尺側／雙側配置。核對視窗新增垂直旋轉及足底／仰視，實際查看原有腱枝。',meshes:[],crossReviewedBy:['upper-head-neck','lower-limb'],sources:['https://pmc.ncbi.nlm.nih.gov/articles/PMC5474259/','https://www.mdpi.com/1660-4601/19/24/16510','https://pmc.ncbi.nlm.nih.gov/articles/PMC5679560/']},
];
const geometryCorrections=m.records.filter(r=>r.geometryCorrection).map(r=>({mesh:r.mesh,name:r.name,sourceSha256:r.sha256,removedFaceIndices:r.geometryCorrection.removeFaceIndices,removedVertexIndices:r.geometryCorrection.removedVertexIndices,reason:r.geometryCorrection.reason,evidence:r.geometryCorrection.evidence}));
if(geometryCorrections.length!==2||geometryCorrections.reduce((n,r)=>n+r.removedFaceIndices.length,0)!==18)throw Error('Reviewed geometry fixes are missing');
await writeFile(out,JSON.stringify({date:'2026-11-27',scope:{reviewers:3,names:entries.length,muscleObjects:424,method:'三個agent分區重讀解剖起止資料，針對尚未驗證處查閱原始研究、查看原始幾何，具體修正再由另一區agent獨立覆核。',precision:'參考模型的解剖關係與來源缺陷審查；agent交叉覆核不等於解剖教師或捐贈者原始影像的逐面組織認證。'},sourceGeometrySha256:m.sha256,repairs,geometryCorrections,entries,regions},null,2));
console.log('Published three regional investigations: 120 + 40 + 59 = 219 unique named entries; two cross-reviewed geometry corrections.');
