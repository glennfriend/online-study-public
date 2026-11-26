import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {zipEntries,unzipEntry,parseOBJ} from './bp3d-utils.mjs';
import {identify} from '../muscle-catalogue.mjs';
const root=new URL('../',import.meta.url),out=new URL('assets/body-model/',root),sha=b=>createHash('sha256').update(b).digest('hex');
const m=JSON.parse(await readFile(new URL('manifest.json',out))),k=JSON.parse(await readFile(new URL('knowledge.json',out)));
const chunks=[];for(const f of m.files){const b=await readFile(new URL(f.file,out));assert.equal(b.length,f.bytes);assert.equal(sha(b),f.sha256);assert(b.length<50*1024*1024);chunks.push(b);}const packed=Buffer.concat(chunks);assert.equal(sha(packed),m.sha256);const binary=gunzipSync(packed);assert.equal(binary.length,m.bytes);
const source=await readFile(new URL('.anatomy-cache/bp3d3/BodyParts3D_3.0_obj_99.zip',root)),zip=zipEntries(source);assert.equal(sha(source),m.source.archiveSha256);assert.equal(new Set(m.records.map(r=>r.mesh)).size,m.records.length);
let triangles=0;for(const r of m.records){const entry=[...zip.values()].find(e=>e.name.endsWith(r.mesh+'.obj'));assert(entry,`Missing source ${r.mesh}`);const bytes=unzipEntry(source,entry);assert.equal(sha(bytes),r.sha256);const original=parseOBJ(bytes.toString());assert.equal(r.vertexCount,original.vertices.length/3);assert.equal(r.indexCount,original.faces.length);assert.deepEqual(r.bounds,[original.min,original.max]);for(let i=0;i<original.vertices.length;i++)assert.equal(binary.readFloatLE(r.vertexOffset+Math.floor(i/3)*16+i%3*4),Math.fround(original.vertices[i]),`Moved vertex ${r.mesh}:${i}`);for(let i=0;i<original.faces.length;i++)assert.equal(binary.readUInt32LE(r.indexOffset+i*4),original.faces[i],`Changed triangle ${r.mesh}:${i}`);triangles+=r.indexCount/3;
 if(r.kind==='muscle'){const p=k.entries[identify(r.name).key];assert(p,`No data ${r.name}`);assert(/[\u3400-\u9fff]/.test(p.zh),`Missing Chinese label ${r.name}`);for(const f of ['origin','insertion','nerve','action'])assert(p[f]?.trim(),`Missing ${f} ${r.name}`);if(p.scope==='part')for(const f of ['partOrigin','partInsertion','partNerve','partAction'])assert(p[f]?.trim(),`Missing subdivision ${f} ${r.name}`);for(const s of p.sources)assert(k.sources[s]?.[1].startsWith('https://'));assert.equal(r.release,'3.0');if(r.side!=='midline')assert((r.bounds[0][0]+r.bounds[1][0])*(r.side==='right'?-1:1)>0,`Wrong source side ${r.name}`);}}
assert.equal(triangles,m.triangles);
for(const name of ['rectus abdominis','external oblique','internal oblique','transversus abdominis','quadratus lumborum','multifidus','latissimus dorsi','rectus femoris','vastus intermedius','tensor fasciae latae','soleus','tibialis anterior'])for(const side of ['right','left'])assert(m.records.some(r=>r.kind==='muscle'&&r.name===`${side} ${name}`),`Missing ${side} ${name}`);
assert(k.entries['short head of biceps femoris'].partAction.includes('不跨髖'));
assert(k.entries['extensor carpi radialis brevis'].origin.includes('外上髁'));
assert(k.entries['extensor carpi radialis longus'].nerve.includes('分為淺、深支前'));
assert.equal(k.entries['set of lumbricals of hand'].scope,'group');
console.log(`Passed: ${m.records.length} original source meshes / ${triangles} unchanged triangles; ${Object.keys(k.entries).length} sourced anatomy entries; all vertex coordinates, topology, hashes, sides and part-specific fields verified.`);
