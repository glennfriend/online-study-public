// Regression checks for the recorded literature findings and UI data links.
// These checks do not establish anatomical correctness; see the cited review.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {identify} from '../muscle-catalogue.mjs';
import {matchesStructure,mappingNotes} from '../movement-mapping.mjs';
import {modelConceptCorrections} from '../model-concept-corrections.mjs';
const root=new URL('../',import.meta.url),read=async f=>JSON.parse(await readFile(new URL('assets/body-model/'+f+'.json',root))),k=await read('knowledge'),audit=await read('anatomy-review-log'),movement=await read('movement'),model=await read('manifest');
assert.equal(Object.keys(k.entries).length,audit.entries.length);assert.equal(audit.entries.length,219);assert.equal(movement.exercises.length,24);assert.equal(movement.sports.length,9);
for(const e of Object.values(k.entries)){assert(e.position&&e.region&&e.review.date);for(const f of ['position','origin','insertion','nerve','action']){assert(e[f]);assert(e.fieldSources[f]?.length);for(const id of e.fieldSources[f])assert(k.sources[id]?.[1].startsWith('https://'));}}
assert(k.entries.thyrohyoid.nerve.includes('C1'));assert(k.entries.thyrohyoid.nerve.includes('不是頸袢'));assert(k.entries.sternothyroid.action.includes('喉'));assert(k.entries['serratus posterior superior'].insertion.includes('第二至第五'));assert(k.entries['vastus lateralis'].insertion.includes('外側髕支持帶'));assert(!k.entries['vastus lateralis'].insertion.includes('內側髕支持帶'));
assert(k.entries['flexor hallucis longus'].action.includes('唯一'));assert(k.entries['spinal part of deltoid'].action.includes('伸肩'));assert(k.entries['medial head of triceps brachii'].action.includes('不跨肩'));assert(k.entries['set of levatores costarum longi'].insertion.includes('跨過一條肋骨'));
for(const r of model.records){if(r.kind==='muscle')r.identity=identify(r.name);if(modelConceptCorrections[r.mesh]){assert.equal(r.sourceFma,r.mesh);assert.equal(r.name,modelConceptCorrections[r.mesh].name);assert(r.sourceName&&r.conceptCorrection);}}
assert.equal(model.records.filter(r=>/^BP4[4-7]$/.test(r.mesh)).length,4);
const ids=new Set(movement.structures.map(s=>s.id));for(const e of movement.exercises)for(const field of ['p','s','w','x'])for(const id of e[field]||[])assert(ids.has(id));for(const s of movement.sports)for(const id of [...s.t,...s.u,...s.problems.flatMap(p=>p.areas)])assert(ids.has(id));
for(const s of movement.structures){const records=model.records.filter(r=>matchesStructure(s.id,r));if(!records.length)assert(mappingNotes[s.id],`Unexplained missing structure ${s.id}`);if(s.kind==='肌肉')assert(records.some(r=>r.kind==='muscle'),`Missing restored muscle group ${s.id}`);}
for(const id of ['acl','knee-mcl','ankle-lat-lig','patellar-tendon','plantar-fascia','acromion'])assert(!model.records.some(r=>matchesStructure(id,r)),`${id} must not highlight a substitute bone`);
assert(!model.records.filter(r=>matchesStructure('peroneals',r)).some(r=>r.identity?.base.includes('tertius')));
console.log(`Passed: ${audit.entries.length} recorded literature reviews; 24 exercises / 9 sports / 66 structure links; known corrections, source references, BP muscle heads, concept provenance and missing-model labels preserved.`);
