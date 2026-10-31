import { CliRegistry, defineCommand, parseCliArgs } from './registry.js';
import { databaseCommands } from './commands/database.js';
import { makeCommands } from './commands/make.js';
import { startServerCommand } from './commands/server.js';
import { eventCommands } from './commands/event.js';

export * from './registry.js';

/**
 * Global singleton CLI registry for Nakiri
 */
export const cliRegistry = new CliRegistry();

// Register built-in commands
cliRegistry.register(startServerCommand);

for (const cmd of databaseCommands) {
  cliRegistry.register(cmd);
}

for (const cmd of makeCommands) {
  cliRegistry.register(cmd);
}

for (const cmd of eventCommands) {
  cliRegistry.register(cmd);
}

/**
 * Check if the given command string is a registered CLI command.
 * @param {string} [command]
 * @returns {boolean}
 */
export function isCliCommand(command) {
  return cliRegistry.has(command);
}

/**
 * Run CLI with raw arguments.
 * @param {string[]} rawArgs
 * @returns {Promise<number>}
 */
export async function runCli(rawArgs) {
  return cliRegistry.run(rawArgs);
}

export default cliRegistry;
