// 產生發音 mp3 的共用工具（微軟 Edge 神經語音，透過 msedge-tts）。
// msedge-tts 不放進這個 repo：在暫存資料夾 `npm i msedge-tts`，然後在那個資料夾裡執行各個 generate-*.mjs。
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const { MsEdgeTTS, OUTPUT_FORMAT } = createRequire(path.join(process.cwd(), '/'))('msedge-tts');

export const VOICES = { female: 'ja-JP-NanamiNeural', male: 'ja-JP-KeitaNeural' };

// 頁面上的標記：{漢字|讀音} → 漢字，[ ] 拿掉。
export const spoken = markup => markup.replace(/[[\]]/g, '').replace(/\{([^|}]+)\|[^}]+\}/g, '$1');

// 從頁面原始碼讀出 `const NAME = [...]` 這個陣列。
export function readArray(pagePath, name) {
  const html = fs.readFileSync(pagePath, 'utf8');
  const match = html.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\n    \\]);`));
  if (!match) throw new Error(`找不到 const ${name} = [...]：${pagePath}`);
  return Function(`return ${match[1]}`)();
}

// jobs: [{ file, text, voice }]，voice 是 voices 的 key（預設日文 VOICES，英文頁面傳自己的對照表）。
// 已存在的檔案會略過；清掉 outDir 裡已經不用的舊 mp3，並寫出 files.json 給 sw.js 預先快取。
export async function generate(outDir, jobs, voices = VOICES) {
  fs.mkdirSync(outDir, { recursive: true });
  const connections = {};
  const connect = async voice => {
    if (!connections[voice]) {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voices[voice], OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      connections[voice] = tts;
    }
    return connections[voice];
  };
  const synth = (tts, text) => new Promise((resolve, reject) => {
    const chunks = [];
    const { audioStream } = tts.toStream(text);
    audioStream.on('data', chunk => chunks.push(chunk));
    audioStream.on('close', () => resolve(Buffer.concat(chunks)));
    audioStream.on('error', reject);
  });
  for (const { file, text, voice } of jobs) {
    const target = path.join(outDir, file);
    if (fs.existsSync(target)) continue;
    const audio = await synth(await connect(voice), text);
    if (!audio.length) throw new Error(`沒有收到聲音：${file}（${text}）`);
    fs.writeFileSync(target, audio);
    console.log(file, text, audio.length);
  }
  for (const tts of Object.values(connections)) tts.close();

  const keep = new Set(jobs.map(job => job.file));
  for (const file of fs.readdirSync(outDir)) {
    if (file.endsWith('.mp3') && !keep.has(file)) fs.unlinkSync(path.join(outDir, file));
  }
  fs.writeFileSync(path.join(outDir, 'files.json'), JSON.stringify([...keep].sort(), null, 2) + '\n');
  console.log(`完成，共 ${jobs.length} 個檔案`);
}
