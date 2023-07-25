import { describe, expect } from 'vitest';

import { createTestApi } from './helpers/createTestApi';

const it = createTestApi();

describe('init', () => {
  it(
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

  it(
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
