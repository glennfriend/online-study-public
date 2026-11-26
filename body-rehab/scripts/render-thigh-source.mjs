// Render the original shared-coordinate OBJ geometry and an object-ID image
// in one depth-buffer pass. No hand-drawn hit polygons or body-part placement.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { zipEntries, unzipEntry, parseOBJ, png } from './bp3d-utils.mjs';
const cache = new URL('../.anatomy-cache/bp3d/', import.meta.url);
const out = new URL('../assets/thigh-source/', import.meta.url);
await mkdir(out, { recursive: true });
const archive = await readFile(new URL('isa_BP3D_4.0_obj_99.zip', cache));
const expectedArchive = '40665852c49f218326590e204db91064a1ecfc3c6f8cbd7bbbcaac62c7cd409e';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
if (hash(archive) !== expectedArchive) throw new Error('Unexpected source archive; review source version before rendering');
const entries = zipEntries(archive);
const mapping = (await readFile(new URL('isa_element_parts.txt', cache), 'utf8')).trim().split(/\r?\n/).slice(1).map(line => line.split('\t'));
const names = (await readFile(new URL('isa_parts_list_e.txt', cache), 'utf8')).trim().split(/\r?\n/).slice(1).map(line => line.split('\t'));
const namesByFma = new Map(names.map(([fma, representation, name]) => [fma, { representation, name }]));
const byFma = new Map();
for (const [fma, name, mesh] of mapping) { if (!byFma.has(fma)) byFma.set(fma, []); byFma.get(fma).push(mesh); }
const targets = [
  { key: 'rectus-femoris', zh: '股直肌', en: 'Rectus femoris', fma: ['FMA38928', 'FMA38929'], color: [190, 94, 69] },
  { key: 'vastus-lateralis', zh: '股外側肌', en: 'Vastus lateralis', fma: ['FMA38930', 'FMA38931'], color: [184, 111, 84] },
  { key: 'vastus-medialis', zh: '股內側肌', en: 'Vastus medialis', fma: ['FMA38932', 'FMA38933'], color: [205, 128, 100] },
  { key: 'vastus-intermedius', zh: '股中間肌', en: 'Vastus intermedius', fma: ['FMA38934', 'FMA38935'], color: [174, 96, 80] },
];
const targetByMesh = new Map();
for (const part of targets) for (const [i, fma] of part.fma.entries()) {
  const files = byFma.get(fma);
  if (files?.length !== 1) throw new Error(`Expected one model for ${fma}`);
  targetByMesh.set(files[0], { ...part, side: i === 0 ? 'right' : 'left', fma });
}
const boneIds = new Set(byFma.get('FMA5018'));
// In the source ontology several familiar muscles are represented as zones /
// heads rather than whole muscle organs (including the quadriceps parts).
const muscleIds = new Set(['FMA5022', 'FMA10474', 'FMA85453'].flatMap(fma => byFma.get(fma) || []));
const ids = [...new Set([...boneIds, ...muscleIds])].sort();
const meshes = [], records = [];
const worldMin = [Infinity, Infinity, Infinity], worldMax = [-Infinity, -Infinity, -Infinity];
for (const [index, id] of ids.entries()) {
  const entry = entries.get(`isa_BP3D_4.0_obj_99/${id}.obj`);
  if (!entry) throw new Error(`Source mesh missing: ${id}`);
  const bytes = unzipEntry(archive, entry);
  const mesh = parseOBJ(bytes.toString('utf8'));
  const candidates = mapping.filter(([fma, name, file]) => file === id && byFma.get(fma).length === 1);
  const concept = candidates.sort((a, b) => (a[1].startsWith('right ') || a[1].startsWith('left ') ? -1 : 1) - (b[1].startsWith('right ') || b[1].startsWith('left ') ? -1 : 1))[0];
  const target = targetByMesh.get(id);
  const record = { objectId: index + 1, meshId: id, name: concept?.[1] || id, fma: target?.fma || concept?.[0],
    representationId: namesByFma.get(target?.fma || concept?.[0])?.representation,
    kind: boneIds.has(id) ? 'bone' : 'muscle', target: target?.key || null, side: target?.side || null,
    vertices: mesh.vertices.length / 3, triangles: mesh.faces.length / 3, bounds: [mesh.min, mesh.max], sourceSha256: hash(bytes) };
  records.push(record);
  mesh.min.forEach((v, axis) => { worldMin[axis] = Math.min(worldMin[axis], v); worldMax[axis] = Math.max(worldMax[axis], mesh.max[axis]); });
  // Smooth normals are a display calculation; original vertex positions and
  // triangle indices remain unmodified in all projection and picking steps.
  const normals = new Float64Array(mesh.vertices.length);
  const v = mesh.vertices;
  for (let i = 0; i < mesh.faces.length; i += 3) {
    const a = mesh.faces[i] * 3, b = mesh.faces[i + 1] * 3, c = mesh.faces[i + 2] * 3;
    const ux = v[b] - v[a], uy = v[b+1] - v[a+1], uz = v[b+2] - v[a+2];
    const vx = v[c] - v[a], vy = v[c+1] - v[a+1], vz = v[c+2] - v[a+2];
    const n = [uy*vz-uz*vy, uz*vx-ux*vz, ux*vy-uy*vx];
    for (const vertex of [a,b,c]) for (let axis = 0; axis < 3; axis++) normals[vertex+axis] += n[axis];
  }
  for (let i = 0; i < normals.length; i += 3) { const n = Math.hypot(normals[i],normals[i+1],normals[i+2]) || 1; for(let axis=0;axis<3;axis++) normals[i+axis] /= n; }
  meshes.push({ ...mesh, normals, record, target });
}
const width = 1000, height = 2200, margin = 36;
const scale = Math.min((width-margin*2)/(worldMax[0]-worldMin[0]), (height-margin*2)/(worldMax[2]-worldMin[2]));
const centerX = (worldMin[0]+worldMax[0])/2;
const centerZ = (worldMin[2]+worldMax[2])/2;
const frames = [];
console.log(`Loaded ${meshes.length} source meshes, ${records.reduce((sum,r)=>sum+r.triangles,0)} triangles; bounds ${JSON.stringify([worldMin,worldMax])}`);

