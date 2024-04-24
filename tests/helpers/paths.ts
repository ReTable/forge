import path from 'node:path';
import url from 'node:url';

const rootDir = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '../');

export const fixturesDir = path.join(rootDir, 'fixtures');

export const tmpDir = path.join(rootDir, 'tmp');

export const binPath = path.resolve(rootDir, '../lib/index.js');
