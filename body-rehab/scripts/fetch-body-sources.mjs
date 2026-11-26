import {mkdir,readFile,writeFile} from 'node:fs/promises';
const root=new URL('../.anatomy-cache/',import.meta.url);
const jobs=[
 ['bp3d3/BodyParts3D_3.0_obj_99.zip','https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/BodyParts3D_3.0_obj_99.zip'],
 ['bp3d3/parts_list_e.txt','https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/parts_list_e.txt'],
 ['bp3d3/composite_parts.txt','https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/composite_parts.txt'],
 ['bp3d3/README_e.html','https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/README_e.html'],
 ['bp3d/isa_element_parts.txt','https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/isa_element_parts.txt'],
 ['knowledge/ttuhsc.html','https://anatomy.ttuhscep.edu/anatomytables/muscles_alpha.html'],
];
for(const [file,url]of jobs){const path=new URL(file,root);if(await readFile(path).then(()=>true,()=>false)){console.log(`Cached ${file}`);continue;}await mkdir(new URL('./',path),{recursive:true});const response=await fetch(url);if(!response.ok)throw Error(`${url}: ${response.status}`);await writeFile(path,Buffer.from(await response.arrayBuffer()));console.log(`Downloaded ${file}`);}
