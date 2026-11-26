import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base = 'https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/';
const cache = new URL('../.anatomy-cache/bp3d/', import.meta.url);
await mkdir(cache, { recursive: true });
const files = ['isa_parts_list_e.txt', 'isa_element_parts.txt', 'README_e.html', 'isa_BP3D_4.0_obj_99.zip'];
for (const file of files) {
  const path = new URL(file, cache);
  let bytes = await readFile(path).catch(() => null);
  if (!bytes) {
    const response = await fetch(base + file);
    if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
    await writeFile(path, bytes);
  }
  console.log(`${file}: ${bytes.length} bytes; sha256 ${createHash('sha256').update(bytes).digest('hex')}`);
}
const names = (await readFile(new URL(files[0], cache), 'utf8')).split(/\r?\n/).filter(line => /quadriceps|rectus femoris|vastus |sartorius|femur|patella|bone organ|muscle organ/.test(line));
console.log(names.join('\n'));
console.log('Element mapping preview:');
console.log((await readFile(new URL(files[1], cache), 'utf8')).split(/\r?\n/).slice(0, 5).join('\n'));
