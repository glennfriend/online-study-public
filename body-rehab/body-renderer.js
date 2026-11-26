// Orthographic projections and depth-tested object picking use the same mesh,
// uniforms, visibility and depth buffer. There are no approximate hit regions.
export class BodyRenderer {
 constructor(canvas,manifest,binary){
  this.canvas=canvas;this.records=manifest.records;this.hidden=new Set();this.selected=new Set();this.focusIds=null;
  const gl=this.gl=canvas.getContext('webgl2',{antialias:true,alpha:false,preserveDrawingBuffer:true});
  if(!gl)throw Error('這個瀏覽器無法啟用 WebGL 2；仍可使用下方肌肉清單閱讀資料。');
  const compile=(type,code)=>{const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const program=this.program=gl.createProgram();
  gl.attachShader(program,compile(gl.VERTEX_SHADER,`#version 300 es
   in vec3 position;in vec3 normal;uniform vec2 center;uniform vec2 scale;uniform float direction;out float light;
   void main(){gl_Position=vec4(direction*(position.x-center.x)*scale.x,(position.z-center.y)*scale.y,direction*position.y/600.,1.);light=.55+.45*max(0.,dot(normalize(normal),normalize(vec3(-.22*direction,-.88*direction,.42))));}`));
  gl.attachShader(program,compile(gl.FRAGMENT_SHADER,`#version 300 es
   precision highp float;uniform vec3 color;uniform bool picking;in float light;out vec4 outputColor;
   void main(){outputColor=vec4(color*(picking?1.:light),1.);}`));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
  this.u=Object.fromEntries(['center','scale','direction','color','picking'].map(n=>[n,gl.getUniformLocation(program,n)]));
  this.p=gl.getAttribLocation(program,'position');this.n=gl.getAttribLocation(program,'normal');
  this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,this.records.reduce((n,r)=>n+r.vertexCount*16,0),gl.STATIC_DRAW);
  this.indices=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.records.reduce((n,r)=>n+r.indexCount*4,0),gl.STATIC_DRAW);
  let vo=0,io=0;for(const r of this.records){r.gpuVertexOffset=vo;r.gpuIndexOffset=io;gl.bufferSubData(gl.ARRAY_BUFFER,vo,new Uint8Array(binary,r.vertexOffset,r.vertexCount*16));gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER,io,new Uint8Array(binary,r.indexOffset,r.indexCount*4));vo+=r.vertexCount*16;io+=r.indexCount*4;}
  gl.enableVertexAttribArray(this.p);gl.enableVertexAttribArray(this.n);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
  // Flat integer ID colours must never be blended, dithered or multisampled.
  this.framebuffer=gl.createFramebuffer();this.texture=gl.createTexture();this.depth=gl.createRenderbuffer();
  const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const r of this.records)for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],r.bounds[0][i]);hi[i]=Math.max(hi[i],r.bounds[1][i]);}
  this.world=[lo,hi];this.width=0;this.height=0;this.cameras={};this.showBones=true;this.resetCamera();
 }
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
 visible(r){return (this.showBones||r.kind==='muscle')&&!this.hidden.has(r.id)&&(!this.focusIds||r.kind!=='muscle'||this.focusIds.has(r.id));}
 scene(frames,width,height,picking,offscreen){const gl=this.gl;gl.useProgram(this.program);offscreen?this.target(width,height):gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,width,height);gl.clearColor(...(picking?[0,0,0,1]:[1,.992,.973,1]));gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.disable(gl.BLEND);picking?gl.disable(gl.DITHER):gl.enable(gl.DITHER);gl.uniform1i(this.u.picking,picking);
  for(const {p,side,offset=0}of frames){
   gl.viewport(offset,0,p.width,height);gl.uniform2f(this.u.center,p.cx,p.cz);gl.uniform2f(this.u.scale,2*p.s/p.width,2*p.s/height);gl.uniform1f(this.u.direction,side==='front'?1:-1);
   for(const r of this.records){if(!this.visible(r))continue;
    gl.vertexAttribPointer(this.p,3,gl.FLOAT,false,16,r.gpuVertexOffset);gl.vertexAttribPointer(this.n,3,gl.BYTE,true,16,r.gpuVertexOffset+12);
    const selected=this.selected.has(r.id),shade=((r.id*17)%13)/160;
    gl.uniform3fv(this.u.color,picking?[(r.id&255)/255,(r.id>>8)/255,0]:selected?[.91,.43,.13]:r.kind==='bone'?[.90,.88,.81]:r.kind==='context'?[.86,.83,.71]:[.75+shade,.47+shade,.40+shade]);
    gl.drawElements(gl.TRIANGLES,r.indexCount,gl.UNSIGNED_INT,r.gpuIndexOffset);
   }
  }
  }
 draw(view='both',picking=false){this.resize();this.view=view;this.scene((view==='both'?['front','back']:[view]).map((side,index)=>{const p=this.projection(view,side);return {p,side,offset:index*p.width};}),this.width,this.height,picking,picking);this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);
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
