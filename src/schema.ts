import { z } from 'zod';

const platform = z.enum(['browser', 'node']);

const production = z.boolean();

const check = z.boolean();

const typings = z.boolean();

const entry = z.union([
  z.string(),
  z.object({
    in: z.string(),
    out: z.string().optional(),
  }),
]);

const entries = z.array(entry);

const script = z.union([
  z.string(),
  z.object({
    script: z.string(),
    cwd: z.string().nullable(),
  }),
]);

const scripts = z.array(script);

const perModeConfiguration = z.object({
  production: production.optional(),
  check: check.optional(),
  typings: typings.optional(),
});

const baseConfiguration = perModeConfiguration.extend({
  platform,
  build: perModeConfiguration.optional(),
  watch: perModeConfiguration.optional(),
  postBuild: scripts.optional(),
});

const singleEntryConfiguration = baseConfiguration.extend({
  entry: entry.optional(),
});

const multipleEntriesConfiguration = baseConfiguration.extend({
  entries: entries.optional(),
});

export const schema = z.union([singleEntryConfiguration, multipleEntriesConfiguration]);

export type Schema = z.infer<typeof schema>;
