// Orthographic projections and depth-tested object picking use the same mesh,
// uniforms, visibility and depth buffer. There are no approximate hit regions.
export class BodyRenderer {
 constructor(canvas,manifest,binary=null){
  this.canvas=canvas;this.records=manifest.records;this.hidden=new Set();this.selected=new Set();this.focusIds=null;
  const gl=this.gl=canvas.getContext('webgl2',{antialias:true,alpha:false,preserveDrawingBuffer:true});
  if(!gl)throw Error('這個瀏覽器無法啟用 WebGL 2；仍可使用下方肌肉清單閱讀資料。');
  const compile=(type,code)=>{const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const program=this.program=gl.createProgram();
  gl.attachShader(program,compile(gl.VERTEX_SHADER,`#version 300 es
   in vec3 position;in vec3 normal;uniform vec2 center;uniform vec2 scale;uniform vec2 rotation;uniform vec2 pitch;uniform bool querying;out float light;
   void main(){if(querying){gl_Position=vec4(position,1.);light=1.;return;}float x=rotation.x*position.x+rotation.y*position.y;float y0=-rotation.y*position.x+rotation.x*position.y;float z=pitch.x*position.z+pitch.y*y0;float y=pitch.x*y0-pitch.y*position.z;float ny=-rotation.y*normal.x+rotation.x*normal.y;vec3 n=vec3(rotation.x*normal.x+rotation.y*normal.y,pitch.x*ny-pitch.y*normal.z,pitch.x*normal.z+pitch.y*ny);gl_Position=vec4((x-center.x)*scale.x,(z-center.y)*scale.y,y/2000.,1.);light=.55+.45*max(0.,dot(normalize(n),normalize(vec3(-.22,-.88,.42))));}`));
  gl.attachShader(program,compile(gl.FRAGMENT_SHADER,`#version 300 es
   precision highp float;uniform vec3 color;uniform bool picking;uniform float opacity;in float light;out vec4 outputColor;
   void main(){outputColor=vec4(color*(picking?1.:light),opacity);}`));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
  this.u=Object.fromEntries(['center','scale','rotation','pitch','querying','color','picking','opacity'].map(n=>[n,gl.getUniformLocation(program,n)]));
  this.p=gl.getAttribLocation(program,'position');this.n=gl.getAttribLocation(program,'normal');
  this.meshBuffers=new Map();this.residentBytes=0;
  if(binary)for(const r of this.records)this.upload(r,new Uint8Array(binary,r.vertexOffset,r.vertexCount*16),new Uint8Array(binary,r.indexOffset,r.indexCount*4));
  gl.enableVertexAttribArray(this.p);gl.enableVertexAttribArray(this.n);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
  // Flat integer ID colours must never be blended, dithered or multisampled.
  this.framebuffer=gl.createFramebuffer();this.texture=gl.createTexture();this.depth=gl.createRenderbuffer();
  const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const r of this.records)for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],r.bounds[0][i]);hi[i]=Math.max(hi[i],r.bounds[1][i]);}
  this.world=[lo,hi];this.width=0;this.height=0;this.cameras={};this.showBones=true;this.resetCamera();
 }
 makeBuffers(vertices,indices){const gl=this.gl,vao=gl.createVertexArray(),vb=gl.createBuffer(),ib=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);gl.enableVertexAttribArray(this.p);gl.enableVertexAttribArray(this.n);gl.vertexAttribPointer(this.p,3,gl.FLOAT,false,16,0);gl.vertexAttribPointer(this.n,3,gl.BYTE,true,16,12);gl.bindVertexArray(null);return {vao,vb,ib,bytes:vertices.byteLength+indices.byteLength};}
 upload(r,vertices,indices){if(this.meshBuffers.has(r.id))return;const buffers=this.makeBuffers(vertices,indices);this.meshBuffers.set(r.id,buffers);this.residentBytes+=buffers.bytes;}
 release(id){const data=this.meshBuffers.get(id);if(!data)return;this.deleteBuffers(data);this.residentBytes-=data.bytes;this.meshBuffers.delete(id);}
 deleteBuffers(data){const gl=this.gl;gl.deleteVertexArray(data.vao);gl.deleteBuffer(data.vb);gl.deleteBuffer(data.ib);}
 retain(ids){for(const id of this.meshBuffers.keys())if(!ids.has(id))this.release(id);}
 dispose(){this.retain(new Set());if(this.queryBuffers)this.deleteBuffers(this.queryBuffers);const gl=this.gl;if(this.overview){for(const view of Object.values(this.overview.views)){gl.deleteTexture(view.color);gl.deleteTexture(view.ids);}gl.deleteTexture(this.overview.palette);gl.deleteVertexArray(this.overview.vao);gl.deleteBuffer(this.overview.vb);gl.deleteProgram(this.overview.program);}gl.deleteFramebuffer(this.framebuffer);gl.deleteTexture(this.texture);gl.deleteRenderbuffer(this.depth);gl.deleteProgram(this.program);}
 async loadOverview(spec,base=new URL('assets/body-model/',import.meta.url)){
  if(!spec)return;const gl=this.gl,compile=(type,code)=>{const shader=gl.createShader(type);gl.shaderSource(shader,code);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;},program=gl.createProgram();
  gl.attachShader(program,compile(gl.VERTEX_SHADER,`#version 300 es
   in vec2 corner;uniform vec4 bounds;uniform vec2 center;uniform vec2 scale;out vec2 uv;void main(){vec2 p=mix(bounds.xy,bounds.zw,corner);uv=vec2(corner.x,1.-corner.y);gl_Position=vec4((p-center)*scale,0.,1.);}`));
  gl.attachShader(program,compile(gl.FRAGMENT_SHADER,`#version 300 es
   precision highp float;uniform sampler2D imageMap;uniform sampler2D idMap;uniform sampler2D palette;uniform bool picking;in vec2 uv;out vec4 outputColor;void main(){vec4 id=texture(idMap,uv);int number=int(round(id.r*255.))+int(round(id.g*255.))*256;if(picking){outputColor=vec4(id.rg,0.,1.);return;}vec3 color=texture(imageMap,uv).rgb;vec4 highlight=texelFetch(palette,ivec2(number,0),0);float kind=round(id.b*255.);float red=kind==1.?.9:kind==2.?.86:.75+mod(float(number)*17.,13.)/160.;if(highlight.a>0.)color=highlight.rgb*clamp(color.r/red,.55,1.);outputColor=vec4(color,1.);}`));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);const u=Object.fromEntries(['bounds','center','scale','imageMap','idMap','palette','picking'].map(n=>[n,gl.getUniformLocation(program,n)])),vao=gl.createVertexArray(),vb=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]),gl.STATIC_DRAW);const attr=gl.getAttribLocation(program,'corner');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,8,0);
  const configure=(texture,filter)=>{gl.bindTexture(gl.TEXTURE_2D,texture);for(const axis of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,axis,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filter);};
  const views={};this.overviewBytes=0;
  for(const side of ['front','back']){views[side]={bounds:spec.views[side].bounds};for(const name of ['color','ids']){const file=spec.views[side][name],response=await fetch(new URL(file.file,base),{cache:'no-store'});if(!response.ok)throw Error('全身導覽 HTTP '+response.status);const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.length!==file.bytes)throw Error('全身導覽長度不符');if(globalThis.crypto?.subtle){const hash=await crypto.subtle.digest('SHA-256',bytes);if([...new Uint8Array(hash)].map(v=>v.toString(16).padStart(2,'0')).join('')!==file.sha256)throw Error('全身導覽校驗失敗');}const bitmap=await createImageBitmap(new Blob([bytes],{type:'image/png'}),{premultiplyAlpha:'none',colorSpaceConversion:'none'}),texture=gl.createTexture();configure(texture,name==='color'?gl.LINEAR:gl.NEAREST);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,bitmap);bitmap.close();views[side][name]=texture;this.overviewBytes+=bytes.length;}}
  const palette=gl.createTexture();configure(palette,gl.NEAREST);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,1024,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(4096));this.overview={program,u,vao,vb,palette,views,spec};gl.bindVertexArray(null);
 }
 canOverview(view){return this.overview&&this.showBones&&!this.hidden.size&&!this.focusIds&&(view==='both'?['front','back']:[view]).every(side=>this.projection(view,side).s<=this.overview.spec.scale*.9);}
 drawOverview(view,picking){const gl=this.gl,o=this.overview;gl.useProgram(o.program);picking?this.target(this.width,this.height):gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,this.width,this.height);gl.clearColor(...(picking?[0,0,0,1]:[1,.992,.973,1]));gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);picking?gl.disable(gl.DITHER):gl.enable(gl.DITHER);gl.bindVertexArray(o.vao);gl.uniform1i(o.u.picking,picking);gl.uniform1i(o.u.imageMap,0);gl.uniform1i(o.u.idMap,1);gl.uniform1i(o.u.palette,2);const palette=new Uint8Array(4096);for(const [id,color]of this.emphasis||[])palette.set([...color.map(v=>Math.round(v*255)),255],id*4);for(const id of this.selected)palette.set([232,110,33,255],id*4);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,o.palette);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,1024,1,gl.RGBA,gl.UNSIGNED_BYTE,palette);
  for(const [i,side]of (view==='both'?['front','back']:[view]).entries()){const p=this.projection(view,side),image=o.views[side];gl.viewport(i*p.width,0,p.width,this.height);gl.uniform2f(o.u.center,side==='back'?-p.cx:p.cx,p.cz);gl.uniform2f(o.u.scale,2*p.s/p.width,2*p.s/this.height);gl.uniform4fv(o.u.bounds,image.bounds);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,image.color);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,image.ids);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}gl.activeTexture(gl.TEXTURE0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
 }
 setFrame(p,side,offset=0,height){const gl=this.gl;gl.viewport(offset,0,p.width,height);gl.uniform2f(this.u.center,p.yaw===undefined&&side==='back'?-p.cx:p.cx,p.cz);gl.uniform2f(this.u.scale,2*p.s/p.width,2*p.s/height);const yaw=p.yaw??(side==='front'?0:Math.PI),pitch=p.pitch||0;gl.uniform2f(this.u.rotation,Math.cos(yaw),Math.sin(yaw));gl.uniform2f(this.u.pitch,Math.cos(pitch),Math.sin(pitch));}
 proxy(r,p,side,height){const boxes=r.loadingBounds||[r.bounds],vertices=new ArrayBuffer(boxes.length*4*16),data=new DataView(vertices),yaw=p.yaw??(side==='back'?Math.PI:0),pitch=p.pitch||0,c=Math.cos(yaw),s=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),cx=p.yaw===undefined&&side==='back'?-p.cx:p.cx;
  boxes.forEach(([lo,hi],b)=>{const a=[Infinity,Infinity,Infinity],d=[-Infinity,-Infinity,-Infinity];for(const x of [lo[0],hi[0]])for(const y of [lo[1],hi[1]])for(const z of [lo[2],hi[2]]){const v=[c*x+s*y,cp*z+sp*(-s*x+c*y),cp*(-s*x+c*y)-sp*z];for(let k=0;k<3;k++){a[k]=Math.min(a[k],v[k]);d[k]=Math.max(d[k],v[k]);}}const x0=(a[0]-cx)*2*p.s/p.width-4/p.width,x1=(d[0]-cx)*2*p.s/p.width+4/p.width,z0=(a[1]-p.cz)*2*p.s/height-4/height,z1=(d[1]-p.cz)*2*p.s/height+4/height,depth=a[2]/2000-1e-6;for(let i=0;i<4;i++){data.setFloat32((b*4+i)*16,i&1?x1:x0,true);data.setFloat32((b*4+i)*16+4,i&2?z1:z0,true);data.setFloat32((b*4+i)*16+8,depth,true);}});
  const gl=this.gl;if(!this.queryBuffers){const indices=new Uint32Array(64*6);for(let i=0;i<64;i++)for(let j=0;j<6;j++)indices[i*6+j]=i*4+[0,1,2,1,3,2][j];this.queryBuffers=this.makeBuffers(new Uint8Array(64*4*16),indices);}gl.bindVertexArray(this.queryBuffers.vao);gl.bindBuffer(gl.ARRAY_BUFFER,this.queryBuffers.vb);gl.bufferSubData(gl.ARRAY_BUFFER,0,new Uint8Array(vertices));return boxes.length*6;
 }
 async queryVisible(candidates,scenes,signal){const gl=this.gl,queries=[];try{
  for(const {frames,width,height}of scenes){this.scene(frames,width,height,true,true);gl.colorMask(false,false,false,false);gl.depthMask(false);gl.uniform1i(this.u.querying,true);
   for(const r of candidates){const query=gl.createQuery();gl.beginQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE,query);for(const {p,side,offset=0}of frames){gl.viewport(offset,0,p.width,height);const count=this.proxy(r,p,side,height);gl.drawElements(gl.TRIANGLES,count,gl.UNSIGNED_INT,0);}gl.endQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE);queries.push({id:r.id,query});}
   gl.colorMask(true,true,true,true);gl.depthMask(true);
  }
  gl.flush();for(let attempt=0;attempt<250;attempt++){if(signal?.aborted)throw new DOMException('Aborted','AbortError');if(gl.isContextLost())throw Error('WebGL context lost');if(queries.every(q=>gl.getQueryParameter(q.query,gl.QUERY_RESULT_AVAILABLE)))return new Set(queries.filter(q=>gl.getQueryParameter(q.query,gl.QUERY_RESULT)).map(q=>q.id));await new Promise(resolve=>setTimeout(resolve,8));}
  // A slow/unsupported query may over-fetch, but must never omit anatomy.
  return new Set(candidates.map(r=>r.id));
 }finally{for(const q of queries)gl.deleteQuery(q.query);gl.colorMask(true,true,true,true);gl.depthMask(true);gl.useProgram(this.program);gl.uniform1i(this.u.querying,false);gl.bindFramebuffer(gl.FRAMEBUFFER,null);}}
 resize(){const c=this.canvas,ratio=Math.min(devicePixelRatio||1,2);const width=Math.max(2,Math.round(c.clientWidth*ratio)),height=Math.max(2,Math.round(c.clientHeight*ratio));if(width===this.width&&height===this.height)return;
  c.width=this.width=width;c.height=this.height=height;
 }
 target(width,height){const gl=this.gl;if(this.targetWidth!==width||this.targetHeight!==height){this.targetWidth=width;this.targetHeight=height;
  gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.bindRenderbuffer(gl.RENDERBUFFER,this.depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,width,height);gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.texture,0);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,this.depth);
  if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('無法建立點選緩衝區');}gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffer);
 }
 resetCamera(){const [lo,hi]=this.world;for(const side of ['front','back'])this.cameras[side]={cx:(lo[0]+hi[0])/2,cz:(lo[2]+hi[2])/2,zoom:1};}
 projection(view,side='front'){const width=view==='both'?Math.floor(this.width/2):this.width;const [lo,hi]=this.world,c=this.cameras[side];const s=Math.min((width-24)/(hi[0]-lo[0]),(this.height-36)/(hi[2]-lo[2]))*c.zoom;return {s,width,cx:c.cx,cz:c.cz};}
 visible(r){return (this.showBones||r.kind==='muscle')&&(!this.contextIds||r.kind==='muscle'||this.contextIds.has(r.id))&&!this.hidden.has(r.id)&&(!this.focusIds||r.kind!=='muscle'||this.focusIds.has(r.id));}
 scene(frames,width,height,picking,offscreen){const gl=this.gl;gl.useProgram(this.program);gl.uniform1i(this.u.querying,false);offscreen?this.target(width,height):gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,width,height);gl.clearColor(...(picking?[0,0,0,1]:[1,.992,.973,1]));gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.disable(gl.BLEND);picking?gl.disable(gl.DITHER):gl.enable(gl.DITHER);gl.uniform1i(this.u.picking,picking);
  for(const {p,side,offset=0}of frames){
   this.setFrame(p,side,offset,height);
   const xray=this.reviewXray&&!picking,passes=xray?[false,true]:[null];
   for(const musclePass of passes){if(xray&&musclePass===false){gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.uniform1f(this.u.opacity,.24);}else{gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);gl.uniform1f(this.u.opacity,1);}
   for(const r of this.records){const buffers=this.meshBuffers.get(r.id);if(!buffers||!this.visible(r)||(musclePass!==null&&(r.kind==='muscle'&&!this.contextMuscleIds?.has(r.id))!==musclePass))continue;
    gl.bindVertexArray(buffers.vao);
    const selected=this.selected.has(r.id),shade=((r.id*17)%13)/160;
    gl.uniform3fv(this.u.color,picking?[(r.id&255)/255,(r.id>>8)/255,0]:selected?[.91,.43,.13]:this.emphasis?.get(r.id)||(r.kind==='bone'?[.90,.88,.81]:r.kind==='context'?[.86,.83,.71]:[.75+shade,.47+shade,.40+shade]));
    gl.drawElements(gl.TRIANGLES,r.indexCount,gl.UNSIGNED_INT,0);
   }
   }
  }
  }
 draw(view='both',picking=false){this.resize();this.view=view;if(this.overviewActive&&this.overview){this.drawOverview(view,picking);return;}this.scene((view==='both'?['front','back']:[view]).map((side,index)=>{const p=this.projection(view,side);return {p,side,offset:index*p.width};}),this.width,this.height,picking,picking);this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);
 }
 pick(x,y){this.draw(this.view,true);const gl=this.gl,pixel=new Uint8Array(4);gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffer);gl.readPixels(Math.max(0,Math.min(this.width-1,Math.floor(x))),Math.max(0,Math.min(this.height-1,this.height-1-Math.floor(y))),1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);gl.bindFramebuffer(gl.FRAMEBUFFER,null);return pixel[0]+pixel[1]*256;}
 project(record,side='front'){const p=this.projection(this.view,side),[lo,hi]=record.bounds;const x=(lo[0]+hi[0])/2,z=(lo[2]+hi[2])/2,offset=this.view==='both'&&side==='back'?p.width:0;return {x:offset+p.width/2+(side==='front'?1:-1)*(x-p.cx)*p.s,y:this.height/2-(z-p.cz)*p.s,w:Math.max(1,(hi[0]-lo[0])*p.s),h:Math.max(1,(hi[2]-lo[2])*p.s)};}
 localCamera(records,width,height,zoom=1){const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const r of records)for(let a=0;a<3;a++){lo[a]=Math.min(lo[a],r.bounds[0][a]);hi[a]=Math.max(hi[a],r.bounds[1][a]);}return {cx:(lo[0]+hi[0])/2,cz:(lo[2]+hi[2])/2,s:Math.min(width*.72/Math.max(hi[0]-lo[0],8),height*.72/Math.max(hi[2]-lo[2],10))*zoom,width};}
 drawLocal(canvas,side,camera){const gl=this.gl,w=canvas.width,h=canvas.height;this.scene([{p:camera,side}],w,h,false,true);const pixels=new Uint8Array(w*h*4),flipped=new Uint8ClampedArray(pixels.length);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);for(let y=0;y<h;y++)flipped.set(pixels.subarray(y*w*4,(y+1)*w*4),(h-1-y)*w*4);canvas.getContext('2d').putImageData(new ImageData(flipped,w,h),0,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
 pickLocal(x,y,side,camera,width,height){const gl=this.gl,pixel=new Uint8Array(4);this.scene([{p:camera,side}],width,height,true,true);gl.readPixels(Math.floor(x),height-1-Math.floor(y),1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);gl.bindFramebuffer(gl.FRAMEBUFFER,null);return pixel[0]+pixel[1]*256;}
 zoom(factor,side,anchor){const cam=this.cameras[side],p=this.projection(this.view,side),direction=side==='front'?1:-1;const localX=anchor?anchor.x-(this.view==='both'&&side==='back'?p.width:0):p.width/2,localY=anchor?.y??this.height/2;const wx=cam.cx+(localX-p.width/2)/(direction*p.s),wz=cam.cz-(localY-this.height/2)/p.s;cam.zoom=Math.max(1,Math.min(16,cam.zoom*factor));const after=this.projection(this.view,side);cam.cx=wx-(localX-p.width/2)/(direction*after.s);cam.cz=wz+(localY-this.height/2)/after.s;}
 pan(dx,dy,side){const c=this.cameras[side],p=this.projection(this.view,side);c.cx-=dx/((side==='front'?1:-1)*p.s);c.cz+=dy/p.s;}
 focus(records){for(const side of ['front','back']){const width=this.projection(this.view,side).width,c=this.localCamera(records,width,this.height);this.cameras[side]={cx:c.cx,cz:c.cz,zoom:1};this.cameras[side].zoom=Math.min(16,Math.max(1,c.s/this.projection(this.view,side).s));}}
}
