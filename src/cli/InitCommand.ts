import { Command, Option } from 'clipanion';
import { hasAtLeastOneKey, hasMutuallyExclusiveKeys } from 'typanion';

import { createConfigFor } from '../config';

export class InitCommand extends Command {
  public static override paths = [['init'], ['i']];

  public static override usage = Command.Usage({
    description: 'Creates an initial file for the selected platform',
  });

  public static override schema = [
    hasAtLeastOneKey(['browser', 'node'], {
      missingIf: 'falsy',
    }),
    hasMutuallyExclusiveKeys(['browser', 'node'], {
      missingIf: 'falsy',
    }),
  ];

  private readonly browser = Option.Boolean('--browser,-b', false);
  // @ts-expect-error We don't use `node` property, because have validators.
  private readonly node = Option.Boolean('--node,-n', false);

  public override async execute(): Promise<void> {
    const platform = this.browser ? 'browser' : 'node';

    await createConfigFor(platform);
  }
}
