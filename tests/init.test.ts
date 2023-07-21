import { describe, expect } from 'vitest';

import { setup } from './setup';

const it = setup();

describe('init', async () => {
  await it(
    'generates initial config for browser',
    {
      command: 'init',
      name: 'browser-init-config',
      target: 'browser',
    },
    async (c) => {
      expect(await c.read('.forgerc')).toMatchSnapshot();
    },
  );

  await it(
    'generates initial config for node',
    {
      command: 'init',
      name: 'node-init-config',
      target: 'node',
    },
    async (c) => {
      expect(await c.read('.forgerc')).toMatchSnapshot();
    },
  );
});
