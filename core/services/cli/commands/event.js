import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import moduleLoader from '@nakiri/core/services/modules';
import { dirEvents } from '@nakiri/core/utils/path';
import { defineCommand } from '@nakiri/core/services/cli/registry';

/**
 * Scan for hidden event files that start with '.'
 * @param {string} dir
 * @returns {string[]}
 */
function findIgnoredFiles(dir) {
  const ignored = [];
  if (!fs.existsSync(dir)) return ignored;

  function scan(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name.startsWith('.')) {
            ignored.push(fullPath);
          } else {
            scan(fullPath);
          }
        } else if (
          entry.isFile() &&
          entry.name.endsWith('.js') &&
          !entry.name.endsWith('.d.ts')
        ) {
          if (entry.name.startsWith('.')) {
            ignored.push(fullPath);
          }
        }
      }
    } catch {}
  }

  scan(dir);
  return ignored;
}

/**
 * Format level with color coding
 * @param {number} level
 * @returns {string}
 */
function formatLevel(level) {
  const num = Number(level ?? 10);
  const str = String(num);
  if (num < 10) {
    return pc.magenta(str);
  }
  if (num === 10) {
    return pc.green(str);
  }
  return pc.blue(str);
}

/**
 * Command: event:list [channel]
 * Display all registered event modules sorted by execution level and order.
 */
export const eventListCommand = defineCommand({
  name: 'event:list',
  aliases: ['events:list', 'event:order', 'events'],
  category: 'event',
  description:
    'Display all registered event modules sorted by execution order and level',
  usage: 'event:list [event_name] [--channel=name]',
  async execute(args, options) {
    // 1. Load all modules dynamically
    await moduleLoader.load();

    const targetFilter = (
      args[0] ||
      options.channel ||
      options.event ||
      ''
    ).toLowerCase();
    const eventChannels = new Set(moduleLoader.eventListeners.keys());

    if (
      targetFilter &&
      !eventChannels.has(targetFilter) &&
      targetFilter !== '*'
    ) {
      console.log(
        pc.yellow(`\n  No event handlers found for channel "${targetFilter}".`)
      );
      console.log(
        pc.dim(
          `  Available channels: ${Array.from(eventChannels).join(', ') || 'none'}\n`
        )
      );
      return;
    }

    const channelsToDisplay = targetFilter
      ? [targetFilter]
      : Array.from(eventChannels).sort();

    console.log(pc.bold('\nNakiri Event Execution Pipeline:'));
    console.log(
      pc.dim(
        '========================================================================================'
      )
    );

    let totalHandlers = 0;

    for (const channel of channelsToDisplay) {
      const specificHandlers = moduleLoader.eventListeners.get(channel) || [];
      const wildcardHandlers =
        channel !== '*' ? moduleLoader.eventListeners.get('*') || [] : [];

      // Combine specific and wildcard handlers, deduplicate, and sort by level
      const combined = Array.from(
        new Set([...specificHandlers, ...wildcardHandlers])
      );
      combined.sort((a, b) => (a.level ?? 10) - (b.level ?? 10));

      totalHandlers += combined.length;

      console.log(
        pc.bold(
          `\n  EVENT: ${pc.cyan(channel.toUpperCase())} ${pc.dim(`(${combined.length} handler${combined.length === 1 ? '' : 's'})`)}`
        )
      );
      console.log(pc.dim('  ' + '─'.repeat(84)));

      const colOrder = '#'.padEnd(5, ' ');
      const colLevel = 'Level'.padEnd(8, ' ');
      const colCat = 'Category'.padEnd(12, ' ');
      const colName = 'Name'.padEnd(16, ' ');
      const colPath = 'File Path'.padEnd(30, ' ');
      const colDesc = 'Description';

      console.log(
        pc.dim(
          `  ${colOrder} ${colLevel} ${colCat} ${colName} ${colPath} ${colDesc}`
        )
      );
      console.log(pc.dim('  ' + '─'.repeat(84)));

      combined.forEach((handler, index) => {
        const orderStr = `${index + 1}.`.padEnd(5, ' ');
        const levelRaw = handler.level ?? 10;
        const levelFormatted = formatLevel(levelRaw).padEnd(
          8 + (formatLevel(levelRaw).length - String(levelRaw).length),
          ' '
        );
        const catStr = (handler.category || 'general').padEnd(12, ' ');
        const nameStr = pc.bold(handler.name.padEnd(16, ' '));

        const relativePath = path.relative(
          process.cwd(),
          handler.filePath || ''
        );
        const pathStr = relativePath.padEnd(30, ' ');
        const descStr = pc.dim(handler.description || '');

        console.log(
          `  ${pc.dim(orderStr)} ${levelFormatted} ${pc.yellow(catStr)} ${pc.cyan(nameStr)} ${pc.dim(pathStr)} ${descStr}`
        );
      });

      console.log(pc.dim('  ' + '─'.repeat(84)));
    }

    const eventsDir = dirEvents();
    const ignoredFiles = findIgnoredFiles(eventsDir);

    if (ignoredFiles.length > 0) {
      console.log(
        pc.yellow(
          `\n  [Note] ${ignoredFiles.length} hidden file(s) ignored (prefixed with '.'):`
        )
      );
      for (const file of ignoredFiles) {
        console.log(pc.dim(`    - ${path.relative(process.cwd(), file)}`));
      }
    }

    console.log(
      pc.dim(
        '\n========================================================================================'
      )
    );
    console.log(
      `  Total: ${pc.bold(String(totalHandlers))} active handler(s) across ${pc.bold(String(channelsToDisplay.length))} channel(s).\n`
    );
  },
});

export const eventCommands = [eventListCommand];
export default eventCommands;
