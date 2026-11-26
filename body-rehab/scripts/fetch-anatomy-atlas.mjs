// Fetch the specifically licensed historical OpenStax plates preserved on Commons.
// Current OpenStax editions have different terms; do not substitute their CDN files.
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const plates = [
  ['front', 'Anterior View of Muscles.jpg'],
  ['back', 'Posterior View of Muscles.jpg'],
  ['neck', '1117 Muscles of the Neck and Back.jpg'],
  ['scapula', '1118 Muscles that Position the Pectoral Girdle.jpg'],
  ['shoulder', '1119 Muscles that Move the Humerus.jpg'],
  ['arm', '1120 Muscles that Move the Forearm.jpg'],
  ['abdomen', '1112 Muscles of the Abdomen.jpg'],
  ['hip', '1122 Gluteal Muscles that Move the Femur.jpg'],
  ['leg', '1123 Muscles of the Leg that Move the Foot and Toes.jpg'],
];
const out = new URL('../assets/anatomy/', import.meta.url);
await mkdir(out, { recursive: true });
const records = JSON.parse(await readFile(new URL('manifest.json', out), 'utf8').catch(() => '[]'));
for (const [id, title] of plates) {
  const saved = records.find(record => record.id === id);
  if (saved) {
    const bytes = await readFile(new URL(saved.file, out)).catch(() => null);
    if (bytes && createHash('sha256').update(bytes).digest('hex') === saved.sha256) { console.log(`${id}: verified existing file`); continue; }
  }
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.search = new URLSearchParams({ action: 'query', titles: `File:${title}`, prop: 'imageinfo', iiprop: 'url|extmetadata|size|sha1', iiurlwidth: '960', format: 'json' });
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Metadata HTTP ${response.status}`);
  const data = await response.json();
  const info = Object.values(data.query.pages)[0].imageinfo?.[0];
  const license = info?.extmetadata?.LicenseShortName?.value;
  if (!info || !/^CC BY(?:-SA)? (3\.0|4\.0)$/.test(license)) throw new Error(`Check license: ${title}: ${license}`);
  let image;
  // Commons recommends standard thumbnails to avoid overloading originals.
  const resized = info.width > 960;
  const originalUrl = new URL(resized ? info.thumburl : info.url);
  originalUrl.search = '';
  for (let attempt = 0; attempt < 4; attempt++) {
    image = await fetch(originalUrl, { headers: { 'User-Agent': 'BodyRehabEducation/1.0 (OpenStax attribution preserved)' } });
    if (image.ok) break;
    if (image.status === 429) throw new Error(`HTTP 429: honor Retry-After ${image.headers.get('retry-after') || 'unspecified'} seconds for ${title}`);
    await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
  }
  if (!image.ok || !image.headers.get('content-type')?.startsWith('image/jpeg')) throw new Error(`Image failed HTTP ${image.status}: ${title}`);
  const bytes = Buffer.from(await image.arrayBuffer());
  await writeFile(new URL(`${id}.jpg`, out), bytes);
  const previous = records.findIndex(record => record.id === id);
  if (previous !== -1) records.splice(previous, 1);
  records.push({ id, title, file: `${id}.jpg`, author: info.extmetadata.Artist?.value, source: info.descriptionurl, original: originalUrl.href,
    license, licenseUrl: info.extmetadata.LicenseUrl?.value, width: info.width, height: info.height,
    sha256: createHash('sha256').update(bytes).digest('hex'), changes: resized ? 'Proportional 960px Wikimedia thumbnail; no redrawing.' : 'None; original image bytes.', retrieved: '2026-11-26' });
  console.log(`${id}: ${license}, ${bytes.length} bytes`);
  await writeFile(new URL('manifest.json', out), JSON.stringify(records, null, 2) + '\n');
  await new Promise(resolve => setTimeout(resolve, 1000));
}
await writeFile(new URL('manifest.json', out), JSON.stringify(records, null, 2) + '\n');
