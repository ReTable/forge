import module from 'node:module';
import path from 'node:path';

export function findTscPath(): string {
  const resolver = module.createRequire(import.meta.url);
  const typescript = resolver.resolve('typescript');

  return path.resolve(path.dirname(typescript), 'tsc.js');
}
