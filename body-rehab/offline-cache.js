// Old URL retained for migration only: no new offline installation or downloads.
(() => {
 const base=new URL('.',document.currentScript.src),workerURL=new URL('sw.js',base).href;
 const status=text=>{const el=document.getElementById('offline-status');if(el)el.textContent=text;};
 const check=worker=>new Promise(resolve=>{if(!worker){resolve(false);return;}const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();resolve(false);},800);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data?.onlineOnly===true);};worker.postMessage({type:'body-rehab-retirement-check'},[channel.port2]);});
 globalThis.bodyRehabOnlineReady=(async()=>{
  if(!/^https?:$/.test(location.protocol))return;
  await import(new URL('cache-retirement.js',base));let removed=0;
  if('serviceWorker' in navigator){
   const container=navigator.serviceWorker,own=r=>r.scope===base.href&&[r.active,r.waiting,r.installing].some(w=>w?.scriptURL===workerURL),registrations=(await container.getRegistrations()).filter(own);
   for(const registration of registrations){
    if(await check(registration.active)){await registration.unregister();continue;}
    const activated=new Promise((resolve,reject)=>{const timer=setTimeout(()=>{container.removeEventListener('message',message);reject(Error('舊離線服務尚未停止，請連網重新整理。'));},15000);function message(e){if(e.data?.type==='body-rehab-online-only'&&e.source?.scriptURL===workerURL){clearTimeout(timer);container.removeEventListener('message',message);resolve();}}container.addEventListener('message',message);});
    activated.catch(()=>{});
    // Replace ONLY an existing project registration to stop its active caching
    // clients, then the retirement worker unregisters itself. New visitors skip.
    await container.register(workerURL,{scope:base.pathname,updateViaCache:'none'});await activated;
   }
   if(container.controller?.scriptURL===workerURL&&!(await check(container.controller)))throw Error('舊離線服務尚未停止，請連網重新整理。');
  }
  if('caches' in globalThis)removed=await clearBodyRehabCaches(caches,base);
  status(removed?'已清除本專案離線快取；模型依需求連線載入':'線上按需載入；不儲存離線模型');
 })().catch(error=>{status(error.message);throw error;});
 globalThis.bodyRehabOnlineReady.catch(()=>{});
})();
