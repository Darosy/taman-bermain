import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const output = 'dist';
if (!existsSync(join(output, 'index.html'))) throw new Error('Build Vite terlebih dahulu sebelum membuat service worker.');

function filesIn(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesIn(path) : [path];
  });
}

const urls = filesIn(output)
  .map((path) => '/' + relative(output, path).split(sep).join('/'))
  .filter((path) => path !== '/sw.js');
const template = readFileSync('scripts/sw.template.js', 'utf8');
writeFileSync(join(output, 'sw.js'), template
  .replace('__V__', String(Date.now()))
  .replace('__PRECACHE__', JSON.stringify(urls)));
