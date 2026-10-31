import { pathToFileURL } from 'node:url';
import pc from 'picocolors';
import { dirApp } from '@nakiri/core/utils/path';
import { defineCommand } from '../registry.js';

/**
 * Command: command:list [category]
 * Display all registered bot commands grouped by category with their guards and aliases.
 */
export const commandListCommand = defineCommand({
  name: 'command:list',
  aliases: ['commands:list', 'commands', 'cmd:list'],
  category: 'bot',
  description:
    'Display all registered bot commands grouped by category with guards and triggers',
  usage: 'command:list [category]',
  async execute(args, options) {
    const targetCategory = (args[0] || options.category || '').toLowerCase();

    let getAllCommands;
    try {
      const botUrl = pathToFileURL(dirApp('services/bot/index.js')).href;
      const botModule = await import(botUrl);
      getAllCommands = botModule.getAllCommands;
    } catch (err) {
      console.log(
        pc.red(`\n  Failed to load bot service registry: ${err.message}\n`)
      );
      return;
    }

    const commands = await getAllCommands();

    if (!commands || commands.length === 0) {
      console.log(
        pc.yellow('\n  No bot commands registered in app/commands/.\n')
      );
      return;
    }

    const categories = new Map();
    for (const cmd of commands) {
      const cat = (cmd.category || 'general').toLowerCase();
      if (targetCategory && cat !== targetCategory) continue;
      if (!categories.has(cat)) categories.set(cat, []);
      categories.get(cat).push(cmd);
    }

    if (targetCategory && categories.size === 0) {
      console.log(
        pc.yellow(
          `\n  No bot commands found in category "${targetCategory}".\n`
        )
      );
      return;
    }

    console.log(pc.bold('\nNakiri Bot Command Registry:'));
    console.log(
      pc.dim(
        '========================================================================================'
      )
    );

    let totalCommands = 0;
    for (const [cat, cmds] of categories.entries()) {
      cmds.sort((a, b) => a.name.localeCompare(b.name));
      totalCommands += cmds.length;

      console.log(
        pc.bold(
          `\n  CATEGORY: ${pc.cyan(cat.toUpperCase())} ${pc.dim(`(${cmds.length} command${cmds.length === 1 ? '' : 's'})`)}`
        )
      );
      console.log(pc.dim('  ' + '─'.repeat(84)));

      const colOrder = '#'.padEnd(5, ' ');
      const colName = 'Name'.padEnd(14, ' ');
      const colTriggers = 'Triggers / Aliases'.padEnd(24, ' ');
      const colGuards = 'Guards / Middlewares'.padEnd(26, ' ');
      const colDesc = 'Description';

      console.log(
        pc.dim(
          `  ${colOrder} ${colName} ${colTriggers} ${colGuards} ${colDesc}`
        )
      );
      console.log(pc.dim('  ' + '─'.repeat(84)));

      cmds.forEach((cmd, idx) => {
        const orderStr = `${idx + 1}.`.padEnd(5, ' ');
        const nameStr = pc.bold(pc.cyan(cmd.name.padEnd(14, ' ')));

        const allTriggers = [
          cmd.name,
          ...(Array.isArray(cmd.commands) ? cmd.commands : []),
        ];
        const uniqueTriggers = [...new Set(allTriggers)];
        const triggerStr = uniqueTriggers.join(', ').padEnd(24, ' ');

        const guards =
          Array.isArray(cmd.middlewares) && cmd.middlewares.length > 0
            ? cmd.middlewares.join(', ')
            : 'none';
        const guardColor = guards === 'none' ? pc.dim : pc.yellow;
        const guardStr = guardColor(guards.padEnd(26, ' '));
        const descStr = pc.dim(cmd.description || '');

        console.log(
          `  ${pc.dim(orderStr)} ${nameStr} ${pc.green(triggerStr)} ${guardStr} ${descStr}`
        );
      });

      console.log(pc.dim('  ' + '─'.repeat(84)));
    }

    console.log(
      pc.dim(
        '\n========================================================================================'
      )
    );
    console.log(
      `  Total: ${pc.bold(String(totalCommands))} active command(s) across ${pc.bold(String(categories.size))} category(ies).\n`
    );
  },
});

export const botCommandCommands = [commandListCommand];
export default botCommandCommands;

