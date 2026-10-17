// 產生「店員說什麼」用的發音 mp3：店員用女聲，你的回應用男聲。
// 資料直接從頁面裡的 `const SCENES = [...]` 讀出來，改了句子後重跑一次即可；
// 同時寫出 audio/clerk/files.json，sw.js 會照這份清單預先快取，離線也能播。
//
// 用法：cd <裝了 msedge-tts 的暫存資料夾> && node <repo>/tools/generate-clerk-audio.mjs <repo>
// 已存在的檔案會略過；改了某一句，先刪掉那句的 mp3 再重跑。
import path from 'path';
import { spoken, readArray, generate } from './tts-lib.mjs';

const repo = process.argv[2] || '.';
const scenes = readArray(path.join(repo, 'japanese-basics/2026-10-17-clerk-listening.html'), 'SCENES');
const jobs = [];
for (const scene of scenes) {
  scene.items.forEach((item, i) => {
    const base = `${scene.id}-${i + 1}`;
    jobs.push({ file: `${base}-q.mp3`, text: item.say || spoken(item.jp), voice: 'female' });
    if (item.reply) jobs.push({ file: `${base}-a.mp3`, text: item.reply.say || spoken(item.reply.jp), voice: 'male' });
  });
}
await generate(path.join(repo, 'japanese-basics/audio/clerk'), jobs);
