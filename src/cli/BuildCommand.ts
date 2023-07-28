import { Command, Option } from 'clipanion';
import { isLiteral, isOneOf } from 'typanion';

import { bundle } from '../bundle';
import { loadConfig } from '../config/loadConfig';

export class BuildCommand extends Command {
  public static override paths = [['build'], ['b'], Command.Default];

  public static override usage = Command.Usage({
    description: 'Build a package.',
    details: `
      This command will build source code for future distribution.

      The \`-t,--target\` option defines which platform is target for build. Must be \`browser\` or \`node\`.
      This option is required, if not defined in the configuration file.

      The \`-e,--entry\` option defines an entry point. Can be used multiple times to define multiple entry points.

      The \`-p,--production\` flag enables bundling for production environment. Build for production mode doesn't enable
      minification for debug purposes in the target user application.

      The \`-c,--check\` flag enables types checking through TypeScript compiler running. It stops build if any
      type error has been found.

      The \`-t,--typings\` flag enables typings generation. It generates typings only if type checking is enabled.

      The \`-s,--storybook\` flag enables emitting additional meta for Storybook. It uses \`react-docgen\` under the hood.
      This option is useful only for the \`browser\` target.

      The \`-b,--post-build\` option defines post build hook. A hook is an external command, which executed in a
      shell. Can be used multiple times to define multiple post build hooks.

      The \`-w,--watch\` flag enables watch mode.
    `,
  });

  private readonly target = Option.String('-t,--target', {
    validator: isOneOf([isLiteral('browser'), isLiteral('node')], { exclusive: true }),
  });

  private readonly entries = Option.Array('-e,--entry', {
    arity: 1,
    description: 'Defines which entry points will be bundled (default: index)',
    required: false,
  });

  private readonly postBuild = Option.Array('-b,--post-build', {
    arity: 1,
    description: 'Defines hook which will be called after each build (default: none)',
    required: false,
  });

  private readonly production = Option.Boolean('-p,--production', {
    description:
      'Apply optimizations for production environment (default: true when in watch mode)',
  });

  private readonly check = Option.Boolean('-c,--check', {
    description: 'Check types with TypeScript (default: true)',
  });

  private readonly typings = Option.Boolean('-t,--typings', {
    description: 'Emit typings with TypeScript if type checking is enabled (default: true)',
  });

  private readonly storybook = Option.Boolean('-s,--storybook', {
    description:
      'Emit additional documentation for Storybook (default: true when target is browser)',
  });

  private readonly watch = Option.Boolean('-w,--watch', false, {
    description: 'Enables watch mode (default: false)',
  });

  public override async execute(): Promise<void> {
    const config = await loadConfig({
      target: this.target,

      entries: this.entries,

      production: this.production,
      check: this.check,
      typings: this.typings,
      storybook: this.storybook,

      postBuild: this.postBuild,

      watch: this.watch,
    });

    await bundle(config);
  }
}
