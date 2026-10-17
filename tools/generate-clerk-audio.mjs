// 產生「店員說什麼」用的發音 mp3：店員用女聲 ja-JP-NanamiNeural，你的回應用男聲 ja-JP-KeitaNeural。
// 資料直接從頁面裡的 `const SCENES = [...]` 讀出來，改了句子後重跑一次即可；
// 同時寫出 audio/clerk/files.json，sw.js 會照這份清單預先快取，離線也能播。
//
// 用法（msedge-tts 不放進這個 repo，找一個暫存資料夾安裝）：
//   cd <暫存資料夾> && npm i msedge-tts
//   node <repo>/tools/generate-clerk-audio.mjs <repo>
// 已存在的檔案會略過；改了某一句，先刪掉那句的 mp3 再重跑。
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const { MsEdgeTTS, OUTPUT_FORMAT } = createRequire(path.join(process.cwd(), '/'))('msedge-tts');

const repo = process.argv[2] || '.';
const page = path.join(repo, 'japanese-basics/2026-10-17-clerk-listening.html');
const outDir = path.join(repo, 'japanese-basics/audio/clerk');

// 去掉頁面上的標記：{漢字|讀音} → 漢字，[ ] 拿掉。
const spoken = markup => markup.replace(/[[\]]/g, '').replace(/\{([^|}]+)\|[^}]+\}/g, '$1');

const html = fs.readFileSync(page, 'utf8');
const scenes = Function(`return ${html.match(/const SCENES = (\[[\s\S]*?\n    \]);/)[1]}`)();
const jobs = [];
for (const scene of scenes) {
  scene.items.forEach((item, i) => {
    const base = `${scene.id}-${i + 1}`;
    jobs.push({ file: `${base}-q.mp3`, text: item.say || spoken(item.jp), voice: 'clerk' });
    if (item.reply) jobs.push({ file: `${base}-a.mp3`, text: item.reply.say || spoken(item.reply.jp), voice: 'you' });
  });
}

async function connect(voiceName) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  return tts;
}
const voices = { clerk: await connect('ja-JP-NanamiNeural'), you: await connect('ja-JP-KeitaNeural') };
const synth = (tts, text) => new Promise((resolve, reject) => {
  const chunks = [];
  const { audioStream } = tts.toStream(text);
  audioStream.on('data', chunk => chunks.push(chunk));
  audioStream.on('close', () => resolve(Buffer.concat(chunks)));
  audioStream.on('error', reject);
});

fs.mkdirSync(outDir, { recursive: true });
for (const { file, text, voice } of jobs) {
  const target = path.join(outDir, file);
  if (fs.existsSync(target)) continue;
  const audio = await synth(voices[voice], text);
  if (!audio.length) throw new Error(`沒有收到聲音：${file}（${text}）`);
  fs.writeFileSync(target, audio);
  console.log(file, text, audio.length);
}
for (const tts of Object.values(voices)) tts.close();

// 清掉頁面上已經沒有的舊檔，並寫出快取清單。
const keep = new Set(jobs.map(job => job.file));
for (const file of fs.readdirSync(outDir)) {
  if (file.endsWith('.mp3') && !keep.has(file)) fs.unlinkSync(path.join(outDir, file));
}
fs.writeFileSync(path.join(outDir, 'files.json'), JSON.stringify([...keep].sort(), null, 2) + '\n');
console.log(`完成，共 ${jobs.length} 個檔案`);
