// Explicit semantic links to available source objects. Missing ligaments are
// not replaced with approximate polygons or neighbouring whole bones.
export const muscleLinks={
 erector:['iliocostalis','longissimus','spinalis'],multifidus:['multifidus'],quadratus:['quadratus lumborum'],lats:['latissimus dorsi'],triceps:['triceps brachii'],biceps:['biceps brachii'],rhomboids:['rhomboideus major','rhomboideus minor'],levator:['levator scapulae'],supraspinatus:['supraspinatus'],infraspinatus:['infraspinatus'],'teres-minor':['teres minor'],'teres-major':['teres major'],subscapularis:['subscapularis'],
 scm:['sternocleidomastoid'],'deep-neck-flexors':['longus colli','longus capitis'],'pec-minor':['pectoralis minor'],'pec-major':['pectoralis major'],serratus:['serratus anterior'],transversus:['transversus abdominis'],'ext-oblique':['external abdominal oblique'],'int-oblique':['internal abdominal oblique'],'rectus-abd':['rectus abdominis'],iliopsoas:['iliacus','psoas major'],
 'forearm-flex':['flexor carpi radialis','flexor carpi ulnaris','palmaris longus','flexor digitorum superficialis','flexor digitorum profundus','flexor pollicis longus'],
 'forearm-ext':['extensor carpi radialis longus','extensor carpi radialis brevis','extensor carpi ulnaris','extensor digitorum','extensor digiti minimi','extensor indicis','extensor pollicis longus','extensor pollicis brevis'],
 'glute-med':['gluteus medius'],piriformis:['piriformis'],'glute-max':['gluteus maximus'],hamstrings:['biceps femoris','semitendinosus','semimembranosus'],tfl:['tensor fasciae latae'],adductors:['adductor longus','adductor brevis','adductor magnus','adductor minimus','gracilis','pectineus'],quadriceps:['rectus femoris','vastus lateralis','vastus medialis','vastus intermedius'],'tibialis-ant':['tibialis anterior'],peroneals:['fibularis (peroneus) longus','fibularis (peroneus) brevis'],soleus:['soleus'],gastroc:['gastrocnemius'],
};
export const partLinks={'trap-upper':['descending part of trapezius'],'trap-middle':['transverse part of trapezius'],'trap-lower':['ascending part of trapezius'],'delt-ant':['clavicular part of deltoid'],'delt-mid':['acromial part of deltoid'],'delt-post':['spinal part of deltoid']};
export function matchesStructure(id,r){if(r.kind==='muscle')return muscleLinks[id]?.includes(r.identity.base)||partLinks[id]?.includes(r.identity.key)||false;
 const name=r.name.replace(/\b(left|right)\s*/g,'').trim();
 if(id==='sternum')return ['sternum','manubrium','body of sternum','xiphoid process'].includes(name);
 const exact={sternum:'sternum',clavicle:'clavicle',scapula:'scapula',humerus:'humerus',sacrum:'sacrum',femur:'femur',patella:'patella',tibia:'tibia',fibula:'fibula',calcaneus:'calcaneus',achilles:'calcaneal tendon','it-band':'iliotibial tract'};
 if(exact[id])return name===exact[id];
 if(id==='forearm-bones')return ['ulna','radius'].includes(name);
 if(id==='ribs')return /\brib$/.test(name);
 if(id==='pelvis')return name==='hip bone';
 if(id==='cervical')return /cervical vertebra|^atlas$|^axis$/.test(name);
 if(id==='thoracic')return /thoracic vertebra/.test(name);
 if(id==='lumbar')return /lumbar vertebra/.test(name);
 return false;
}
export const mappingNotes={acromion:'肩峰是肩胛骨的一部分；目前沒有獨立肩峰模型。',acl:'目前來源未納入可獨立點選的前十字韌帶。','knee-mcl':'目前來源未納入可獨立點選的膝內側副韌帶。','ankle-lat-lig':'目前來源未納入可獨立點選的踝外側韌帶群。','patellar-tendon':'目前來源未納入可獨立點選的髕韌帶／髕腱。','plantar-fascia':'目前來源未納入可獨立點選的足底腱膜。'};
