import { TestAPI, afterAll, test } from 'vitest';

import { Context } from './Context';
import { clearFixtures, prepareFixture } from './fixtures';
import { FixtureOptions } from './types';

type Suite = (c: Context) => Promise<void> | void;

type DefineSuite = (title: string, options: FixtureOptions, suite: Suite) => void;

type SuiteAPI = DefineSuite & { only: DefineSuite; skip: DefineSuite };

const suiteFactory = (
  title: string,
  options: FixtureOptions,
  testFn: Suite,
  flag?: 'only' | 'skip',
) => {
  let define: TestAPI | TestAPI['only'] | TestAPI['skip'] = test;

  if (flag === 'only') {
    define = test.only;
  } else if (flag === 'skip') {
    define = test.skip;
  }

  define(title, async () => {
    const fixture = await prepareFixture(options);

    const context = new Context(fixture);

    await testFn(context);
  });
};

export function createTestApi(): SuiteAPI {
  afterAll(clearFixtures);

  const it = suiteFactory as SuiteAPI;

  it.only = (title, options, testFn) => {
    suiteFactory(title, options, testFn, 'only');
  };

  it.skip = (title, options, testFn) => {
    suiteFactory(title, options, testFn, 'skip');
  };

  return it;
}
