import { Builtins, Cli } from 'clipanion';

import { version } from '../../package.json';

import { BuildCommand } from './BuildCommand';
import { InitCommand } from './InitCommand';

export async function run(): Promise<void> {
  const cli = new Cli({
    binaryLabel: 'forge',
    binaryName: 'forge',
    binaryVersion: version,
    enableColors: true,
  });

  cli.register(BuildCommand);
  cli.register(InitCommand);

  cli.register(Builtins.HelpCommand);
  cli.register(Builtins.VersionCommand);

  await cli.runExit(process.argv.slice(2));
}
