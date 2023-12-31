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

const svgrComponentName = z
  .function()
  .args(z.string())
  .returns(z.string())
  .describe('Transforms SVGR component name');

const svgrDisplayName = z
  .function()
  .args(z.string())
  .returns(
    z.union([
      z.object({
        isDebugOnly: z.boolean().optional(),
        displayName: z.string(),
      }),
      z.string(),
    ]),
  )
  .describe('Append the `displayName` property to exported SVGR component');

const cssClassPrefix = z.union([z.boolean(), z.string()], {
  description:
    'Prefix which used for CSS classes which generated by CSS Modules and `vanilla-extract` in production mode',
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

const hook = z.union(
  [
    z.string(),
    z.object({
      command: z.string(),
      cwd: z.string().optional(),
    }),
  ],
  {
    description: 'Defines a hook which should be run',
  },
);

const hooks = z.union([hook, z.array(hook)], {
  description: 'Defines hooks which should be run',
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
  cssClassPrefix: cssClassPrefix.optional(),
  svgrComponentName: svgrComponentName.optional(),
  svgrDisplayName: svgrDisplayName.optional(),

  build: perCommandConfiguration.optional(),
  watch: perCommandConfiguration.optional(),

  postBuild: hooks.optional(),
});

const singleEntryConfiguration = baseConfiguration
  .extend({
    entry: entry.optional(),
  })
  .strict();

const multipleEntriesConfiguration = baseConfiguration
  .extend({
    entries: entries.optional(),
  })
  .strict();

export const schema = z.union([singleEntryConfiguration, multipleEntriesConfiguration], {
  description: 'Defines a configuration',
});

export type Config = z.infer<typeof schema>;
