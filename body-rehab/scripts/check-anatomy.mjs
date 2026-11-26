import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const data = await readFile(new URL('anatomy-data.js', root), 'utf8');
const html = await readFile(new URL('movement-reference.html', root), 'utf8');
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n');
new vm.Script(data);
new vm.Script(inline);
const context = vm.createContext({});
vm.runInContext(data + '\n' + inline.slice(0, inline.indexOf("const SVGNS =")), context);
const { structures, exercises, sports, profiles, sources, plates } = vm.runInContext('({ structures: STRUCTS, exercises: EXERCISES, sports: SPORTS, profiles: ANATOMY, sources: ANATOMY_SOURCES, plates: ATLAS })', context);
const ids = new Set(structures.map(st => st.id));
assert.equal(ids.size, structures.length, 'Structure IDs must be unique');
assert.equal(new Set(plates.map(p => p.id)).size, plates.length, 'Atlas IDs must be unique');
for (const st of structures.filter(st => st.kind === '肌肉')) {
  const profile = profiles[st.id];
  assert(profile, `Missing anatomy profile: ${st.id}`);
  for (const field of ['origin', 'insertion', 'nerve', 'fibers', 'relations', 'action', 'distinction']) assert(profile[field]?.trim(), `${st.id}: missing ${field}`);
  assert(profile.sources.length, `${st.id}: missing references`);
  for (const source of profile.sources) assert(sources[source]?.[1].startsWith('https://'), `Invalid source: ${source}`);
  assert(plates.some(plate => plate.id === profile.atlas), `Missing atlas for ${st.id}`);
  assert.equal(st.does, profile.action, 'Legacy content must use the anatomy data');
}
for (const item of exercises) for (const field of ['p', 's', 'w', 'x']) for (const id of item[field] || []) assert(ids.has(id), `Exercise ${item.id}: unknown ${id}`);
for (const sport of sports) {
  for (const id of [...sport.t, ...sport.u, ...sport.problems.flatMap(p => p.areas)]) assert(ids.has(id), `Sport ${sport.id}: unknown ${id}`);
}
assert.equal(profiles.quadriceps.members.length, 4);
assert(profiles.hamstrings.distinction.includes('短頭不跨髖'));
assert(profiles['int-oblique'].relations.includes('中間層'));
assert(!structures.find(st => st.id === 'erector').s, 'Erector spinae must not be depicted as a skin-level surface');
assert(exercises.find(ex => ex.id === 'scaption').s.includes('trap-upper'));
assert(!exercises.find(ex => ex.id === 'scaption').w?.includes('trap-upper'));
const manifest = JSON.parse(await readFile(new URL('assets/anatomy/manifest.json', root), 'utf8'));
for (const plate of plates) {
  const record = manifest.find(r => r.id === plate.id);
  assert(record, `Missing downloaded plate ${plate.id}`);
  assert.equal(record.license, plate.license);
  assert.equal(record.title, plate.title);
  const bytes = await readFile(new URL(`assets/anatomy/${record.file}`, root));
  assert.equal(bytes[0], 0xff, `${record.file}: not JPEG`);
  assert.equal(bytes[1], 0xd8, `${record.file}: not JPEG`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256, `${record.file}: checksum mismatch`);
}
console.log(`Passed: ${Object.keys(profiles).length} muscle profiles, ${exercises.length} exercises, ${sports.length} sports, ${plates.length} licensed atlas images. JavaScript syntax, source coverage, references and asset checksums verified.`);
