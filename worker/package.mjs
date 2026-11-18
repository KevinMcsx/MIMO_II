import { createHash } from 'node:crypto';
import { readdir, readFile, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';

const types = { '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/manifest+json' };
const assets = {};
for (const file of await readdir('dist', { recursive: true, withFileTypes: true })) {
  if (!file.isFile()) continue;
  const type = types[extname(file.name)];
  if (!type) continue;
  const location = [file.parentPath.replaceAll('\\', '/'), file.name].join('/');
  assets[location.slice('dist'.length)] = { type, data: (await readFile(location)).toString('base64') };
}
const html = await readFile('dist/index.html', 'utf8');
const serviceWorker = await readFile('worker/service-worker.js', 'utf8');
const shellAssets = ['/', ...Object.keys(assets)];
const buildVersion = createHash('sha256').update(html).update(JSON.stringify(assets))
  .update(serviceWorker).digest('hex').slice(0, 16);
const serviceWorkerSource = serviceWorker
  .replace('__BUILD_VERSION__', buildVersion)
  .replace('__SHELL_ASSETS__', JSON.stringify(shellAssets));
assets['/sw.js'] = { type: 'text/javascript; charset=utf-8', data: Buffer.from(serviceWorkerSource).toString('base64') };
await mkdir('dist/server', { recursive: true });
await copyFile('worker/index.js', 'dist/server/index.js');
await copyFile('src/lib/gameDefinitions.js', 'dist/server/gameDefinitions.js');
await writeFile('dist/server/assets.js', `export const assets = ${JSON.stringify(assets)};\nexport const indexHtml = ${JSON.stringify(html)};\n`);
