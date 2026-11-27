// Expected structures are selected from anatomy, never guessed from proximity.
// A target gives dissection context; it is NOT a digitised insertion footprint.
// ~ identifies a soft-tissue attachment with no separate source surface.
const rows=`
diaphragm|sternum,rib,costal cartilage,lumbar|~central tendon
external abdominal oblique|rib|hip bone,~linea alba
sternohyoid|manubrium,clavicle|hyoid bone
omohyoid|scapula,~omohyoid intermediate tendon|hyoid bone,~omohyoid intermediate tendon
sternothyroid|manubrium|thyroid cartilage
thyrohyoid|thyroid cartilage|hyoid bone
latissimus dorsi|thoracic,lumbar,sacrum,hip bone,rib,~thoracolumbar fascia|humerus
pectoralis minor|rib,costal cartilage|scapula
rectus abdominis|hip bone|xiphoid process,costal cartilage
rhomboideus major|thoracic|scapula
rhomboideus minor|cervical,thoracic,~nuchal ligament|scapula
posterior scalene|cervical|rib
middle scalene|cervical|rib
anterior scalene|cervical|rib
serratus anterior|rib|scapula
serratus posterior superior|cervical,thoracic,~nuchal ligament|rib
serratus posterior inferior|thoracic,lumbar,~thoracolumbar fascia|rib
sternocleidomastoid|manubrium,clavicle|temporal bone,occipital bone
subclavius|rib,costal cartilage|clavicle
subscapularis|scapula|humerus,~capsule
internal abdominal oblique|hip bone,inguinal ligament,~thoracolumbar fascia|rib,hip bone,~linea alba
anal sphincter, external|~perineal body|~anal canal,~coccyx
iliacus|hip bone,sacrum|femur
obturator internus|hip bone,~obturator membrane|femur
obturator externus|hip bone,~obturator membrane|femur
gluteus maximus|hip bone,sacrum,~coccyx,~sacrotuberous ligament|femur,iliotibial tract
gluteus medius|hip bone|femur
gluteus minimus|hip bone|femur
superior gemellus|hip bone|~obturator internus tendon,femur
inferior gemellus|hip bone|~obturator internus tendon,femur
quadratus femoris|hip bone|femur
piriformis|sacrum|femur
psoas major|thoracic,lumbar|femur
transversus abdominis|costal cartilage,hip bone,inguinal ligament,~thoracolumbar fascia|~linea alba,hip bone
pyramidalis|hip bone|~linea alba
quadratus lumborum|hip bone,~iliolumbar ligament|rib,lumbar
sartorius|hip bone|tibia
semitendinosus|hip bone|tibia
tensor fasciae latae|hip bone|iliotibial tract,tibia
semimembranosus|hip bone|tibia,~oblique popliteal ligament
pectineus|hip bone|femur
adductor brevis|hip bone|femur
adductor longus|hip bone|femur
adductor magnus|hip bone|femur
tibialis anterior|tibia,~interosseous membrane|medial cuneiform bone,first metatarsal bone
extensor hallucis longus|fibula,~interosseous membrane|distal phalanx of big toe
extensor digitorum longus|tibia,fibula,~interosseous membrane|~toe extensor expansions,toe middle,toe distal
fibularis (peroneus) tertius|fibula|fifth metatarsal bone
fibularis (peroneus) longus|fibula|medial cuneiform bone,first metatarsal bone
fibularis (peroneus) brevis|fibula|fifth metatarsal bone
soleus|fibula,tibia|calcaneal tendon,calcaneus
plantaris|femur|calcaneus
popliteus|femur|tibia
splenius cervicis|thoracic|cervical
splenius capitis|cervical,thoracic,~nuchal ligament|temporal bone,occipital bone
iliocostalis|hip bone,sacrum,lumbar,rib|rib,cervical
longissimus|hip bone,sacrum,lumbar,thoracic,cervical|thoracic,cervical,rib,temporal bone
spinalis|lumbar,thoracic,cervical,~nuchal ligament|thoracic,cervical
semispinalis|thoracic,cervical|thoracic,cervical,occipital bone
multifidus|sacrum,hip bone,lumbar,thoracic,cervical|lumbar,thoracic,cervical
rotatores|lumbar,thoracic,cervical|lumbar,thoracic,cervical
rectus capitis posterior major|axis|occipital bone
rectus capitis posterior minor|atlas|occipital bone
obliquus capitis superior|atlas|occipital bone
obliquus capitis inferior|axis|atlas
levator scapulae|cervical|scapula
supraspinatus|scapula|humerus,~capsule
infraspinatus|scapula|humerus,~capsule
teres major|scapula|humerus
teres minor|scapula|humerus,~capsule
trapezius|occipital bone,cervical,thoracic,~nuchal ligament|clavicle,scapula
deltoid|clavicle,scapula|humerus
pectoralis major|clavicle,sternum,costal cartilage,~abdominal aponeurosis|humerus
abductor pollicis brevis|scaphoid,trapezium,flexor retinaculum|proximal phalanx of thumb
opponens pollicis|trapezium,flexor retinaculum|first metacarpal bone
abductor digiti minimi (hand)|pisiform|proximal phalanx of little finger
flexor digiti minimi brevis (hand)|hamate,flexor retinaculum|proximal phalanx of little finger
opponens digiti minimi|hamate,flexor retinaculum|fifth metacarpal bone
abductor hallucis|calcaneus|proximal phalanx of big toe
flexor digitorum brevis|calcaneus,~plantar aponeurosis|toe middle
abductor digiti minimi (foot)|calcaneus|proximal phalanx of little toe
quadratus plantae|calcaneus,long plantar ligament|~flexor digitorum longus tendon
flexor digiti minimi brevis (foot)|fifth metatarsal bone|proximal phalanx of little toe
lumbricals (foot)|~flexor digitorum longus tendon|~toe extensor expansions,toe proximal
coracobrachialis|scapula|humerus
brachialis|humerus|ulna
biceps brachii|scapula,~glenoid labrum|radius,~bicipital aponeurosis
triceps brachii|humerus,scapula|ulna
anconeus|humerus|ulna
plantar interosseous|metatarsal|toe proximal,~toe extensor expansions
pronator quadratus|ulna|radius
flexor carpi radialis|humerus|second metacarpal bone,third metacarpal bone
palmaris longus|humerus|~palmar aponeurosis,flexor retinaculum
flexor digitorum profundus|ulna,~interosseous membrane|finger distal
flexor pollicis longus|radius,~interosseous membrane|distal phalanx of thumb
brachioradialis|humerus|radius
extensor carpi radialis longus|humerus|second metacarpal bone
extensor carpi radialis brevis|humerus|third metacarpal bone
extensor digitorum|humerus|~finger extensor expansions,finger middle,finger distal
extensor digiti minimi|humerus|~finger extensor expansions
supinator|humerus,ulna,~annular ligament,~radial collateral ligament|radius
abductor pollicis longus|radius,ulna,~interosseous membrane|first metacarpal bone
extensor pollicis brevis|radius,~interosseous membrane|proximal phalanx of thumb
extensor pollicis longus|ulna,~interosseous membrane|distal phalanx of thumb
extensor indicis|ulna,~interosseous membrane|~finger extensor expansions
pronator teres|humerus,ulna|radius
flexor carpi ulnaris|humerus,ulna|pisiform,hamate,fifth metacarpal bone
flexor digitorum superficialis|humerus,ulna,radius,~ulnar collateral ligament|finger middle
rectus femoris|hip bone|patella,~patellar ligament,tibia
vastus lateralis|femur|patella,~patellar ligament,tibia
vastus medialis|femur|patella,~patellar ligament,tibia
vastus intermedius|femur|patella,~patellar ligament,tibia
lumbrical (hand)|~flexor digitorum profundus tendon|~finger extensor expansions
palmar interosseous|metacarpal|finger proximal,~finger extensor expansions
dorsal interosseous (hand)|metacarpal|finger proximal,~finger extensor expansions
gracilis|hip bone|tibia
adductor minimus|hip bone|femur
platysma|~pectoral deltoid fascia|mandible,~skin
stylohyoid|temporal bone|hyoid bone
pubococcygeus|hip bone|~perineal body,~anococcygeal raphe,~coccyx
puborectalis|hip bone|~anorectal sling
iliococcygeus|hip bone,tendinous arch of levator ani|~anococcygeal raphe,~coccyx
biceps femoris|hip bone,femur|fibula,tibia
gastrocnemius|femur|calcaneal tendon,calcaneus
flexor hallucis brevis|cuboid bone,lateral cuneiform bone,~tibialis posterior tendon|sesamoid bone of foot,proximal phalanx of big toe
adductor hallucis|metatarsal,~deep transverse metatarsal ligament,~plantar plates|sesamoid bone of foot,proximal phalanx of big toe
flexor pollicis brevis|trapezium,trapezoid,capitate,flexor retinaculum|proximal phalanx of thumb,~hand sesamoid
adductor pollicis|capitate,metacarpal|proximal phalanx of thumb,~hand sesamoid
longus colli|cervical,thoracic|cervical
digastric|mandible,temporal bone|intermediate tendon,hyoid bone,~fibrous sling
longus capitis|cervical|occipital bone
rectus capitis anterior|atlas|occipital bone
rectus capitis lateralis|atlas|occipital bone
mylohyoid|mandible|hyoid bone,~mylohyoid raphe
geniohyoid|mandible|hyoid bone
coccygeus|hip bone|sacrum,~coccyx
frontalis|aponeurosis of epicranius|~skin
occipitalis|occipital bone,temporal bone|aponeurosis of epicranius
temporoparietalis|~temporal fascia|aponeurosis of epicranius
orbicularis oculi|frontal bone,maxilla,~medial palpebral ligament|~skin,~lateral palpebral raphe
corrugator|frontal bone|~skin
levator labii superioris alaque nasi|maxilla|~ala of nose,~skin
levator labii superioris|maxilla|~skin
zygomaticus major|zygomatic bone|~modiolus,~skin
zygomaticus minor|zygomatic bone|~skin
depressor labii inferioris|mandible|~skin
levator anguli oris|maxilla|~modiolus
mentalis|mandible|~skin
depressor anguli oris|mandible|~modiolus
buccinator|maxilla,mandible,~pterygomandibular raphe|~modiolus,~orbicularis oris
risorius|~parotid masseteric fascia|~modiolus,~skin
orbicularis oris|~perioral soft tissues|~skin
masseter|zygomatic bone,temporal bone|mandible
temporalis|frontal bone,parietal bone,temporal bone,sphenoid bone,~temporal fascia|mandible
medial pterygoid|sphenoid bone,palatine bone,maxilla|mandible
lateral pterygoid|sphenoid bone|mandible,~TMJ disc and capsule
extensor digitorum brevis|calcaneus|~toe extensor expansions
extensor hallucis brevis|calcaneus|proximal phalanx of big toe
nasalis|maxilla|~nasal aponeurosis,~ala of nose
depressor septi|maxilla|~nasal septum
procerus|nasal bone|~skin
flexor hallucis longus|fibula|distal phalanx of big toe
flexor digitorum longus|tibia|toe distal
tibialis posterior|tibia,fibula,~interosseous membrane|navicular bone of foot,medial cuneiform bone,intermediate cuneiform bone,lateral cuneiform bone,metatarsal
interspinales|cervical,thoracic,lumbar|cervical,thoracic,lumbar
intertransversarii|cervical,lumbar|cervical,lumbar
levatores costarum|cervical,thoracic|rib
dorsal interosseous (foot)|metatarsal|toe proximal
opponens digiti minimi of foot|cuboid bone,long plantar ligament|fifth metatarsal bone
external intercostal|rib|rib
internal intercostal|rib|rib
innermost intercostal|rib|rib
transversus thoracis|sternum|costal cartilage
extensor carpi ulnaris|humerus,ulna|fifth metacarpal bone
`;
export const attachmentTargets=Object.fromEntries(rows.trim().split('\n').map(l=>{const [key,o,i]=l.split('|');return [key,{origin:o.split(','),insertion:i.split(',')}];}));
// Use the selected head/segment's own origin, not every origin of its parent.
export function targetsFor(e){
 const source=attachmentTargets[e.base];if(!source)return null;const t={origin:[...source.origin],insertion:[...source.insertion]},key=e.key;
 const partOrigins={
  'short head of biceps brachii':['scapula'],'long head of biceps brachii':['scapula','~glenoid labrum'],
  'long head of triceps brachii':['scapula'],'lateral head of triceps brachii':['humerus'],'medial head of triceps brachii':['humerus'],
  'clavicular part of deltoid':['clavicle'],'acromial part of deltoid':['scapula'],'spinal part of deltoid':['scapula'],
  'clavicular part of pectoralis major':['clavicle'],'sternocostal part of pectoralis major':['sternum','costal cartilage'],'abdominal part of pectoralis major':['~abdominal aponeurosis'],
  'descending part of trapezius':['occipital bone','~nuchal ligament'],'transverse part of trapezius':['cervical','thoracic'],'ascending part of trapezius':['thoracic'],
  'long head of biceps femoris':['hip bone'],'short head of biceps femoris':['femur'],
  'humeral head of pronator teres':['humerus'],'ulnar head of pronator teres':['ulna'],
  'humeral head of flexor carpi ulnaris':['humerus'],'ulnar head of flexor carpi ulnaris':['ulna'],
  'humeral head of extensor carpi ulnaris':['humerus'],'ulnar head of extensor carpi ulnaris':['ulna'],
  'humeroulnar head of flexor digitorum superficialis':['humerus','ulna','~ulnar collateral ligament'],'radial head of flexor digitorum superficialis':['radius'],
  'superficial head of flexor pollicis brevis':['trapezium','flexor retinaculum'],'deep head of flexor pollicis brevis':['trapezoid','capitate'],
  'oblique head of adductor pollicis':['capitate','second metacarpal bone','third metacarpal bone'],'transverse head of adductor pollicis':['third metacarpal bone'],
  'oblique head of adductor hallucis':['second metatarsal bone','third metatarsal bone','fourth metatarsal bone','~fibularis longus tendon sheath'],'transverse head of adductor hallucis':['~deep transverse metatarsal ligament','~plantar plates'],
  'anterior belly of digastric':['mandible'],'posterior belly of digastric':['temporal bone'],
  'palpebral part of orbicularis oculi':['~medial palpebral ligament'],
  'superior oblique part of longus colli':['cervical'],'vertical intermediate part of longus colli':['cervical','thoracic'],'inferior oblique part of longus colli':['thoracic'],
 };
 if(partOrigins[key])t.origin=partOrigins[key];
 if(e.base==='trapezius')t.insertion=[key.startsWith('descending')?'clavicle':'scapula'];
 if(key.startsWith('palpebral'))t.insertion=['~lateral palpebral raphe'];if(key.startsWith('orbital'))t.insertion=['~skin'];
 if(e.base==='longissimus'){t.origin=key.includes('thoracis')?['hip bone','sacrum','lumbar']:key.includes('capitis')?['thoracic','cervical']:['thoracic'];t.insertion=key.includes('capitis')?['temporal bone']:key.includes('cervicis')?['cervical']:['thoracic','rib'];}
 if(e.base==='iliocostalis'){t.origin=key.includes('lumborum')?['hip bone','sacrum','lumbar']:['rib'];t.insertion=key.includes('cervicis')?['cervical']:key.includes('thoracis')?['rib','cervical']:['rib','lumbar'];}
 if(e.base==='semispinalis'){t.origin=key.includes('capitis')?['thoracic','cervical']:['thoracic'];t.insertion=key.includes('capitis')?['occipital bone']:key.includes('cervicis')?['cervical']:['thoracic','cervical'];}
 if(e.base==='spinalis'){t.origin=key.includes('cervicis')?['cervical','~nuchal ligament']:['thoracic','lumbar'];t.insertion=key.includes('cervicis')?['cervical']:['thoracic'];}
 if(['rotatores','interspinales','intertransversarii'].includes(e.base)){const segment=/cervic/.test(key)?'cervical':/lumb/.test(key)?'lumbar':'thoracic';t.origin=[segment];t.insertion=[segment];}
 if(e.base==='levatores costarum'&&key.includes('longi'))t.origin=['thoracic'];
 if(e.base==='palmar interosseous'){t.origin=['second metacarpal bone','fourth metacarpal bone','fifth metacarpal bone'];t.insertion=['proximal phalanx of index finger','proximal phalanx of ring finger','proximal phalanx of little finger','~finger extensor expansions'];}
 if(e.base==='dorsal interosseous (hand)')t.insertion=['proximal phalanx of index finger','proximal phalanx of middle finger','proximal phalanx of ring finger','~finger extensor expansions'];
 if(e.base==='dorsal interosseous (foot)')t.insertion=['proximal phalanx of second toe','proximal phalanx of third toe','proximal phalanx of fourth toe','~toe extensor expansions'];
 if(e.base==='lumbricals (foot)'){const n={first:'second',second:'third',third:'fourth',fourth:'little'}[key.split(' ')[0]];t.insertion=[`proximal phalanx of ${n} toe`,'~toe extensor expansions'];}
 if(e.base==='plantar interosseous'){const n={first:['third','third'],second:['fourth','fourth'],third:['fifth','little']}[key.split(' ')[0]];t.origin=[`${n[0]} metatarsal bone`];t.insertion=[`proximal phalanx of ${n[1]} toe`,'~toe extensor expansions'];}
 return t;
}
export function matchesTarget(target,r,side){
 if(target.startsWith('~')||r.kind==='muscle'||(side!=='midline'&&r.side!=='midline'&&r.side!==side))return false;
 const n=r.name.replace(/\b(left|right)\s*/g,'').trim();
 if(target==='cervical')return /cervical vertebra|^atlas$|^axis$/.test(n);
 if(target==='thoracic'||target==='lumbar')return n.includes(target+' vertebra');
 if(target==='rib')return /\brib$/.test(n);
 if(target==='sternum')return ['manubrium','body of sternum','xiphoid process'].includes(n);
 if(target==='metacarpal'||target==='metatarsal')return n.includes(target+' bone');
 if(target==='flexor retinaculum')return n==='flexor retinaculum of wrist';
 const digit=target.match(/^(finger|toe) (proximal|middle|distal)$/);
 if(digit)return n.startsWith(digit[2]+' phalanx of ')&&(digit[1]==='finger'?/finger$/.test(n):/toe$/.test(n)&&!n.includes('big toe'));
 return target===n;
}
