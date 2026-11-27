import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {injuryReview,injurySources,sportSummaries} from '../sports-injury-review.mjs';
const root=new URL('../',import.meta.url),html=await readFile(new URL('movement-reference.html',root),'utf8'),inline=html.match(/<script>([\s\S]*?)<\/script>/)[1],context=vm.createContext({});
vm.runInContext(await readFile(new URL('anatomy-data.js',root),'utf8')+'\n'+inline.slice(0,inline.indexOf('const SVGNS =')),context);
const data=vm.runInContext('({structures:STRUCTS.map(({id,name,en,kind,group,where,does,tips})=>({id,name,en,kind,group,where,does,tips})),exercises:EXERCISES,sports:SPORTS})',context);
// The new map has no schematic dashed markers or artificial point positions.
for(const s of data.structures)s.where=s.where.replace('（圖中用虛線表示它在關節內部）','').replace('（圖中標在腳跟底部）','');
data.references={hip:['AAOS・Hip Conditioning','https://www.orthoinfo.org/bodypart/hip-thigh/hip-conditioning-program/hip-pdf/'],spine:['AAOS・Spine Conditioning','https://www.orthoinfo.org/globalassets/pdfs/spine-conditioning-program_3-20-25.pdf'],shoulder:['AAOS・Rotator Cuff and Shoulder Conditioning','https://www.orthoinfo.org/bodypart/shoulder/rotator-cuff-and-shoulder-conditioning-program/'],knee:['AAOS・Knee Conditioning','https://www.orthoinfo.org/globalassets/pdfs/2023-rehab_knee_10-16-23.pdf'],ankle:['AAOS・Foot and Ankle Conditioning','https://www.orthoinfo.org/globalassets/pdfs/2022-rehab_foot-and-ankle_final.pdf'],run:['跑步步頻與關節力學研究','https://pubmed.ncbi.nlm.nih.gov/20581720/'],swim:['StatPearls・Swimmer’s Shoulder','https://www.ncbi.nlm.nih.gov/books/NBK470589/']};
for(const e of data.exercises){e.references=e.group.includes('肩')?['shoulder']:e.id.startsWith('ankle')||e.id==='calf-raise'?['ankle']:['clamshell','side-abd'].includes(e.id)?['hip']:e.group.includes('核心')?['spine']:e.id==='chin-tuck'?[]:['knee'];e.evidenceScope='肌肉顏色依解剖作用與常見動作學概略分類，不代表肌電量測、固定參與比例或個別處方；本頁動作示例不等同來源的全部訓練方案。';}
for(const e of data.exercises.filter(e=>['scaption','retract-scaption'].includes(e.id)))e.note='肩胛平面常約在額狀面前方 30–45°，但會隨骨骼與姿勢不同。讓肩胛骨自然上旋，依可控制及舒適的範圍練習；不能從單一姿勢推定肩峰下組織一定被夾擠。';
for(const s of data.sports){s.evidenceScope='以下是可能相關的負荷情境與構造，不代表已確定因果、確診或必然受傷。肌肉參與隨技術、速度、負荷與個體改變。';s.references=s.id==='run'?['run']:s.id==='swim'?['swim']:[];}
const run=data.sports.find(s=>s.id==='run');run.problems[0].why='同速跑步時，步頻及步長會改變膝、髖的力矩及能量吸收；力學改變不等於已證明可預防所有傷害。';run.problems[0].fix='研究以個人偏好步頻為基準測試增加 5% 與 10%；是否適用、如何漸進調整，仍需依症狀、速度與個體評估。';run.problems[1].why='骨盆與膝的運動控制涉及多條肌肉、疲勞、骨骼及技術；不能只看膝內移就判斷臀中肌無力或確定疼痛病因。';
const swim=data.sports.find(s=>s.id==='swim');swim.problems[0].why='反覆上舉與高訓練量會改變肩部負荷；肩痛可能涉及肌腱、關節穩定、疲勞及技術等多因素，不能用單一「夾擠」機制概括。';
for(const s of data.sports)for(const p of s.problems){p.relation='相關構造／負荷觀察，不是診斷';if(p.fix.includes('約一半'))p.fix='落地與變向需練習可控制的髖膝屈曲，配合跳躍落地、平衡、肌力等神經肌肉訓練。計畫效果依運動、族群與遵從性而異，不能套用固定減傷百分比。';}
Object.assign(data.references,injurySources);
const baseline=JSON.parse(execFileSync('git',['show','8ffe569:body-rehab/assets/body-model/movement.json'],{cwd:root,encoding:'utf8'})),audit=[];
for(const sport of data.sports){sport.references=sportSummaries[sport.id]?.references||[];if(sportSummaries[sport.id])sport.summary=sportSummaries[sport.id].text;sport.evidenceScope='各負荷情境已逐條核對機轉、相關構造與建議；每條另列證據類型、限制及來源。肌肉參與顏色為概略導覽，不能由姿勢或高亮構造作個人診斷。';sport.problems=sport.problems.map((old,i)=>{const id=sport.id+':'+i,review=injuryReview[id];if(!review)throw Error('Unreviewed injury '+id);const before=baseline.sports.find(s=>s.id===sport.id).problems[i],after={...old,...review,id,reviewDate:'2026-11-27',relation:'相關構造與負荷情境；顏色不代表確診受傷或風險大小'};audit.push({id,sport:sport.name,before,after,changes:['bad','hurt','why','fix','areas'].filter(f=>JSON.stringify(before[f])!==JSON.stringify(after[f])).map(field=>({field,before:before[field],after:after[field]}))});return after;});}
if(audit.length!==Object.keys(injuryReview).length)throw Error('Orphan injury review');
data.version=2;data.review={date:'2026-11-27',injuries:audit.length};data.anatomyScope='肌肉附著與神經／作用依主地圖資料；運動情境另記錄機轉、處置及證據範圍，不能混同肌電比例或個人處方。';
await writeFile(new URL('assets/body-model/injury-review-log.json',root),JSON.stringify({date:'2026-11-27',sources:injurySources,sportSummaries:Object.entries(sportSummaries).map(([id,s])=>({id,before:baseline.sports.find(x=>x.id===id).summary,after:s.text,references:s.references})),entries:audit},null,2));
await writeFile(new URL('assets/body-model/movement.json',root),JSON.stringify(data,null,2));console.log(`Restored ${data.exercises.length} exercises / ${data.sports.length} sports / ${data.structures.length} linked structures`);
// Keep the still-accessible older atlas page from teaching superseded injury
// claims. Its SVG stays a schematic; the clinical content shares this review.
const start=html.indexOf('const SPORTS = '),end=html.indexOf('// ───────────────────────── 畫圖',start);
if(start<0||end<0)throw Error('Legacy sports block not found');
let updated=html.slice(0,start)+'const SPORTS = '+JSON.stringify(data.sports,null,2)+';\nconst INJURY_REFS = '+JSON.stringify(injurySources)+';\n\n'+html.slice(end);
updated=updated.replace('<div class="bad">✗ ${p.bad}</div><p>→ <span class="hurt">${p.hurt}</span></p><p>${p.why}</p><p class="fix">✓ ${p.fix}</p></button>', '<div class="bad">${p.bad}</div><p><span class="hurt">${p.hurt}</span></p><p>${p.why}</p><p class="fix">${p.fix}</p><p>${p.evidence}</p><span>本條來源：${p.references.map(id => INJURY_REFS[id][0]).join(\'；\')}；完整連結與修訂見下方核對頁。</span></button>');
if(!updated.includes('id="clinical-review-link"'))updated=updated.replace('</header>','<p id="clinical-review-link"><a href="evidence-review.html#injury-review">運動傷害逐條文獻來源與修訂紀錄 ↗</a></p></header>');
await writeFile(new URL('movement-reference.html',root),updated);
