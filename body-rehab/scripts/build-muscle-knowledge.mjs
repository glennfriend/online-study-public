import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {readMuscleTable} from './read-muscle-table.mjs';
import {identify} from '../muscle-catalogue.mjs';
import {parts} from '../part-anatomy.mjs';
const root=new URL('../',import.meta.url),manifest=JSON.parse(await readFile(new URL('assets/body-model/manifest.json',root)));
const tablePath=new URL('.anatomy-cache/knowledge/ttuhsc.html',root),table=await readMuscleTable(tablePath);
if(createHash('sha256').update(await readFile(tablePath)).digest('hex')!=='9f92c332bf6e16706133bed539d88fdeb5558b0f5aca53343dee8798c2263005')throw Error('Anatomy reference changed; review before rebuilding');
const context=vm.createContext({});vm.runInContext(await readFile(new URL('anatomy-data.js',root),'utf8'),context);
const {profiles,sources}=vm.runInContext('({profiles:ANATOMY,sources:ANATOMY_SOURCES})',context);
const profileMap={'latissimus dorsi':'lats','levator scapulae':'levator','rhomboideus major':'rhomboids','rhomboideus minor':'rhomboids','serratus anterior':'serratus','supraspinatus':'supraspinatus','infraspinatus':'infraspinatus','subscapularis':'subscapularis','teres major':'teres-major','teres minor':'teres-minor','sternocleidomastoid':'scm','rectus abdominis':'rectus','external abdominal oblique':'ext-oblique','internal abdominal oblique':'int-oblique','transversus abdominis':'transverse','quadratus lumborum':'ql','psoas major':'psoas','iliacus':'iliacus','gluteus maximus':'glute-max','gluteus medius':'glute-med','gluteus minimus':'glute-min','tensor fasciae latae':'tfl','piriformis':'piriformis','sartorius':'sartorius','tibialis anterior':'tib-ant','soleus':'soleus'};
const refs={tables:sources.tables,bp3d:['BodyParts3D 3.0・模型與名稱原始資料',manifest.source.url],temporal:['Loyola 醫學院・顳頂肌','https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/tepa.htm'],foot:['StatPearls・足與踝解剖','https://www.ncbi.nlm.nih.gov/books/NBK546698/'],footVariant:['解剖研究・小趾屈肌命名與變異（2024）','https://link.springer.com/article/10.1186/s43088-024-00491-z'],ecrb:['華盛頓大學放射科・橈側伸腕短肌','https://www.rad.washington.edu/muscle-atlas/extensor-carpi-radialis-brevis'],ecrl:['華盛頓大學放射科・橈側伸腕長肌','https://www.rad.washington.edu/muscle-atlas/extensor-carpi-radialis-longus'],lumbar:['解剖研究・腰椎神經支配（Bogduk, 1983）','https://pubmed.ncbi.nlm.nih.gov/6226119/']};
const knowledge={};
delete profileMap['rhomboideus major'];delete profileMap['rhomboideus minor'];
Object.assign(profileMap,{'rectus abdominis':'rectus-abd','transversus abdominis':'transversus','quadratus lumborum':'quadratus','tibialis anterior':'tibialis-ant','multifidus':'multifidus','pectoralis minor':'pec-minor'});
refs.back=sources.back;refs.face=['德國超音波醫學會・顏面肌超音波解剖','https://www.degum.de/fileadmin/dokumente/sektionen/kopf-hals/Informationen_zum_Fach/Instruction_for_the_sonography_of_facial_muscles_v06a.pdf'];
for(const r of manifest.records.filter(r=>r.kind==='muscle')){
 const identity=identify(r.name),{key,base,zh}=identity;if(knowledge[key])continue;
 const row=table.find(t=>t.name===base),group=/^set of /.test(key),part=/ (head|part|belly) of /.test(key)||/^(iliocostalis|longissimus|semispinalis|spinalis) /.test(key)||/rotator$/.test(key)||/^(first|second|third|fourth) /.test(key);
 const entry={key,base,zh,english:key,scope:group?'group':part?'part':'muscle',tableRow:row?.name||null,language:'en',sources:['tables'],dataScope:part?`以下起止點、神經與作用是 ${base} 的整肌／肌群資料；本分部的補充見下方。`:group?'模型將多條肌肉合為一個肌群；資料也是肌群層級。':'',notes:[],...row};
 delete entry.name;delete entry.region;
 const profile=profiles[profileMap[base]];
 if(profile&&!part&&!group){for(const f of ['origin','insertion','nerve','action','fibers','relations','distinction'])entry[f]=profile[f];entry.language='zh-Hant';for(const source of profile.sources){refs[source]=sources[source];if(!entry.sources.includes(source))entry.sources.push(source);}}
 if(base==='temporoparietalis')Object.assign(entry,{origin:'耳上方的顳筋膜。',insertion:'帽狀腱膜。',nerve:'顏面神經的顳支。',action:'牽動、繃緊頭皮；功能較微弱。',language:'zh-Hant',sources:['temporal']});
 if(base==='opponens digiti minimi of foot')Object.assign(entry,{origin:'長蹠韌帶及骰骨附近；與小趾短屈肌的分界存在變異。',insertion:'第五蹠骨外側。',nerve:'外側足底神經。',action:'協助第五蹠骨的輕微屈曲與穩定；不能套用手部對掌肌的功能。',notes:['這是變異較大的小肌；模型命名不表示所有人都有相同獨立肌腹。'],language:'zh-Hant',sources:['foot','footVariant']});
 if(base==='extensor carpi radialis brevis'){entry.origin='肱骨外上髁的共同伸肌腱起點。';entry.nerve='橈神經深支；分支來源有解剖變異。';entry.sources.push('ecrb');}
 if(base==='extensor carpi radialis longus'){entry.nerve='橈神經（在分為淺、深支前發出肌支）。';entry.sources.push('ecrl');}
 if(base==='intertransversarii'){entry.nerve=/lateral lumbar|anterior cervical/.test(key)?'脊神經前支。':/medial lumbar/.test(key)?'腰脊神經後支。':'依頸部前後分部，可由脊神經前支或後支供應；不能把整群一律標為後支。';entry.sources.push('lumbar');}
 // Head-specific attachment corrections are explicit, never inferred from the
 // outline on screen. The full-muscle entry remains labelled as such.
 const origins={
 'long head of biceps brachii':'肩胛骨盂上結節及上方盂唇。','short head of biceps brachii':'肩胛骨喙突。',
 'long head of triceps brachii':'肩胛骨盂下結節。','lateral head of triceps brachii':'肱骨後面，橈神經溝上方。','medial head of triceps brachii':'肱骨後面，橈神經溝下方。',
 'long head of biceps femoris':'坐骨結節。','short head of biceps femoris':'股骨粗線外側唇與外側髁上線。',
 'clavicular part of deltoid':'鎖骨外側三分之一。','acromial part of deltoid':'肩峰。','spinal part of deltoid':'肩胛棘。',
 'clavicular part of pectoralis major':'鎖骨內側半的前面。','sternocostal part of pectoralis major':'胸骨前面及上位肋軟骨。','abdominal part of pectoralis major':'腹外斜肌腱膜。',
 'medial head of gastrocnemius':'股骨內側髁附近的後面。','lateral head of gastrocnemius':'股骨外側髁附近的後面。',
 'anterior belly of digastric':'下頜骨二腹肌窩。','posterior belly of digastric':'顳骨乳突切跡。',
 'humeral head of pronator teres':'肱骨內上髁。','ulnar head of pronator teres':'尺骨冠突。',
 'humeral head of flexor carpi ulnaris':'肱骨內上髁。','ulnar head of flexor carpi ulnaris':'尺骨鷹嘴及尺骨後緣。',
 'radial head of flexor digitorum superficialis':'橈骨前緣。','humeroulnar head of flexor digitorum superficialis':'肱骨內上髁、尺側副韌帶與尺骨冠突。',
 'descending part of trapezius':'枕外隆凸、上項線內側部及項韌帶。','transverse part of trapezius':'下頸椎至上胸椎棘突。','ascending part of trapezius':'中、下胸椎棘突。',
 };
 if(origins[key]){entry.partOrigin=origins[key];entry.notes.push('「本分部起點」適用於選取的肌頭／分部；整肌資料不等於每一分部都具有全部附著。');}
 if(key==='short head of biceps femoris'){entry.partNerve='坐骨神經的腓總神經部分。';entry.partAction='屈膝、屈膝位使小腿外旋；不跨髖關節，不能伸髖。';}
 if(key==='long head of biceps femoris')entry.partNerve='坐骨神經的脛神經部分。';
 if(key==='anterior belly of digastric')entry.partNerve='下齒槽神經的下頜舌骨肌支（V3）。';
 if(key==='posterior belly of digastric')entry.partNerve='顏面神經（VII）。';
 if(key.includes('trapezius')){entry.partAction=key.startsWith('descending')?'上提肩胛骨，協同上旋。':key.startsWith('ascending')?'下壓肩胛骨，協同上旋。':'後收肩胛骨。';}
 const specific=parts[key];if(specific){[entry.partOrigin,entry.partInsertion,entry.partNerve,entry.partAction]=specific;if(specific[4]&&!entry.sources.includes(specific[4]))entry.sources.push(specific[4]);}
 if(key.includes('trapezius'))entry.partInsertion=key.startsWith('descending')?'鎖骨外側三分之一。':key.startsWith('ascending')?'肩胛棘內側端。':'肩峰與肩胛棘。';
 const ordinal=key.match(/^(first|second|third|fourth) (lumbrical|plantar interosseous) of foot$/);if(ordinal){const n={first:1,second:2,third:3,fourth:4}[ordinal[1]],toe=ordinal[2]==='lumbrical'?n+1:n+2;entry.partOrigin=ordinal[2]==='lumbrical'?(n===1?'趾長屈肌通往第二趾肌腱的內側。':'相鄰趾長屈肌腱。'):`第 ${toe} 蹠骨的內側。`;entry.partInsertion=`第 ${toe} 趾近節趾骨底內側與伸肌腱膜。`;entry.partNerve=ordinal[2]==='lumbrical'&&n===1?'內側足底神經。':'外側足底神經深支。';entry.partAction=ordinal[2]==='lumbrical'?`屈第 ${toe} 趾蹠趾關節、伸趾間關節。`:`將第 ${toe} 趾內收朝向第二趾，並協助屈蹠趾關節。`;}
 if(part&&entry.partOrigin){entry.partInsertion??=entry.insertion;entry.partNerve??=entry.nerve;entry.partAction??=entry.action;}
 if(part&&!entry.partOrigin)throw Error(`Missing subdivision facts: ${key}`);
 for(const f of ['origin','insertion','nerve','action'])if(!entry[f])throw Error(`Missing ${f}: ${key} (${base})`);
 knowledge[key]=entry;
}
const content={version:1,table:{url:refs.tables[1],sha256:createHash('sha256').update(await readFile(tablePath)).digest('hex'),extracted:'Factual attachment, action and motor-nerve fields only; no notes, illustrations or arterial columns',parserRows:table.length},sources:refs,entries:knowledge};
await writeFile(new URL('assets/body-model/knowledge.json',root),JSON.stringify(content));
console.log(`${Object.keys(knowledge).length} named muscle/part/group entries with four anatomical fields and sources`);
