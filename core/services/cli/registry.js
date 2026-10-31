import pc from 'picocolors';
import logger from '@nakiri/core/utils/logger';
import { runStarts } from '@nakiri/core/services/starts/runner.js';

/**
 * @typedef {object} CommandDefinition
 * @property {string} name - Primary command name (e.g. 'make:event')
 * @property {string[]} [aliases] - Alternative aliases for this command
 * @property {string} category - Command category (e.g. 'make', 'database', 'system')
 * @property {string} description - Brief summary of what the command does
 * @property {string} [usage] - Command syntax usage
 * @property {(args: string[], options: Record<string, any>) => Promise<any> | any} execute
 */

/**
 * Helper to define a CLI command with type safety
 * @param {CommandDefinition} definition
 * @returns {CommandDefinition}
 */
export function defineCommand(definition) {
  if (!definition.name) {
    throw new Error('Command definition requires a "name" property');
  }
  if (typeof definition.execute !== 'function') {
    throw new Error(
      `Command "${definition.name}" requires an "execute" function`
    );
  }
  return {
    category: 'general',
    aliases: [],
    ...definition,
  };
}

/**
 * Parse raw CLI argument array into command name, positional args, and options
 * @param {string[]} rawArgs
 * @returns {{ command: string, args: string[], options: Record<string, any> }}
 */
export function parseCliArgs(rawArgs) {
  if (!Array.isArray(rawArgs) || rawArgs.length === 0) {
    return { command: '', args: [], options: {} };
  }

  const [rawCommand, ...rest] = rawArgs;
  const command = rawCommand.toLowerCase();
  const args = [];
  const options = {};

  for (const item of rest) {
    if (item.startsWith('--')) {
      const trimmed = item.slice(2);
      if (trimmed.includes('=')) {
        const [key, ...vals] = trimmed.split('=');
        options[key] = vals.join('=');
      } else {
        options[trimmed] = true;
      }
    } else if (item.startsWith('-')) {
      const key = item.slice(1);
      options[key] = true;
    } else {
      args.push(item);
    }
  }

  return { command, args, options };
}

export class CliRegistry {
  constructor() {
    /** @type {Map<string, CommandDefinition>} */
    this.commands = new Map();
    /** @type {Map<string, string>} */
    this.aliases = new Map();
  }

  /**
   * Register a command into the registry.
   * @param {CommandDefinition} commandDef
   * @returns {this}
   */
  register(commandDef) {
    const primaryName = commandDef.name.toLowerCase();
    this.commands.set(primaryName, commandDef);

    if (Array.isArray(commandDef.aliases)) {
      for (const alias of commandDef.aliases) {
        this.aliases.set(alias.toLowerCase(), primaryName);
      }
    }

    return this;
  }

  /**
   * Check if a command or alias is registered.
   * @param {string} [name]
   * @returns {boolean}
   */
  has(name) {
    if (!name) return false;
    const lower = name.toLowerCase();
    return this.commands.has(lower) || this.aliases.has(lower);
  }

  /**
   * Retrieve command definition by name or alias.
   * @param {string} [name]
   * @returns {CommandDefinition | undefined}
   */
  get(name) {
    if (!name) return undefined;
    const lower = name.toLowerCase();
    if (this.commands.has(lower)) {
      return this.commands.get(lower);
    }
    const resolved = this.aliases.get(lower);
    return resolved ? this.commands.get(resolved) : undefined;
  }

  /**
   * List all unique registered commands.
   * @returns {CommandDefinition[]}
   */
  list() {
    return Array.from(this.commands.values());
  }

  /**
   * Print formatted help text with commands grouped by category.
   */
  printHelp() {
    console.log(pc.bold('\nNakiri CLI Engine:'));
    console.log(
      pc.dim(
        '=================================================================='
      )
    );

    const grouped = new Map();
    for (const cmd of this.commands.values()) {
      const cat = cmd.category || 'general';
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat).push(cmd);
    }

    for (const [category, cmds] of grouped.entries()) {
      console.log(pc.bold(`\n  ${category.toUpperCase()}`));
      for (const cmd of cmds) {
        const usage = cmd.usage || cmd.name;
        const padded = `node nakiri ${usage}`.padEnd(42, ' ');
        console.log(`    ${pc.cyan(padded)} ${pc.dim(cmd.description || '')}`);
      }
    }

    console.log(
      pc.dim(
        '\n==================================================================\n'
      )
    );
  }

  /**
   * Execute command from process argument array.
   * @param {string[]} rawArgs
   * @returns {Promise<number>} Exit code (0 for success, 1 for error)
   */
  async run(rawArgs) {
    const { command, args, options } = parseCliArgs(rawArgs);

    if (
      !command ||
      command === 'help' ||
      command === '--help' ||
      command === '-h'
    ) {
      this.printHelp();
      return 0;
    }

    const cmd = this.get(command);
    if (!cmd) {
      logger.error('[CLI]', `Unknown command: "${command}"`);
      this.printHelp();
      return 1;
    }

    // Execute application start script once in terminal mode (unless starting server runtime)
    if (!['start', 'serve', 'bot'].includes(command.toLowerCase())) {
      await runStarts('terminal', { command, args, options });
    }

    try {
      await cmd.execute(args, options);
      return 0;
    } catch (error) {
      logger.error('[CLI]', error.message ?? error);
      return 1;
    }
  }
}

export default CliRegistry;
