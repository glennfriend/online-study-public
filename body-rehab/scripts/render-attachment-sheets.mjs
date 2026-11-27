// Three orthographic views with anatomy-selected bone/tendon context.
// Context is translucent and drawn behind the muscle to expose deep contacts.
// This is an inspection aid, never an automated anatomical PASS criterion.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {png} from './bp3d-utils.mjs';
import {identify} from '../muscle-catalogue.mjs';
import {targetsFor} from '../attachment-targets.mjs';
import {resolveAttachmentTarget,relationshipContextMeshes} from '../attachment-geometry.mjs';
const root=new URL('../',import.meta.url),out=new URL('.anatomy-cache/review/attachments/',root);await mkdir(out,{recursive:true});
const m=JSON.parse(await readFile(new URL('assets/body-model/manifest.json',root))),k=JSON.parse(await readFile(new URL('assets/body-model/knowledge.json',root))),b=gunzipSync(Buffer.concat(await Promise.all(m.files.map(f=>readFile(new URL('assets/body-model/'+f.file,root))))));
const meshes=m.records.map(r=>{const v=new Float32Array(r.vertexCount*3),f=new Uint32Array(r.indexCount);for(let i=0;i<r.vertexCount;i++)for(let a=0;a<3;a++)v[i*3+a]=b.readFloatLE(r.vertexOffset+i*16+a*4);for(let i=0;i<f.length;i++)f[i]=b.readUInt32LE(r.indexOffset+i*4);return {r,v,f};});
const left=process.argv.includes('--left');
const groups=new Map();for(const mesh of meshes.filter(x=>x.r.kind==='muscle'&&(left?x.r.side==='left':x.r.side!=='left'))){const id=identify(mesh.r.name);if(!groups.has(id.key))groups.set(id.key,[]);groups.get(id.key).push(mesh);}
const W=200,H=240,cw=W*3,ch=280,cols=3,rows=4,width=cw*cols,height=ch*rows,index=[];
function render(ms,context,angle){const c=Math.cos(angle),s=Math.sin(angle),px=(x,y)=>c*x+s*y,depth=(x,y)=>-s*x+c*y,lo=[Infinity,Infinity],hi=[-Infinity,-Infinity];for(const {v}of ms)for(let i=0;i<v.length;i+=3){const x=px(v[i],v[i+1]),z=v[i+2];lo[0]=Math.min(lo[0],x);hi[0]=Math.max(hi[0],x);lo[1]=Math.min(lo[1],z);hi[1]=Math.max(hi[1],z);}const cx=(lo[0]+hi[0])/2,cz=(lo[1]+hi[1])/2,scale=Math.min(W*.77/Math.max(hi[0]-lo[0],12),H*.77/Math.max(hi[1]-lo[1],15));
 const rgba=new Uint8Array(W*H*4).fill(255),zbuffer=new Float32Array(W*H).fill(Infinity);
 for(const mesh of [...context,...ms]){const muscle=ms.includes(mesh),{v,f}=mesh,p=new Float32Array(v.length);for(let i=0;i<v.length;i+=3){p[i]=W/2+(px(v[i],v[i+1])-cx)*scale;p[i+1]=H/2-(v[i+2]-cz)*scale;p[i+2]=depth(v[i],v[i+1]);}
 for(let j=0;j<f.length;j+=3){const a=f[j]*3,d=f[j+1]*3,e=f[j+2]*3,ax=p[a],ay=p[a+1],bx=p[d],by=p[d+1],ex=p[e],ey=p[e+1],area=(by-ey)*(ax-ex)+(ex-bx)*(ay-ey);if(Math.abs(area)<1e-6)continue;const x0=Math.max(0,Math.floor(Math.min(ax,bx,ex))),x1=Math.min(W-1,Math.ceil(Math.max(ax,bx,ex))),y0=Math.max(0,Math.floor(Math.min(ay,by,ey))),y1=Math.min(H-1,Math.ceil(Math.max(ay,by,ey)));const shade=.68+.3*Math.abs(area)/(Math.abs(area)+40);for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const u=((by-ey)*(x+.5-ex)+(ex-bx)*(y+.5-ey))/area,t=((ey-ay)*(x+.5-ex)+(ax-ex)*(y+.5-ey))/area,w=1-u-t;if(u<0||t<0||w<0)continue;const z=u*p[a+2]+t*p[d+2]+w*p[e+2],q=y*W+x;if(muscle){if(z>zbuffer[q])continue;zbuffer[q]=z;rgba.set([Math.round(224*shade),Math.round(110*shade),Math.round(50*shade),255],q*4);}else if(rgba[q*4]===255){const v=mesh.r.kind==='bone'?226:203;rgba.set([v,v+1,mesh.r.kind==='bone'?219:222,255],q*4);}}}
 }return rgba;}
const all=[...groups];for(let page=0;page<Math.ceil(all.length/12);page++){const output=new Uint8Array(width*height*4).fill(255),entries=[];for(let n=0;n<12&&page*12+n<all.length;n++){const [key,ms]=all[page*12+n],profile=k.entries[key],targets=targetsFor(profile);if(!targets)throw Error('Unmapped '+profile.base);const contextIds=new Set([...targets.origin,...targets.insertion].flatMap(t=>resolveAttachmentTarget(t,m.records,ms[0].r.side).meshes).concat(relationshipContextMeshes(profile,m.records))),context=meshes.filter(x=>contextIds.has(x.r.mesh)&&!ms.includes(x)&&(x.r.side===ms[0].r.side||x.r.side==='midline'));const x=n%cols*cw,y=Math.floor(n/cols)*ch;entries.push({key,number:page*12+n+1,x,y,meshes:ms.map(x=>x.r.mesh),context:context.map(x=>x.r.mesh)});for(let v=0;v<3;v++){const pixels=render(ms,context,[0,Math.PI/2,Math.PI][v]);for(let row=0;row<H;row++)output.set(pixels.subarray(row*W*4,(row+1)*W*4),((y+40+row)*width+x+v*W)*4);}}
 const file=`attachments-${left?'left-':''}${page+1}.png`;await writeFile(new URL(file,out),png(width,height,output));index.push({file,entries});console.log(file+' '+entries[0].number+'–'+entries.at(-1).number);}
await writeFile(new URL(left?'index-left.json':'index.json',out),JSON.stringify(index,null,2));
