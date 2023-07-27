import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '../');

export const fixturesDir = join(rootDir, 'fixtures');

export const tmpDir = join(rootDir, 'tmp');

export const binPath = resolve(rootDir, '../lib/index.js');
