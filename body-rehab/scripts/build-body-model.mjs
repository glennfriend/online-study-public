// Package the source vertices and topology, without re-positioning anatomy.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { zipEntries, unzipEntry, parseOBJ } from './bp3d-utils.mjs';
import { identify } from '../muscle-catalogue.mjs';
import { readMuscleTable } from './read-muscle-table.mjs';
const root=new URL('../',import.meta.url), cache=new URL('.anatomy-cache/bp3d/',root), out=new URL('assets/body-model/',root);
await mkdir(out,{recursive:true});
const sha=b=>createHash('sha256').update(b).digest('hex');
const mappingBytes=await readFile(new URL('isa_element_parts.txt',cache));
if(sha(mappingBytes)!=='a3de74423f943b0d724ae8f59b3a817f87c423a544f8db98113b1980817cbeaf')throw Error('Classification table checksum changed');
const rows=mappingBytes.toString('utf8').trim().split(/\r?\n/).slice(1).map(l=>l.split('\t'));
const concepts=new Map(), byMesh=new Map();
for(const [fma,name,mesh]of rows){if(!concepts.has(fma))concepts.set(fma,{fma,name,meshes:[]});concepts.get(fma).meshes.push(mesh);if(!byMesh.has(mesh))byMesh.set(mesh,[]);byMesh.get(mesh).push(concepts.get(fma));}
const bones=new Set(concepts.get('FMA5018').meshes);
const chunks=[],records=[];
const archive3=await readFile(new URL('.anatomy-cache/bp3d3/BodyParts3D_3.0_obj_99.zip',root)),zip3=zipEntries(archive3);
const namesBytes=await readFile(new URL('.anatomy-cache/bp3d3/parts_list_e.txt',root));if(sha(namesBytes)!=='824a34ed939a53375037d0d68b88ad2b63b1f0ae15a585632af2a63c2ab2e4af')throw Error('Source names changed');
const names3=new Map(namesBytes.toString('utf8').trim().split(/\r?\n/).slice(1).map(l=>l.split('\t')));
if(sha(archive3)!=='2125f6d761b14ead4ee64f71713f56f3f0f29982693ff20aac63474470cb92f4')throw Error('3.0 source checksum changed');
// The source parts list orders its musculoskeletal concepts together. Start
// with the named skeletal muscles, excluding fascia / tendons / compartments,
// then expand the official composite relationships to the actual leaf objects.
const muscleConcepts=new Set([...names3].slice(194,459).filter(([id,name])=>!/(tendon|aponeurosis|fascia|linea alba|retinaculum|compartment|iliotibial)/.test(name)).map(([id])=>id));
const relationBytes=await readFile(new URL('.anatomy-cache/bp3d3/composite_parts.txt',root));if(sha(relationBytes)!=='17cd3611eb6b46558f983f890273fdb19f93806150ed95f6611acf4b81e90bc2')throw Error('Source relationships changed');
const relations=relationBytes.toString('utf8').trim().split(/\r?\n/).slice(1).map(l=>l.split('\t'));
let grew=true;while(grew){grew=false;for(const [parent,,child]of relations)if(muscleConcepts.has(parent)&&!muscleConcepts.has(child)){muscleConcepts.add(child);grew=true;}}
const boneConcepts=new Set([...concepts.values()].filter(c=>c.meshes.every(id=>bones.has(id))).map(c=>c.fma));
const tableNames=new Set((await readMuscleTable(new URL('.anatomy-cache/knowledge/ttuhsc.html',root))).map(row=>row.name));
// Several standalone source objects (e.g. rectus abdominis) are absent from
// composite relationships. Include exact, explicitly aliased muscle names too.
const items=[...zip3.values()].flatMap(e=>{const id=e.name.match(/(FMA\d+)\.obj$/)?.[1],name=names3.get(id),kind=boneConcepts.has(id)?'bone':name&&(muscleConcepts.has(id)||tableNames.has(identify(name).base))?(/\b(tendon|aponeurosis|fascia|retinaculum|iliotibial|ligament|tendinous)\b|linea alba/.test(name)?'context':'muscle'):null;return name&&kind?[{id,c:{fma:id,name},bytes:unzipEntry(archive3,e),release:'3.0',kind}]:[];});
let offset=0,maxRounding=0,totalTriangles=0;
for(const [i,item]of items.entries()){
  const {id,release}=item;
  const bytes=item.bytes,m=parseOBJ(bytes.toString('utf8')),c=item.c;
  const normals=new Float64Array(m.vertices.length),v=m.vertices;
  for(let f=0;f<m.faces.length;f+=3){const a=m.faces[f]*3,b=m.faces[f+1]*3,d=m.faces[f+2]*3;const u=[v[b]-v[a],v[b+1]-v[a+1],v[b+2]-v[a+2]],w=[v[d]-v[a],v[d+1]-v[a+1],v[d+2]-v[a+2]];const n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];for(const p of[a,b,d])for(let j=0;j<3;j++)normals[p+j]+=n[j];}
  const vb=Buffer.alloc(v.length/3*16),ib=Buffer.from(m.faces.buffer);
  for(let p=0;p<v.length;p+=3){const length=Math.hypot(...normals.subarray(p,p+3))||1;for(let j=0;j<3;j++){vb.writeFloatLE(v[p+j],p/3*16+j*4);vb.writeInt8(Math.round(normals[p+j]/length*127),p/3*16+12+j);maxRounding=Math.max(maxRounding,Math.abs(v[p+j]-vb.readFloatLE(p/3*16+j*4)));}}
  const r={id:i+1,mesh:id,fma:c.fma,name:c.name,release,kind:item.kind,side:/\bright\b/.test(c.name)?'right':/\bleft\b/.test(c.name)?'left':'midline',bounds:[m.min,m.max],vertexOffset:offset,vertexCount:v.length/3,indexOffset:offset+vb.length,indexCount:m.faces.length,sha256:sha(bytes)};
  records.push(r);chunks.push(vb,ib);offset+=vb.length+ib.length;totalTriangles+=m.faces.length/3;
}
const binary=Buffer.concat(chunks),packed=gzipSync(binary,{level:9});
const files=[];for(let start=0;start<packed.length;start+=14_000_000){const bytes=packed.subarray(start,start+14_000_000),file=`geometry-${files.length}.gzpart`;await writeFile(new URL(file,out),bytes);files.push({file,bytes:bytes.length,sha256:sha(bytes)});}
const manifest={version:1,format:{stride:16,position:'float32 xyz',normal:'normalized int8 xyz + padding',indices:'uint32, mesh-local',byteOrder:'little-endian',maxCoordinateRounding:maxRounding},bytes:binary.length,packedBytes:packed.length,sha256:sha(packed),triangles:totalTriangles,records};
manifest.source={title:'BodyParts3D 3.0 (OBJ 99%)',url:'https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/',archive:'BodyParts3D_3.0_obj_99.zip',archiveSha256:sha(archive3),license:'CC BY-SA 2.1 Japan',licenseUrl:'https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en',credit:'BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan',transform:'Identity: original source coordinates; no fitting, mirroring or re-positioning'};
manifest.files=files;
await writeFile(new URL('manifest.json',out),JSON.stringify(manifest));
console.log(JSON.stringify({meshes:records.length,muscles:records.filter(r=>r.kind==='muscle').length,bytes:packed.length,maxRounding,triangles:totalTriangles}));
await writeFile(new URL('.anatomy-cache/modeled-names.json',root),JSON.stringify([...new Set(records.filter(r=>r.kind==='muscle').map(r=>r.name.replace(/\b(right|left)\s*/g,'').trim()))].sort(),null,2));
