import { Command, Option } from 'clipanion';
import { isLiteral, isOneOf } from 'typanion';

import { initConfig } from '../config';

export class InitCommand extends Command {
  public static override paths = [['init'], ['i']];

  public static override usage = Command.Usage({
    description: 'Creates an initial file for the selected platform.',
  });

  private readonly target = Option.String('-t,--target', {
    required: true,
    validator: isOneOf([isLiteral('browser'), isLiteral('node')], { exclusive: true }),
  });

  public override async execute(): Promise<void> {
    await initConfig(this.target);
  }
}