for (const view of ['front','back']) for (const layer of ['surface','deep']) {
  const rgba = new Uint8Array(width*height*4);
  const objectIds = new Uint16Array(width*height);
  const depth = new Float64Array(width*height).fill(-Infinity);
  const direction = view === 'front' ? -1 : 1; // anterior is negative source Y
  const horizontal = view === 'front' ? 1 : -1; // patient's right appears at viewer's left
  for (const mesh of meshes) {
    if (layer === 'deep' && mesh.target?.key === 'rectus-femoris') continue;
    const { vertices:v, faces, normals, target, record } = mesh;
    const projected = new Float64Array(v.length);
    const lights = new Float64Array(v.length/3);
    for (let i=0;i<v.length;i+=3) {
      projected[i] = width/2 + horizontal*(v[i]-centerX)*scale;
      projected[i+1] = height/2 - (v[i+2]-centerZ)*scale;
      projected[i+2] = direction*v[i+1];
      const light = Math.max(0, normals[i]*-.22*horizontal + normals[i+1]*direction*.88 + normals[i+2]*.42);
      lights[i/3] = .55 + .45*light;
    }
    const color = target?.color || (record.kind === 'bone' ? [231,224,205] : [186,139,127]);
    for (let i=0;i<faces.length;i+=3) {
      const ai=faces[i]*3,bi=faces[i+1]*3,ci=faces[i+2]*3;
      const ax=projected[ai],ay=projected[ai+1],bx=projected[bi],by=projected[bi+1],cx=projected[ci],cy=projected[ci+1];
      const area=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);
      if(Math.abs(area)<1e-8)continue;
      const minX=Math.max(0,Math.floor(Math.min(ax,bx,cx))), maxX=Math.min(width-1,Math.ceil(Math.max(ax,bx,cx)));
      const minY=Math.max(0,Math.floor(Math.min(ay,by,cy))), maxY=Math.min(height-1,Math.ceil(Math.max(ay,by,cy)));
      const az=projected[ai+2],bz=projected[bi+2],cz=projected[ci+2];
      for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++) {
        const px=x+.5,py=y+.5;
        const a=((by-cy)*(px-cx)+(cx-bx)*(py-cy))/area;
        const b=((cy-ay)*(px-cx)+(ax-cx)*(py-cy))/area;
        const c=1-a-b;
        if(a<0||b<0||c<0)continue;
        const z=a*az+b*bz+c*cz,pixel=y*width+x;
        if(z<=depth[pixel])continue;
        depth[pixel]=z; objectIds[pixel]=record.objectId;
        const light=a*lights[ai/3]+b*lights[bi/3]+c*lights[ci/3];
        const offset=pixel*4;
        rgba[offset]=Math.round(color[0]*light);rgba[offset+1]=Math.round(color[1]*light);rgba[offset+2]=Math.round(color[2]*light);rgba[offset+3]=255;
      }
    }
  }
  // Darken true visible object boundaries slightly, not invented muscle fibres.
  for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++) {
    const pixel=y*width+x,id=objectIds[pixel];
    if(id && [pixel-1,pixel+1,pixel-width,pixel+width].some(n=>objectIds[n]!==id)) for(let k=0;k<3;k++)rgba[pixel*4+k]=Math.round(rgba[pixel*4+k]*.77);
  }
  const mask = new Uint8Array(rgba.length);
  const stats = {};
  for(let pixel=0;pixel<objectIds.length;pixel++) {
    const id=objectIds[pixel]; mask[pixel*4]=id&255;mask[pixel*4+1]=id>>8;mask[pixel*4+3]=255;
    const part=records[id-1]?.target;
    if(part) { if(!stats[part])stats[part]={pixels:0,xSum:0,ySum:0};stats[part].pixels++;stats[part].xSum+=pixel%width;stats[part].ySum+=Math.floor(pixel/width); }
  }
  const prefix=`${view}-${layer}`;
  const picture=png(width,height,rgba), picking=png(width,height,mask);
  await writeFile(new URL(`${prefix}.png`,out),picture);
  await writeFile(new URL(`${prefix}-ids.png`,out),picking);
  frames.push({view,layer,image:`${prefix}.png`,ids:`${prefix}-ids.png`,imageSha256:hash(picture),idsSha256:hash(picking),visibleTargets:stats});
  console.log(`${prefix}: ${JSON.stringify(stats)}`);
}
const manifest = {
  title:'BodyParts3D 4.0 — quadriceps source-geometry pilot',generated:'2026-11-26',
  attribution:'BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International',
  source:'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html',
  license:'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html', licenseName:'CC BY 4.0',
  sourceArchive:'https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/isa_BP3D_4.0_obj_99.zip',sourceArchiveSha256:expectedArchive,
  sourceRelease:'4.0; archive geometry release 2013-06-19; supplied 99% polygon-reduction dataset',
  sourceLimitations:'The source warns of anatomical and concept-assignment errors; this is a prototype, not an expert-validated teaching atlas.',
  changes:['Selected source bone-organ and muscle-organ / muscle-zone / muscle-head meshes for context.','Original vertex coordinates and triangle connectivity unchanged.','Common orthographic front/back projections, smooth lighting, illustrative tissue colours.','Deep view omits only the two rectus-femoris meshes; sartorius and other occluding structures remain.','Object-ID image written by the same z-buffer sample that writes the visible image.'],
  width,height,worldBounds:[worldMin,worldMax],projection:{scale,centerX,centerZ,anteriorAxis:'negative Y',superiorAxis:'positive Z',patientRightAxis:'negative X'},
  targets,meshes:records,frames,
};
await writeFile(new URL('manifest.json',out),JSON.stringify(manifest,null,2)+'\n');
await writeFile(new URL('model-data.js',out),'const THIGH_MODEL = '+JSON.stringify(manifest)+';\n');
console.log('Source geometry and object-ID renders complete.');
