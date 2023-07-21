import { z } from 'zod';

const target = z.enum(['browser', 'node'], {
  description: 'Target platform for build',
});

const production = z.boolean({
  description: 'Enables bundling for production environment',
});

const check = z.boolean({
  description: 'Enables type checking with TypeScript',
});

const typings = z.boolean({
  description: 'Enables typings generation',
});

const storybook = z.boolean({
  description:
    'Enables emitting additional documentation for components to use it in the Storybook',
});

const entry = z.union(
  [
    z.string(),
    z.object({
      in: z.string(),
      out: z.string().optional(),
    }),
  ],
  {
    description: 'Defines an entry point',
  },
);

const entries = z.array(entry, {
  description: 'Defines entry points',
});

const script = z.union(
  [
    z.string(),
    z.object({
      script: z.string(),
      cwd: z.string().nullable(),
    }),
  ],
  {
    description: 'Defines a script which should be run',
  },
);

const scripts = z.union([script, z.array(script)], {
  description: 'Defines scripts which should be run',
});

const perCommandConfiguration = z.object(
  {
    production: production.optional(),
    check: check.optional(),
    typings: typings.optional(),
    storybook: storybook.optional(),
  },
  {
    description: 'Defines a configuration for build or watch command',
  },
);

const baseConfiguration = perCommandConfiguration.extend({
  $schema: z.string().optional(),

  target,
  build: perCommandConfiguration.optional(),
  watch: perCommandConfiguration.optional(),
  postBuild: scripts.optional(),
});

const singleEntryConfiguration = baseConfiguration.extend({
  entry: entry.optional(),
});

const multipleEntriesConfiguration = baseConfiguration.extend({
  entries: entries.optional(),
});

export const schema = z.union([singleEntryConfiguration, multipleEntriesConfiguration], {
  description: 'Defines a configuration',
});

export type Config = z.infer<typeof schema>;
