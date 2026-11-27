import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),out=new URL('../assets/thigh-source/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('manifest.json',out),'utf8'));
const records=new Map(manifest.meshes.map(mesh=>[mesh.objectId,mesh]));
assert.equal(records.size,manifest.meshes.length);
assert.equal(manifest.meshes.filter(mesh=>mesh.target).length,8);
assert.equal(manifest.sourceArchiveSha256,'40665852c49f218326590e204db91064a1ecfc3c6f8cbd7bbbcaac62c7cd409e');
for(const target of manifest.targets)for(const side of ['right','left']){
 const mesh=manifest.meshes.find(mesh=>mesh.target===target.key&&mesh.side===side);
 assert(mesh,`${target.key}: missing ${side}`);
 assert(mesh.name.startsWith(side+' '),`Laterality mismatch for ${mesh.meshId}`);
 if(side==='right')assert(mesh.bounds[1][0]<0,'Patient right must be source negative X');
 else assert(mesh.bounds[0][0]>0,'Patient left must be source positive X');
}
function decode(bytes){
 assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20),idat=[];
 for(let cursor=8;cursor<bytes.length;){const n=bytes.readUInt32BE(cursor);if(bytes.toString('ascii',cursor+4,cursor+8)==='IDAT')idat.push(bytes.subarray(cursor+8,cursor+8+n));cursor+=n+12;}
 const raw=inflateSync(Buffer.concat(idat));
 assert.equal(raw.length,(width*4+1)*height);
 for(let y=0;y<height;y++)assert.equal(raw[y*(width*4+1)],0);
 return {width,height,raw};
}
const observations={};
for(const frame of manifest.frames){
 const pictureBytes=await readFile(new URL(frame.image,out)),maskBytes=await readFile(new URL(frame.ids,out));
 assert.equal(createHash('sha256').update(pictureBytes).digest('hex'),frame.imageSha256);
 assert.equal(createHash('sha256').update(maskBytes).digest('hex'),frame.idsSha256);
 const image=decode(pictureBytes),mask=decode(maskBytes);
 assert.equal(image.width,manifest.width);assert.equal(image.height,manifest.height);
 assert.equal(mask.width,image.width);assert.equal(mask.height,image.height);
 const counts={};let bodyPixels=0;
 for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++){
  const offset=y*(image.width*4+1)+1+x*4,id=mask.raw[offset]+mask.raw[offset+1]*256;
  assert.equal(id!==0,image.raw[offset+3]!==0,'Picking silhouette must match image alpha at every pixel');
  if(id){assert(records.has(id));bodyPixels++;const key=records.get(id).target;if(key)counts[key]=(counts[key]||0)+1;}
 }
 assert(bodyPixels>100000,'Full-body context missing');
 observations[frame.view+'-'+frame.layer]=counts;
 for(const [target,count] of Object.entries(counts))assert.equal(count,frame.visibleTargets[target].pixels);
}
assert(!observations['front-deep']['rectus-femoris'],'Hidden rectus femoris must not be clickable');
assert(observations['front-deep']['vastus-intermedius']>observations['front-surface']['vastus-intermedius']*50,'Deep view must expose the actual underlying muscle');
assert(observations['front-deep']['vastus-lateralis']>0&&observations['front-deep']['vastus-medialis']>0,'Adjacent muscles must remain');
const html=await readFile(new URL('thigh-source-preview.html',root),'utf8');
for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
new vm.Script(await readFile(new URL('model-data.js',out),'utf8'));
assert(html.includes('src="offline-cache.js"'),'The pilot also retires old project caches when opened directly');
const worker=await readFile(new URL('sw.js',root),'utf8');
assert(!worker.includes("addEventListener('fetch'")&&!worker.includes('.addAll(')&&!worker.includes('.put('),'The shared retirement helper must not install or update an offline cache');
console.log(`Passed: ${records.size} source meshes, 8 sided quadriceps structures, 4 image/mask pairs; all visible pixels agree with source object IDs; side orientation, deep occlusion, checksums and script syntax verified.`);
