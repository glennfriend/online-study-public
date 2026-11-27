// Whitelisted source defects established by literature AND direct OBJ inspection.
// This is not a nearest-bone fitting algorithm. Retained vertices never move.
export const modelGeometryCorrections={
 FMA22349:{
  sourceSha256:'f978ff10049acb3f5caabfb37293bc28c801d0c13a093dab58d681b3f873136a',
  sourceVertexCount:3447,sourceTriangleCount:5612,
  removeFaceIndices:[0,1,2,3,4,5,6,7,8,9],
  removeFaceVertices:[[0,1,2],[2818,2820,2819],[3,5,4],[2821,2822,2823],[6,8,7],[2824,2825,2826],[10,11,9],[2827,2829,2828],[13,12,14],[2830,2831,2832]],
  removedVertexIndices:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,2818,2819,2820,2821,2822,2823,2824,2825,2826,2827,2828,2829,2830,2831,2832],
  reason:'左腰方肌來源含10個完全游離的對側微小三角形（5處雙面碎片，30個頂點），各處尺度小於0.1 mm；與右腰方肌碎片位置重合。僅移除明確白名單碎片，保留左側主肌及所有其餘表面，修正被錯側碎片拉大的範圍。',
  anatomy:'腰方肌的同側髂嵴至第12肋與腰椎橫突連接，不能由無連接的對側數值碎片構成。正常肌束及附著差異不以大小或靠近骨骼的泛用演算法刪除。',
  evidence:[['Loyola University Chicago・LUMEN・Quadratus Lumborum','https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/ql.htm'],['原始解剖研究・Anatomy and biomechanics of quadratus lumborum（2008）','https://pubmed.ncbi.nlm.nih.gov/18441751/']],
  assessment:'upper_head_neck先發現跨側範圍，axial_pelvis獨立讀原始OBJ並列出10個原始三角形；兩區交叉覆核。'
 },
 FMA49012:{
  sourceSha256:'4d9d02d9ce76d8c85b7d466b7cfb333382996e2f66ceb28145664dc60a1f8967',
  sourceVertexCount:1562,sourceTriangleCount:1488,
  removeFaceIndices:[1480,1481,1482,1483,1484,1485,1486,1487],
  removeFaceVertices:[[738,737,736],[1547,741,1544],[1550,1545,740],[1546,1559,1556],[1548,1551,739],[1549,1553,1560],[1554,1552,1557],[1555,1558,1561]],
  removedVertexIndices:[736,737,738,739,740,741,1544,1545,1546,1547,1548,1549,1550,1551,1552,1553,1554,1555,1556,1557,1558,1559,1560,1561],
  reason:'右內翼肌來源含8個完全游離、位於左側的微小退化三角形（24個頂點）；主肌在右側，碎片x=31.948–31.9513 mm、y=-117.128–-117.125 mm、z=1466.09 mm，與主肌沒有連接。刪除明確碎片並重算範圍，保留其餘原始頂點位置；不是以最近骨點重塑附著。',
  anatomy:'內翼肌由蝶骨翼突／上顎與腭骨區至同側下頜支內面與下頜角；文獻描述的起源變異不支持本例在對側的微米級游離幾何碎片。',
  evidence:[
   ['Loyola University Chicago・LUMEN・Medial Pterygoid','https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/mml/mpte.htm'],
   ['原始解剖研究・179具屍體的內翼肌排列與附著（2007）','https://pubmed.ncbi.nlm.nih.gov/17318284/'],
   ['原始解剖研究・39個半頭的內翼肌附著變異（2017）','https://doi.org/10.1002/ca.22947']
  ],
  assessment:'分區審查發現並以原始OBJ逐面核對；主肌表面／骨性附著沒有外推平均座標。'
 }
};

export function applyGeometryCorrection(mesh,parsed,sourceSha256){
 const spec=modelGeometryCorrections[mesh];if(!spec)return parsed;
 if(sourceSha256!==spec.sourceSha256||parsed.vertices.length/3!==spec.sourceVertexCount||parsed.faces.length/3!==spec.sourceTriangleCount)throw Error('Geometry correction source mismatch: '+mesh);
 const removed=new Set(spec.removeFaceIndices);
 for(let i=0;i<spec.removeFaceIndices.length;i++){
  const face=spec.removeFaceIndices[i],expected=spec.removeFaceVertices[i];
  for(let j=0;j<3;j++)if(parsed.faces[face*3+j]!==expected[j])throw Error('Geometry correction face mismatch: '+mesh);
 }
 // Removal is a fixed face whitelist. No coordinate rule decides what to remove.
 const originalFaceIndices=[],used=new Set();
 for(let face=0;face<parsed.faces.length/3;face++)if(!removed.has(face)){originalFaceIndices.push(face);for(let j=0;j<3;j++)used.add(parsed.faces[face*3+j]);}
 const originalVertexIndices=[...used].sort((a,b)=>a-b),deleted=[];
 for(let i=0;i<parsed.vertices.length/3;i++)if(!used.has(i))deleted.push(i);
 if(JSON.stringify(deleted)!==JSON.stringify(spec.removedVertexIndices))throw Error('Geometry correction vertex mismatch: '+mesh);
 const oldToNew=new Map(originalVertexIndices.map((old,i)=>[old,i])),vertices=new Float64Array(originalVertexIndices.length*3),faces=new Uint32Array(originalFaceIndices.length*3),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 originalVertexIndices.forEach((old,i)=>{for(let axis=0;axis<3;axis++){const value=parsed.vertices[old*3+axis];vertices[i*3+axis]=value;min[axis]=Math.min(min[axis],value);max[axis]=Math.max(max[axis],value);}});
 originalFaceIndices.forEach((old,i)=>{for(let j=0;j<3;j++)faces[i*3+j]=oldToNew.get(parsed.faces[old*3+j]);});
 return {...parsed,vertices,faces,min,max,geometryCorrection:{...spec,originalVertexIndices,originalFaceIndices}};
}
