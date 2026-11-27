import {readFile,writeFile} from 'node:fs/promises';
import {reviewPositions,baseCorrections,partCorrections,reviewNotes} from '../anatomy-review.mjs';
import {matchingReferences} from './review-reference-map.mjs';
import {execFileSync} from 'node:child_process';
import {correctionEvidence} from '../model-concept-corrections.mjs';
import {attachmentLiterature,attachmentFieldEvidence} from '../attachment-literature.mjs';
const root=new URL('../',import.meta.url),date='2026-11-27';
const extras={
 cuff2008:['屍體解剖・棘上／棘下肌足印（2008）','https://pubmed.ncbi.nlm.nih.gov/18451386/'],
 cuff2015:['屍體解剖・棘上／棘下肌附著面（2015）','https://pubmed.ncbi.nlm.nih.gov/25914209/'],
 subclavius:['Washington University in St. Louis・Subclavius','https://nervesurgery.wustl.edu/upper-extremity/brachial-plexus/subclavius/'],
 psoasStudy:['屍體解剖研究・Psoas muscle innervation（2017）','https://pubmed.ncbi.nlm.nih.gov/28321940/'],
 serratusStudy:['解剖與功能研究・Serratus posterior muscles（2001）','https://pubmed.ncbi.nlm.nih.gov/11424195/'],
 minimusStudy:['屍體解剖研究・Adductor minimus revisited（2011）','https://pubmed.ncbi.nlm.nih.gov/21052670/'],
 scalp:['StatPearls・Scalp anatomy','https://www.ncbi.nlm.nih.gov/books/NBK551565/'],
 noseStudy:['解剖研究・Depressor septi nasi anatomy（2013）','https://pubmed.ncbi.nlm.nih.gov/23402537/'],
 nose:['StatPearls・Nose anatomy','https://www.ncbi.nlm.nih.gov/books/NBK532870/'],
 footTable:['TTUHSC・Leg and Foot 區域表（區分 EDB 與 EHB）','https://anatomy.ttuhscep.edu/schemes/leg_tables.html'],
 intercostals:['OpenStax・Axial Muscles of the Abdominal Wall and Thorax','https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax'],
 levatores:['IMAIOS 解剖圖譜・Levatores costarum','https://www.imaios.cn/en/e-anatomy/anatomical-structures/levatores-costarum-14216960'],
 pelvicStudy:['屍體研究・Levator ani nerve branches（2007）','https://pubmed.ncbi.nlm.nih.gov/17565421/'],
 pelvic:['StatPearls・Levator ani','https://www.ncbi.nlm.nih.gov/books/NBK556078/'],
 brachialisStudy:['解剖研究・Brachialis 雙重神經支配（1998）','https://pubmed.ncbi.nlm.nih.gov/9711030/'],
 thumbStudy:['屍體解剖研究・Flexor Pollicis Brevis（2017）','https://pmc.ncbi.nlm.nih.gov/articles/PMC5721304/'],
};
const extraByBase={supraspinatus:['cuff2008','cuff2015'],infraspinatus:['cuff2008','cuff2015'],subclavius:['subclavius'],'psoas major':['psoasStudy'],'serratus posterior superior':['serratusStudy'],'serratus posterior inferior':['serratusStudy'],'adductor minimus':['minimusStudy'],occipitalis:['scalp'],'depressor septi':['nose','noseStudy'],'extensor digitorum brevis':['footTable'],'external intercostal':['intercostals'],'internal intercostal':['intercostals'],'innermost intercostal':['intercostals'],'levatores costarum':['levatores'],puborectalis:['pelvic','pelvicStudy'],pubococcygeus:['pelvic','pelvicStudy'],iliococcygeus:['pelvic','pelvicStudy'],brachialis:['brachialisStudy']};
export async function applyReview(content){
 const references=JSON.parse(await readFile(new URL('.anatomy-cache/review/references.json',root))),baseline=await readFile(new URL('.anatomy-cache/review/before-knowledge.json',root),'utf8').catch(()=>execFileSync('git',['show','dc93f41:body-rehab/assets/body-model/knowledge.json'],{cwd:root,encoding:'utf8'})),before=JSON.parse(baseline),audit=[];
 for(const [id,ref]of Object.entries(extras))content.sources['review-'+id]=ref;
 for(const [id,ref]of Object.entries(attachmentLiterature))content.sources['attachment-'+id]=ref;
 correctionEvidence.forEach((r,i)=>content.sources['review-eye-concept-'+i]=r);
 for(const e of Object.values(content.entries)){
  const localization=reviewPositions[e.base];if(!localization)throw Error(`Unreviewed position ${e.key}`);
  if(e.scope==='part')for(const f of ['origin','insertion','nerve','action'])e[f]=e['part'+f[0].toUpperCase()+f.slice(1)];
  Object.assign(e,baseCorrections[e.base],partCorrections[e.key],localization);
  if(e.base==='orbicularis oculi'){e.position=e.key.startsWith('orbital')?'眼輪匝肌外周較厚的環狀部，跨越眶緣、位於眼瞼部外側。':'眼輪匝肌較薄的內側部，位於上、下眼瞼，在眶隔與瞼板前方。';e.notes.push('已修正原始模型眶部／瞼部的概念標籤對調：保留原始物件編號及座標，外周較大環對應眶部、內側薄環對應瞼部；來源原名可在模型識別碼中查閱。');}
  if(/cervicis|capitis|cervical/.test(e.key)&&/^(iliocostalis|longissimus|spinalis|semispinalis|rotatores|interspinales|intertransversarii)$/.test(e.base))e.region='頭頸';
  if(/lumborum|lumbar/.test(e.key))e.region='腹腰與骨盆';
  if(e.base==='interspinales'){const segment=/cervicis/.test(e.key)?'頸':/lumborum/.test(e.key)?'腰':'胸';e.origin=`${segment}段椎骨棘突上緣。`;e.insertion=`上方相鄰${segment}段椎骨棘突下緣。`;e.nerve='相應節段脊神經後支。';e.action=`協助${segment}段脊柱伸展與節段穩定；不是本分部同時伸展全頸、全腰。`;}
  if(e.base==='intertransversarii'){e.origin=/medial lumbar/.test(e.key)?'腰椎乳突與副突等相鄰骨性突起。':/cervical/.test(e.key)?`頸椎橫突${/anterior/.test(e.key)?'前':'後'}結節。`:'腰椎橫突。';e.insertion='相鄰椎骨的對應骨性突起。';e.action=`協助${e.region==='頭頸'?'頸':'腰'}椎同側側屈與節段穩定。`;}
  if(e.base==='levatores costarum')e.nerve='相應下頸至胸段脊神經後支。';
  if(e.scope==='part'){for(const f of ['origin','insertion','nerve','action'])e['part'+f[0].toUpperCase()+f.slice(1)]=e[f];e.dataScope='以下附著、神經與作用適用於目前選取的肌頭或分部。';e.notes=e.notes.filter(n=>!n.includes('本分部起點'));}
  if(reviewNotes[e.base])e.notes.push(reviewNotes[e.base]);
  const refs=matchingReferences(e,references),ids=[];for(const ref of refs){const id='review-'+ref.file.replace(/\.(html|htm)$/,'');content.sources[id]=[`${ref.publisher}・${ref.label}`,ref.url];ids.push(id);}
  for(const key of extraByBase[e.base]||[])ids.push('review-'+key);
  if(e.base==='flexor pollicis brevis')ids.push('review-thumbStudy');
  if(e.base==='orbicularis oculi')ids.push('review-eye-concept-0','review-eye-concept-1');
  // Scalp's LUMEN frontalis page discusses both epicranius bellies; do not
  // fabricate a separate occipitalis URL.
  if(e.base==='occipitalis'){const r=references.find(r=>r.file==='lumen-fron.htm');content.sources['review-occipitalis-lumen']=[r.publisher+'・Frontalis/Occipitalis',r.url];ids.push('review-occipitalis-lumen');}
  if(!ids.length&&e.base==='opponens digiti minimi of foot')ids.push('foot','footVariant');
  if(!ids.length)throw Error(`No cross-check source ${e.key}`);
  const attachmentEvidence=attachmentFieldEvidence(e);
  e.sources=[...new Set([...ids,...e.sources,...Object.values(attachmentEvidence).flat().map(id=>'attachment-'+id)])].filter((id,index,all)=>all.findIndex(other=>content.sources[other][1]===content.sources[id][1])===index);
  const old=before.entries[e.key],changes=[];for(const f of ['origin','insertion','nerve','action']){const oldValue=old?(old.scope==='part'?old['part'+f[0].toUpperCase()+f.slice(1)]:old[f]):null;if(oldValue!==e[f])changes.push({field:f,before:oldValue,after:e[f]});}
  const limitations=e.base==='adductor minimus'||e.base==='opponens digiti minimi of foot'||e.base==='temporoparietalis'?'存在／分部變異；不能把模型視為每人的固定形態。':'此為文獻位置核對；尚未完成模型每一附著面的專業審定。';
  e.fieldSources=Object.fromEntries(['position','origin','insertion','nerve','action'].map(f=>[f,[...ids]]));
  for(const [field,keys]of Object.entries(attachmentEvidence))e.fieldSources[field].push(...keys.map(id=>'attachment-'+id));
  // A university name alone does not make a copied/mislabelled cell evidence.
  const excluded={ 'obturator externus':{nerve:'review-uw-obturator-externus'},'adductor pollicis':{action:'review-uw-adductor-pollicis'},'pectoralis minor':{nerve:'review-uw-pectoralis-minor'},'extensor pollicis brevis':{action:'review-uw-extensor-pollicis-brevis'}}[e.base]||{};
  for(const [field,id]of Object.entries(excluded))e.fieldSources[field]=e.fieldSources[field].filter(s=>s!==id);
  e.review={date,method:'逐條文字與解剖關係對照；非程式測試認證',status:changes.length?'corrected':'cross-checked',positionScope:'literature-localization',geometryStatus:e.base==='orbicularis oculi'?'concept-labels-corrected':'gross-location-reviewed-attachments-not-certified',limitations};
  audit.push({key:e.key,name:e.zh,scope:e.scope,region:e.region,position:e.position,fields:Object.fromEntries(['origin','insertion','nerve','action'].map(f=>[f,{value:e[f],sourceIds:e.fieldSources[f]}])),review:e.review,changes,notes:e.notes});
 }
 content.review={date,entries:audit.length,changedEntries:audit.filter(r=>r.changes.length).length,changedFields:audit.reduce((n,r)=>n+r.changes.length,0),modelChanges:['補入原先漏匯入的 BP44–BP47 尺側伸腕肌雙側肌頭','補入來源同版本胸骨柄、胸骨體、劍突及雙側肋軟骨，維持胸部附著關係的骨性背景','修正 FMA46782/46783 與 FMA46785/46786 的眶部／瞼部概念對調，保留來源幾何'],visualReview:'以 10 張逐肌正反面與骨骼對照表初查 219 個名稱的粗略區域、前後側與分部關係；細小／被骨骼遮擋的附著面未視為完成認證。',geometry:'未以文字核對或來源座標相同，宣稱每個 3D 附著面已驗證。'};
 await writeFile(new URL('assets/body-model/anatomy-review-log.json',root),JSON.stringify({date,scope:'逐名稱條目的文獻內容核對；左右共用的解剖事實合併核對，並非人體全部肌肉的認證。',sources:content.sources,sourceDocuments:references.filter(r=>Object.values(content.sources).some(s=>s[1]===r.url)).map(({text,...metadata})=>metadata),summary:content.review,entries:audit},null,2));
 console.log(`Literature review: ${audit.length} entries; ${content.review.changedEntries} entries / ${content.review.changedFields} anatomical fields corrected or qualified`);
 return content;
}
