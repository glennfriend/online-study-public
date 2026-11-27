// Exact-source orthographic overview + source ID map. This is a fast first
// view of the SAME body, not a replacement for the detailed streamed meshes.
import {readFile,writeFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {png} from './bp3d-utils.mjs';
const dir=new URL('../assets/body-model/',import.meta.url),m=JSON.parse(await readFile(new URL('manifest.json',dir))),raw=gunzipSync(Buffer.concat(await Promise.all(m.files.map(f=>readFile(new URL(f.file,dir)))))),W=700,H=1680,lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity],sha=b=>createHash('sha256').update(b).digest('hex');
for(const r of m.records)for(let a=0;a<3;a++){lo[a]=Math.min(lo[a],r.bounds[0][a]);hi[a]=Math.max(hi[a],r.bounds[1][a]);}const cx=(lo[0]+hi[0])/2,cz=(lo[2]+hi[2])/2,s=Math.min((W-24)/(hi[0]-lo[0]),(H-36)/(hi[2]-lo[2])),views={};
for(const side of ['front','back']){
 const direction=side==='front'?1:-1,depth=new Float64Array(W*H).fill(Infinity),color=new Uint8Array(W*H*4),mask=new Uint8Array(W*H*4);for(let i=0;i<W*H;i++){color.set([255,253,248,255],i*4);mask[i*4+3]=255;}
 for(const r of m.records){const vertices=new Float64Array(r.vertexCount*5),base=r.kind==='bone'?[.90,.88,.81]:r.kind==='context'?[.86,.83,.71]:[.75+((r.id*17)%13)/160,.47+((r.id*17)%13)/160,.40+((r.id*17)%13)/160];
  for(let i=0;i<r.vertexCount;i++){const offset=r.vertexOffset+i*16,x=raw.readFloatLE(offset),y=raw.readFloatLE(offset+4),z=raw.readFloatLE(offset+8),n=[raw.readInt8(offset+12)/127,raw.readInt8(offset+13)/127,raw.readInt8(offset+14)/127],length=Math.hypot(...n)||1;vertices.set([W/2+direction*(x-cx)*s,H/2-(z-cz)*s,direction*y,.55+.45*Math.max(0,(-.22*direction*n[0]-.88*direction*n[1]+.42*n[2])/(length*Math.hypot(.22,.88,.42))),0],i*5);}
  for(let f=0;f<r.indexCount;f+=3){const ai=raw.readUInt32LE(r.indexOffset+f*4)*5,bi=raw.readUInt32LE(r.indexOffset+(f+1)*4)*5,ci=raw.readUInt32LE(r.indexOffset+(f+2)*4)*5,ax=vertices[ai],ay=vertices[ai+1],bx=vertices[bi],by=vertices[bi+1],cx1=vertices[ci],cy=vertices[ci+1],area=(by-cy)*(ax-cx1)+(cx1-bx)*(ay-cy);if(Math.abs(area)<1e-9)continue;
   const x0=Math.max(0,Math.floor(Math.min(ax,bx,cx1))),x1=Math.min(W-1,Math.ceil(Math.max(ax,bx,cx1))),y0=Math.max(0,Math.floor(Math.min(ay,by,cy))),y1=Math.min(H-1,Math.ceil(Math.max(ay,by,cy)));
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const u=((by-cy)*(x+.5-cx1)+(cx1-bx)*(y+.5-cy))/area,v=((cy-ay)*(x+.5-cx1)+(ax-cx1)*(y+.5-cy))/area,w=1-u-v;if(u<0||v<0||w<0)continue;const z=u*vertices[ai+2]+v*vertices[bi+2]+w*vertices[ci+2],p=y*W+x;if(z>depth[p])continue;depth[p]=z;const light=u*vertices[ai+3]+v*vertices[bi+3]+w*vertices[ci+3];for(let a=0;a<3;a++)color[p*4+a]=Math.round(base[a]*light*255);mask.set([r.id&255,r.id>>8,r.kind==='bone'?1:r.kind==='context'?2:3,255],p*4);}
  }
 }
 const files={};for(const [name,rgba]of [['color',color],['ids',mask]]){const bytes=png(W,H,rgba),file=`overview-${side}-${name}.png`;await writeFile(new URL(file,dir),bytes);files[name]={file,bytes:bytes.length,sha256:sha(bytes)};}views[side]={...files,bounds:[direction*cx-W/2/s,cz-H/2/s,direction*cx+W/2/s,cz+H/2/s]};console.log(side,files);
}
m.overview={width:W,height:H,scale:s,sourceGeometrySha256:m.sha256,description:'Depth-tested projection of the complete source; ID map R/G is source object ID, B is kind (1 bone, 2 context, 3 muscle). Native unchanged geometry loads on magnification, dissection and local inspection.',views};await writeFile(new URL('manifest.json',dir),JSON.stringify(m));
