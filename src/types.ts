export type Target = 'browser' | 'node';

export type Entry =
  | string
  | {
      in: string;
      out?: string;
    };

export type Hook =
  | string
  | {
      command: string;
      cwd?: string;
    };
