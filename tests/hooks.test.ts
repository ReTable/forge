import { describe, expect } from 'vitest';

import { Target, createTestApi } from './helpers';

const it = createTestApi();

const targets: Target[] = ['browser', 'node'];

describe('hooks', () => {
  for (const target of targets) {
    it(
      'runs a post build hook',
      {
        command: 'build',
        name: `${target}-default`,
        postBuild: ['touch lib/hook.js'],
        target,
      },
      async (c) => {
        expect(await c.isExists('lib/hook.js')).toBe(true);
      },
    );

    it(
      'runs post build hooks',
      {
        command: 'build',
        name: `${target}-default`,
        postBuild: ['touch lib/hook1.js', 'touch lib/hook2.js'],
        target,
      },
      async (c) => {
        expect(await c.isExists('lib/hook1.js')).toBe(true);
        expect(await c.isExists('lib/hook2.js')).toBe(true);
      },
    );

    it(
      'supports relative working directory',
      {
        command: 'build',
        name: `${target}-default`,
        postBuild: ['touch hook.js:lib'],
        target,
      },
      async (c) => {
        expect(await c.isExists('lib/hook.js')).toBe(true);
      },
    );

    it(
      "doesn't run hooks if build failed",
      {
        command: 'build',
        name: `${target}-check`,
        postBuild: ['touch lib/hook.js'],
        target,
      },
      async (c) => {
        expect(c.isFailed).toBe(true);
        expect(await c.isExists('lib/hook.js')).toBe(false);
      },
    );

    it(
      "don't run hooks after failed one",
      {
        command: 'build',
        name: `${target}-default`,
        postBuild: ['touch unknown/hook.js', 'touch lib/hook.js'],
        target,
      },
      async (c) => {
        expect(await c.isExists('lib/hook.js')).toBe(false);
      },
    );
  }
});
