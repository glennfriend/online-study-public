// Lossless delivery split. Invisible boxes enclose every assigned triangle;
// they only decide loading, and are never displayed as anatomical surfaces.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gunzipSync,gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const dir=new URL('../assets/body-model/',import.meta.url),m=JSON.parse(await readFile(new URL('manifest.json',dir))),raw=gunzipSync(Buffer.concat(await Promise.all(m.files.map(f=>readFile(new URL(f.file,dir)))))),sha=b=>createHash('sha256').update(b).digest('hex');
await mkdir(new URL('meshes/',dir),{recursive:true});let bytes=0;
for(const r of m.records){
 const vb=raw.subarray(r.vertexOffset,r.vertexOffset+r.vertexCount*16),ib=raw.subarray(r.indexOffset,r.indexOffset+r.indexCount*4),body=Buffer.concat([vb,ib]),packed=gzipSync(body,{level:9}),hash=sha(packed),file=`meshes/${r.mesh}-${hash.slice(0,12)}.bin.gz`;
 await writeFile(new URL(file,dir),packed);bytes+=packed.length;r.stream={file,bytes:packed.length,rawBytes:body.length,sha256:hash};
 const groups=new Map(),[lo,hi]=r.bounds;
 for(let face=0;face<r.indexCount;face+=3){const vertices=[0,1,2].map(j=>ib.readUInt32LE((face+j)*4)),center=[0,1,2].map(a=>vertices.reduce((n,i)=>n+vb.readFloatLE(i*16+a*4),0)/3),cell=center.map((v,a)=>Math.min(3,Math.max(0,Math.floor((v-lo[a])/Math.max(hi[a]-lo[a],1e-9)*4)))).join(',');
  if(!groups.has(cell))groups.set(cell,[[Infinity,Infinity,Infinity],[-Infinity,-Infinity,-Infinity]]);const bounds=groups.get(cell);for(const i of vertices)for(let a=0;a<3;a++){const v=vb.readFloatLE(i*16+a*4);bounds[0][a]=Math.min(bounds[0][a],v);bounds[1][a]=Math.max(bounds[1][a],v);}
 }
 r.loadingBounds=[...groups.values()];
}
m.streaming={version:1,bytes,objects:m.records.length,encoding:'independent gzip; unchanged packed vertex and index bytes',proxy:'4x4x4 centroid groups, boxes enclose all triangle vertices; loading queries only'};
await writeFile(new URL('manifest.json',dir),JSON.stringify(m));console.log(`Split ${m.records.length} exact meshes: ${bytes} compressed bytes; geometry digest ${m.sha256} retained.`);
