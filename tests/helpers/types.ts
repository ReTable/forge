export type Fixture = {
  isFailed: boolean;
  workingDir: string;
};

type Target = 'browser' | 'node';

type BaseFixtureOptions<Command extends 'build' | 'init', Options> = Options & {
  command: Command;
  name: string;
};

export type InitFixtureOptions = BaseFixtureOptions<
  'init',
  {
    target: Target;
  }
>;

type BaseBuildFixtureOptions<CommandTarget extends Target> = BaseFixtureOptions<
  'build',
  {
    check?: boolean;
    dependencies?: string[];
    entries?: string[];
    postBuild?: string[];
    production?: boolean;
    storybook?: CommandTarget extends 'browser' ? boolean : never;
    target: CommandTarget;
    typings?: boolean;
  }
>;

export type BuildFixtureOptions =
  | BaseBuildFixtureOptions<'browser'>
  | BaseBuildFixtureOptions<'node'>;

export type FixtureOptions = BuildFixtureOptions | InitFixtureOptions;
