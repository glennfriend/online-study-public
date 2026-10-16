// 產生「五十音小學堂」「片假名小學堂」用的假名與單字發音 mp3（微軟 Edge 神經語音 ja-JP-NanamiNeural）。
// 資料直接從頁面裡的 `const rows = [...]` 讀出來，改了單字後重跑一次即可。
//
// 用法（msedge-tts 不放進這個 repo，找一個暫存資料夾安裝）：
//   cd <暫存資料夾> && npm i msedge-tts
//   node <repo>/tools/generate-kana-audio.mjs <repo> hiragana
//   node <repo>/tools/generate-kana-audio.mjs <repo> katakana
// 已存在的檔案會略過；要重做某個字，先刪掉那個 mp3。
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const { MsEdgeTTS, OUTPUT_FORMAT } = createRequire(path.join(process.cwd(), '/'))('msedge-tts');

const PAGES = {
  hiragana: 'japanese-basics/2026-10-05-hiragana-practice.html',
  katakana: 'japanese-basics/2026-10-16-katakana-practice.html',
};
const repo = process.argv[2] || '.';
const kind = process.argv[3] || 'hiragana';
if (!PAGES[kind]) throw new Error(`第二個參數要是 ${Object.keys(PAGES).join(' 或 ')}`);
const page = path.join(repo, PAGES[kind]);
const outDir = path.join(repo, 'japanese-basics/audio', kind);

const ROMAJI = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o', か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so', た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no', は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo', や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro', わ: 'wa', を: 'wo', ん: 'n',
};
const toKata = s => s.replace(/[ぁ-ゖ]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60));
const toHira = s => s.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));

const html = fs.readFileSync(page, 'utf8');
const rows = Function(`return ${html.match(/const rows = (\[[\s\S]*?\n    \]);/)[1]}`)();
const jobs = [];
for (const [, entries] of rows) {
  for (const entry of entries) {
    if (!entry) continue;
    const [kana, , , spoken] = entry;
    const id = ROMAJI[toHira(kana)];
    // 單一假名用片假名送去念，避免「は」「へ」「を」被當助詞讀成 wa、e、o 以外的音。
    jobs.push([`kana-${id}.mp3`, toKata(kana)], [`word-${id}.mp3`, spoken]);
  }
}

fs.mkdirSync(outDir, { recursive: true });
const tts = new MsEdgeTTS();
await tts.setMetadata('ja-JP-NanamiNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
const synth = text => new Promise((resolve, reject) => {
  const chunks = [];
  const { audioStream } = tts.toStream(text);
  audioStream.on('data', chunk => chunks.push(chunk));
  audioStream.on('close', () => resolve(Buffer.concat(chunks)));
  audioStream.on('error', reject);
});
for (const [file, text] of jobs) {
  const target = path.join(outDir, file);
  if (fs.existsSync(target)) continue;
  const audio = await synth(text);
  if (!audio.length) throw new Error(`沒有收到聲音：${file}（${text}）`);
  fs.writeFileSync(target, audio);
  console.log(file, text, audio.length);
}
tts.close();
console.log(`完成，共 ${jobs.length} 個檔案`);
