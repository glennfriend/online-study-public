// A folder-scoped worker leaves the parent site's service worker unchanged.
(() => {
  if (!('serviceWorker' in navigator) || !('caches' in window) || !/^https?:$/.test(location.protocol)) return;
  const base = new URL('.', document.currentScript.src);
  const registration=navigator.serviceWorker.register(new URL('sw.js',base),{scope:base.pathname});
  async function report(){try{await registration;await navigator.serviceWorker.ready;const cache=await caches.open('body-rehab-map-v5'),response=await cache.match(new URL('assets/body-model/manifest.json',base));if(!response)return;const manifest=await response.json(),ready=(await Promise.all(manifest.files.map(f=>cache.match(new URL('assets/body-model/'+f.file,base))))).every(Boolean);const status=document.getElementById('offline-status');if(status)status.textContent=ready?'模型與頁面已可離線使用；外部來源需連線':'首次完整載入後可離線使用';}catch{}}
  registration.then(report).catch(()=>{});window.addEventListener('body-model-ready',()=>{report();setTimeout(report,2000);});
})();
