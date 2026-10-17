// 離線快取：首次開啟後把所有頁面存進快取，之後沒有網路也能閱讀。
// 有網路時一律先抓最新版（network-first），抓不到才用快取，所以內容更新不需要改版號；
// 新增或移除頁面時，記得同步更新 PAGES 並調高 VERSION。
const VERSION = 'v10';
// 這些資料夾有自己的 sw.js（scope 更精確），離線由它們自己負責，這裡完全不碰。
const SELF_MANAGED = ['./math/curvelab/'];
const CACHE = `online-study-${VERSION}`;
const PAGES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './japanese-basics/',
  './japanese-basics/index.html',
  './japanese-basics/2026-10-05-hiragana-practice.html',
  './japanese-basics/2026-10-07-osaka-trip-words.html',
  './japanese-basics/2026-10-10-song-gin-no-ishi.html',
  './japanese-basics/2026-10-15-kana-word-trio.html',
  './japanese-basics/2026-10-16-katakana-practice.html',
  './japanese-basics/2026-10-17-clerk-listening.html',
  './math/',
  './math/index.html',
];
// 五十音、片假名小學堂的發音檔（tools/generate-kana-audio.mjs 產生），一起預先快取，離線也能播。
const KANA_AUDIO = ('a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no '
  + 'ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa wo n').split(' ')
  .flatMap(id => ['hiragana', 'katakana'].flatMap(kind => [`./japanese-basics/audio/${kind}/kana-${id}.mp3`, `./japanese-basics/audio/${kind}/word-${id}.mp3`]));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(async cache => {
    await cache.addAll([...PAGES, ...KANA_AUDIO]);
    // 店員說什麼的音檔清單由 tools/generate-clerk-audio.mjs 寫出；抓不到也不影響其他頁面離線。
    const dir = './japanese-basics/audio/clerk/';
    await fetch(dir + 'files.json').then(r => r.json()).then(files => cache.addAll([dir + 'files.json', ...files.map(file => dir + file)])).catch(() => {});
  }).then(() => self.skipWaiting()));
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
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // 有自己 sw.js 的工具，整個資料夾放行，交給它自己處理。
  if (SELF_MANAGED.some(dir => url.pathname.startsWith(new URL(dir, self.registration.scope).pathname))) return;
  // 播音檔時瀏覽器會送 Range 請求：一樣先抓網路（音檔才會更新）；離線時快取裡是完整檔案，要自己切成 206 回應。
  if (request.headers.has('range')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request, { ignoreSearch: true })
        .then(cached => cached ? rangeResponse(cached, request.headers.get('range')) : Promise.reject(new Error('offline'))))
    );
    return;
  }
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

async function rangeResponse(response, range) {
  const body = await response.arrayBuffer();
  const [, from, to] = /bytes=(\d*)-(\d*)/.exec(range) || [];
  const start = Number(from) || 0;
  const end = to ? Math.min(Number(to), body.byteLength - 1) : body.byteLength - 1;
  return new Response(body.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${body.byteLength}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}
