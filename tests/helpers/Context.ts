import fs from 'node:fs/promises';
import path from 'node:path';

import { Fixture } from './types';

type SourceMap = {
  version: number;
  sources: string[];
  sourcesContent?: string[];
  mappings: string;
  names: string[];
};

export class Context {
  public readonly isFailed: boolean;

  public readonly workingDir: string;

  public constructor({ isFailed, workingDir }: Fixture) {
    this.isFailed = isFailed;
    this.workingDir = workingDir;
  }

  public async isExists(relativePath: string): Promise<boolean> {
    try {
      await fs.stat(this.resolve(relativePath));

      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }

      throw error;
    }
  }

  public async read(relativePath: string): Promise<string> {
    return fs.readFile(this.resolve(relativePath), 'utf8');
  }

  public async readSourceMap(relativePath: string): Promise<SourceMap> {
    const content = await this.read(relativePath);

    return JSON.parse(content) as SourceMap;
  }

  private resolve(relativePath: string): string {
    return path.join(this.workingDir, relativePath);
  }
}
