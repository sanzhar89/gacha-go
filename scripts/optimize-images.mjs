import { readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets');

const configs = {
  backgrounds: { maxWidth: 1920, quality: 82 },
  carousel: { maxWidth: 720, quality: 80 },
  leagues: { maxWidth: 720, quality: 80 },
  coaches: { maxWidth: 900, quality: 82 },
  blog: { maxWidth: 640, quality: 80 },
};

async function optimizeDir(dirName, { maxWidth, quality }) {
  const dir = join(root, dirName);
  const files = await readdir(dir);

  for (const file of files) {
    if (!file.endsWith('.png')) continue;

    const input = join(dir, file);
    const output = join(dir, file.replace(/\.png$/i, '.webp'));
    const meta = await sharp(input).metadata();
    const resize = meta.width > maxWidth ? { width: maxWidth } : undefined;

    await sharp(input).resize(resize).webp({ quality }).toFile(output);

    const [inStat, outStat] = await Promise.all([stat(input), stat(output)]);
    console.log(
      `${dirName}/${file}: ${(inStat.size / 1024).toFixed(0)} KB -> ${(outStat.size / 1024).toFixed(0)} KB`,
    );
  }
}

for (const [dirName, config] of Object.entries(configs)) {
  await optimizeDir(dirName, config);
}

console.log('Done.');
