import { TestAPI, afterAll, test } from 'vitest';

import { Context } from './Context';
import { clearFixtures, prepareFixture } from './fixtures';
import { FixtureOptions } from './types';

type SuiteFlag = 'only' | 'skip';

type SuiteOptions = FixtureOptions & { flag?: SuiteFlag };

type Suite = (c: Context) => Promise<void> | void;

type DefineSuite = (title: string, options: SuiteOptions, suite: Suite) => Promise<void>;

export function createTestApi(): DefineSuite {
  afterAll(clearFixtures);

  return async (title, options, testFn) => {
    let define: TestAPI | TestAPI['only'] | TestAPI['skip'] = test;

    if (options.flag === 'only') {
      define = test.only;
    } else if (options.flag === 'skip') {
      define = test.skip;
    }

    define(title, async () => {
      const fixture = await prepareFixture(options);

      const context = new Context(fixture);

      await testFn(context);
    });
  };
}
