// Classic script usable by both the page module loader and importScripts.
globalThis.clearBodyRehabCaches=async function(storage,base){
 const files=new Set(['','index.html','2026-11-26-body-map.html','body-map.css','body-map.js','body-renderer.js','muscle-catalogue.mjs','movement-ui.js','movement-mapping.mjs','evidence-review.html','evidence-review-page.js','attachment-targets.mjs','attachment-geometry.mjs','anatomy-review.html','anatomy-review-page.js','anatomy-data.js','offline-cache.js','movement-reference.html','cache-retirement.js','sw.js','online-geometry.js','thigh-source-preview.html','scripts/render-check.html','scripts/stream-check.html','scripts/cache-check.html']);let removed=0;
 for(const name of await storage.keys()){
  if(!/^body-rehab-(?:map-v\d+|anatomy-v1)$/.test(name))continue;
  const cache=await storage.open(name);
  for(const request of await cache.keys()){const url=new URL(request.url),relative=url.pathname.slice(base.pathname.length);if(url.origin===base.origin&&url.pathname.startsWith(base.pathname)&&(files.has(relative)||relative.startsWith('assets/body-model/')||relative.startsWith('assets/anatomy/')||relative.startsWith('assets/thigh-source/'))){if(await cache.delete(request))removed++;}}
  if(!(await cache.keys()).length)await storage.delete(name);
 }
 return removed;
};
