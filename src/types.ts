export type Target = 'browser' | 'node';

export type Entry =
  | string
  | {
      in: string;
      out?: string;
    };
