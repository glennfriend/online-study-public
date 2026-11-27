// Retirement at the OLD worker URL. No fetch listener, prefetch or cache writes.
importScripts('./cache-retirement.js');
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await self.clients.claim();
 const removed=await clearBodyRehabCaches(caches,new URL('./',self.location.href));
 await self.registration.unregister();
 for(const client of await self.clients.matchAll())client.postMessage({type:'body-rehab-online-only',removed});
})()));
self.addEventListener('message',event=>{if(event.data?.type==='body-rehab-retirement-check')event.ports[0]?.postMessage({onlineOnly:true});});
