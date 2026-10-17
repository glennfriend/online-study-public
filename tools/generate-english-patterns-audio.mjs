// 產生「15 個萬用句型」用的範本 mp3：每句美式女聲、男聲各一個。
// 資料直接從頁面裡的 `const GROUPS = [...]` 讀出來，改了句子後重跑一次即可；
// 同時寫出 audio/patterns/files.json，sw.js 會照這份清單預先快取，離線也能播。
//
// 用法：cd <裝了 msedge-tts 的暫存資料夾> && node <repo>/tools/generate-english-patterns-audio.mjs <repo>
// 已存在的檔案會略過；改了某一句，先刪掉那句的 mp3 再重跑。
import path from 'path';
import { readArray, generate } from './tts-lib.mjs';

const VOICES = { female: 'en-US-AriaNeural', male: 'en-US-GuyNeural' };
const repo = process.argv[2] || '.';
const groups = readArray(path.join(repo, 'english-basics/2026-10-17-15-patterns.html'), 'GROUPS');
const jobs = [];
for (const group of groups) {
  group.items.forEach((item, i) => {
    // *…* 是頁面上標出句型的記號，念的時候拿掉。
    const text = item.say || item.en.replace(/\*/g, '');
    jobs.push({ file: `${group.id}-${i + 1}-f.mp3`, text, voice: 'female' });
    jobs.push({ file: `${group.id}-${i + 1}-m.mp3`, text, voice: 'male' });
  });
}
await generate(path.join(repo, 'english-basics/audio/patterns'), jobs, VOICES);
