import { inflateRawSync, deflateSync } from 'node:zlib';

export function zipEntries(bytes) {
  let end = bytes.length - 22;
  while (end >= Math.max(0, bytes.length - 65557) && bytes.readUInt32LE(end) !== 0x06054b50) end--;
  if (end < 0) throw new Error('ZIP central directory missing');
  const entries = new Map();
  let cursor = bytes.readUInt32LE(end + 16);
  const count = bytes.readUInt16LE(end + 10);
  for (let i = 0; i < count; i++) {
    if (bytes.readUInt32LE(cursor) !== 0x02014b50) throw new Error('Invalid ZIP entry');
    const length = bytes.readUInt16LE(cursor + 28);
    const name = bytes.toString('utf8', cursor + 46, cursor + 46 + length);
    const size = bytes.readUInt32LE(cursor + 20);
    const method = bytes.readUInt16LE(cursor + 10);
    const offset = bytes.readUInt32LE(cursor + 42);
    entries.set(name, { name, size, method, offset });
    cursor += 46 + length + bytes.readUInt16LE(cursor + 30) + bytes.readUInt16LE(cursor + 32);
  }
  return entries;
}

export function unzipEntry(bytes, entry) {
  const start = entry.offset + 30 + bytes.readUInt16LE(entry.offset + 26) + bytes.readUInt16LE(entry.offset + 28);
  const data = bytes.subarray(start, start + entry.size);
  if (entry.method === 0) return data;
  if (entry.method === 8) return inflateRawSync(data);
  throw new Error(`Unsupported ZIP compression: ${entry.method}`);
}

export function parseOBJ(text) {
  const vertices = [], faces = [];
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith('v ')) {
      const vertex = line.trim().split(/\s+/).slice(1, 4).map(Number);
      if (vertex.length !== 3 || vertex.some(v => !Number.isFinite(v))) throw new Error('Invalid vertex');
      vertices.push(...vertex);
      vertex.forEach((v, i) => { min[i] = Math.min(min[i], v); max[i] = Math.max(max[i], v); });
    } else if (line.startsWith('f ')) {
      const polygon = line.trim().split(/\s+/).slice(1).map(v => {
        const index = Number(v.split('/')[0]);
        return index > 0 ? index - 1 : vertices.length / 3 + index;
      });
      for (let i = 1; i < polygon.length - 1; i++) faces.push(polygon[0], polygon[i], polygon[i + 1]);
    }
  }
  if (!vertices.length || !faces.length) throw new Error('Empty OBJ');
  if (faces.some(index => index < 0 || index >= vertices.length / 3)) throw new Error('Invalid face index');
  return { vertices: new Float64Array(vertices), faces: new Uint32Array(faces), min, max };
}

const crcTable = Uint32Array.from({ length: 256 }, (_, value) => {
  let n = value;
  for (let j = 0; j < 8; j++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, bytes) {
  const name = Buffer.from(type);
  const result = Buffer.alloc(bytes.length + 12);
  result.writeUInt32BE(bytes.length, 0); name.copy(result, 4); bytes.copy(result, 8);
  result.writeUInt32BE(crc32(Buffer.concat([name, bytes])), result.length - 4);
  return result;
}
export function png(width, height, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) Buffer.from(rgba.buffer, rgba.byteOffset + y * width * 4, width * 4).copy(raw, y * (width * 4 + 1) + 1);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
