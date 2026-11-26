import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
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
data.version=1;data.anatomyScope='各肌肉的附著、神經及作用以主地圖本次文獻核對資料為準；動作參與分類與傷害情境屬不同層級的資料。';
await writeFile(new URL('assets/body-model/movement.json',root),JSON.stringify(data,null,2));console.log(`Restored ${data.exercises.length} exercises / ${data.sports.length} sports / ${data.structures.length} linked structures`);
