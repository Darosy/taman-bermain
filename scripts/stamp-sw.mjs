import { readFileSync, writeFileSync } from 'node:fs';
writeFileSync('public/sw.js', readFileSync('scripts/sw.template.js', 'utf8').replace('__V__', String(Date.now())));
