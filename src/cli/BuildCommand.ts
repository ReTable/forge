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
      This option is required.

      If the \`-e,--entry\` options is given, then they will be used as entry points.

      If the \`-p,--production\` flag is set the different optimizations will
      be applied to the source code.

      If the \`-c,--check\` flag is set the TypeScript will be run before
      build to check types. It stops build if any type error is existed.

      If the \`-t,--typings\` flag is set the typings will be generated. Typings
      generated only if type checking is enabled.

      If the \`-s,--storybook\` flag is set the additional documentation for Storybook will be emitted.

      If the \`-w,--watch\` flag is set, then build run in watch mode.
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

  public override async execute(): Promise<void> {
    const config = await loadConfig({
      target: this.target,

      entries: this.entries,

      production: this.production,
      check: this.check,
      typings: this.typings,
      storybook: this.storybook,

      watch: false,
    });

    await bundle(config);
  }
}
