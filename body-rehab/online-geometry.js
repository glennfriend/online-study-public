// Geometry stays in GPU memory only for the current scene. Downloads are
// independent lossless objects, no-store, bounded in parallel, and abortable.
const abort=()=>new DOMException('Aborted','AbortError');
export function intersectsScene(r,scenes){return scenes.some(({frames,height})=>frames.some(({p,side})=>{
 const yaw=p.yaw??(side==='back'?Math.PI:0),pitch=p.pitch||0,c=Math.cos(yaw),s=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),cx=p.yaw===undefined&&side==='back'?-p.cx:p.cx,lo=[Infinity,Infinity],hi=[-Infinity,-Infinity];
 for(const x of [r.bounds[0][0],r.bounds[1][0]])for(const y of [r.bounds[0][1],r.bounds[1][1]])for(const z of [r.bounds[0][2],r.bounds[1][2]]){const u=c*x+s*y-cx,v=cp*z+sp*(-s*x+c*y)-p.cz;lo[0]=Math.min(lo[0],u);hi[0]=Math.max(hi[0],u);lo[1]=Math.min(lo[1],v);hi[1]=Math.max(hi[1],v);}
 return lo[0]*p.s<=p.width/2+2&&hi[0]*p.s>=-p.width/2-2&&lo[1]*p.s<=height/2+2&&hi[1]*p.s>=-height/2-2;
}));}
export class OnlineGeometry {
 constructor(manifest,renderer,{fetcher=fetch,base=new URL('assets/body-model/',import.meta.url),onProgress=()=>{}}={}){this.manifest=manifest;this.renderer=renderer;this.fetcher=(...args)=>fetcher.apply(globalThis,args);this.base=base;this.onProgress=onProgress;this.downloadedBytes=0;this.requestCount=0;this.generation=0;this.started=false;}
 async download(r,signal){if(this.renderer.meshBuffers.has(r.id))return;const f=r.stream;if(!f)throw Error('模型缺少按需檔案：'+r.mesh);this.requestCount++;const response=await this.fetcher(new URL(f.file,this.base),{cache:'no-store',signal});if(!response.ok)throw Error('模型 HTTP '+response.status);const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.length!==f.bytes)throw Error('模型分片長度不符：'+r.mesh);
  if(globalThis.crypto?.subtle){const hash=await crypto.subtle.digest('SHA-256',bytes);if([...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('')!==f.sha256)throw Error('模型校驗失敗：'+r.mesh);}
  const raw=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();if(signal.aborted)throw abort();if(raw.byteLength!==f.rawBytes)throw Error('模型解壓長度不符：'+r.mesh);this.renderer.upload(r,new Uint8Array(raw,0,r.vertexCount*16),new Uint8Array(raw,r.vertexCount*16,r.indexCount*4));this.downloadedBytes+=bytes.length;this.onProgress(this.stats());
 }
 async batch(records,signal){let cursor=0;await Promise.all(Array.from({length:Math.min(6,records.length)},async()=>{while(cursor<records.length){if(signal.aborted)throw abort();const r=records[cursor++];await this.download(r,signal);}}));}
 stats(){return {objects:this.renderer.meshBuffers.size,residentBytes:this.renderer.residentBytes,downloadedBytes:this.downloadedBytes,requests:this.requestCount};}
 run(key,task){if(key===this.key)return this.pending;this.controller?.abort();this.controller=new AbortController();const {signal}=this.controller;this.key=key;const generation=++this.generation;this.pending=task(signal).then(()=>{if(generation!==this.generation)throw abort();this.onProgress(this.stats());return this.stats();}).catch(error=>{if(generation===this.generation){this.key=null;this.controller.abort();}throw error;});return this.pending;}
 exact(records){const ids=new Set(records.map(r=>r.id));return this.run('exact:'+Array.from(ids).sort((a,b)=>a-b).join(','),async signal=>{this.renderer.retain(ids);await this.batch(records,signal);});}
 visible(scenes,seedIds=new Set()){
  if(!scenes.length)return this.exact([]);
  const r=this.renderer,candidates=r.records.filter(x=>r.visible(x)&&intersectsScene(x,scenes)),ids=new Set(candidates.map(x=>x.id)),key=JSON.stringify({ids:[...ids],seeds:[...seedIds],frames:scenes.map(s=>[s.width,s.height,s.frames])});
  return this.run(key,async signal=>{r.retain(ids);const first=!this.started;this.started=true;const seeds=candidates.filter(x=>seedIds.has(x.id)||(first&&x.kind!=='muscle'));await this.batch(seeds,signal);
   let missing=candidates.filter(x=>!r.meshBuffers.has(x.id));
   while(missing.length){const visible=await r.queryVisible(missing,scenes,signal);if(signal.aborted)throw abort();const next=missing.filter(x=>visible.has(x.id)).sort((a,b)=>((b.bounds[1][0]-b.bounds[0][0])*(b.bounds[1][2]-b.bounds[0][2]))-((a.bounds[1][0]-a.bounds[0][0])*(a.bounds[1][2]-a.bounds[0][2]))).slice(0,32);if(!next.length)break;await this.batch(next,signal);missing=missing.filter(x=>!r.meshBuffers.has(x.id));}
   const loaded=candidates.filter(x=>r.meshBuffers.has(x.id)),visible=await r.queryVisible(loaded,scenes,signal);if(signal.aborted)throw abort();r.retain(visible);
  });
 }
 dispose(){this.controller?.abort();this.generation++;this.renderer.dispose();}
 cancel(){this.controller?.abort();this.generation++;this.key=null;}
}
