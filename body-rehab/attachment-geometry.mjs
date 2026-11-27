// Resolve real source surfaces, including tendons embedded in muscle objects.
// An embedded surface is never presented as an independently segmented footprint.
import {matchesTarget} from './attachment-targets.mjs';
const embedded={
 '~flexor digitorum longus tendon':{names:['flexor digitorum longus'],note:'趾長屈肌來源物件包含足底分趾腱；顯示同一物件的實際幾何作連接背景，沒有另造腱或附著點。'},
 '~flexor digitorum profundus tendon':{names:['flexor digitorum profundus'],note:'深指屈肌來源物件包含手部遠端腱；以原幾何供蚓狀肌起點關係核對。'},
 '~obturator internus tendon':{names:['obturator internus'],note:'閉孔內肌來源物件包含共同腱走向；與孖肌合看，不把肌腹邊緣當作獨立股骨足印。'},
 '~tibialis posterior tendon':{names:['tibialis posterior'],note:'脛後肌原始肌腱物件提供足底連接背景；不代表其中每個腱支已另分割。'},
 '~palmar aponeurosis':{names:['palmaris longus'],note:'掌長肌來源物件末端已有掌內扇形腱膜表面；以原物件呈現，不再把缺少獨立腱膜物件等同幾何缺失。'},
 '~central tendon':{names:['diaphragm'],note:'完整膈來源物件已含中央區表面；肌肉與中央腱沒有獨立組織標記，整張選取顏色代表來源物件，不表示全部都是肌纖維。'},
 '~patellar ligament':{names:['rectus femoris','vastus lateralis','vastus medialis','vastus intermedius'],note:'股四頭肌來源物件已含延至髕骨下方的伸膝裝置連續段。可見原幾何；髕韌帶與支持帶沒有獨立組織分割，不能整段當作肌腹或精確髕韌帶足印。'},
};
export function resolveAttachmentTarget(target,records,side){
 const visible=r=>side==='midline'||r.side==='midline'||r.side===side;
 const normal=records.filter(r=>matchesTarget(target,r,side));
 if(normal.length)return {representation:normal.some(r=>r.anatomicalComponents?.includes(target))?'combined-source-surface':'context-surface-present',meshes:normal.map(r=>r.mesh),note:normal.some(r=>r.anatomicalComponents?.includes(target))?'此骨性背景已在薦骨／尾骨合併來源物件中呈現，尚未沿薦尾關節獨立分割。':''};
 const part=embedded[target],meshes=part?records.filter(r=>r.kind==='muscle'&&visible(r)&&part.names.includes(r.name.replace(/\b(left|right)\s*/g,'').trim())).map(r=>r.mesh):[];
 return {representation:meshes.length?'embedded-in-source-object':'no-independent-surface',meshes,note:meshes.length?part.note:''};
}
export function attachmentScene(entry,records,side){
 const selected=records.filter(r=>entry.meshes.some(m=>m.mesh===r.mesh)&&(r.side===side||r.side==='midline'));
 const related=records.filter(r=>entry.sharedMuscleMeshes.includes(r.mesh)&&r.side===side);
 const ids=new Set([...entry.origin.targets,...entry.insertion.targets].flatMap(t=>resolveAttachmentTarget(t.name,records,side).meshes));
 for(const id of entry.relationshipContextMeshes||[])ids.add(id);
 const subjects=new Set([...selected,...related].map(r=>r.mesh));
 const context=records.filter(r=>ids.has(r.mesh)&&!subjects.has(r.mesh)&&(r.side===side||r.side==='midline'));
 return {selected,related,context};
}
// Adjacent organs / distal tendon carriers are relationships, not substitute
// origin/insertion surfaces. Keep them separately identified in the report.
export function relationshipContextMeshes(e,records){
 const names=e.base==='lumbrical (hand)'?['extensor digitorum']:e.base==='lumbricals (foot)'?['extensor digitorum longus']:['puborectalis','pubococcygeus','iliococcygeus','coccygeus','anal sphincter, external'].includes(e.base)?['rectum']:[];
 return records.filter(r=>names.includes(r.name.replace(/\b(left|right)\s*/g,'').trim())).map(r=>r.mesh);
}
