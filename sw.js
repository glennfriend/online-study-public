// 離線快取：首次開啟後把所有頁面存進快取，之後沒有網路也能閱讀。
// 有網路時一律先抓最新版（network-first），抓不到才用快取，所以內容更新不需要改版號；
// 新增或移除頁面時，記得同步更新 PAGES 並調高 VERSION。
const VERSION = 'v1';
const CACHE = `online-study-${VERSION}`;
const PAGES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './日文基礎/',
  './日文基礎/index.html',
  './日文基礎/2026-10-05-hiragana-practice.html',
  './日文基礎/2026-10-07-osaka-trip-words.html',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PAGES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('online-study-') && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true }))
      .then(response => response || new Response('離線中，這個頁面尚未快取。', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }))
  );
});
