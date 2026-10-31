import { getAllCommands } from './registry.js';

/**
 * @typedef {Object} MenuItem
 * @property {string} name - Command name
 * @property {string} group - Group allocation label (e.g. 'group', 'utility', 'owner')
 * @property {string[]} commands - Command triggers or aliases
 * @property {boolean} withoutPrefix - Whether command runs without prefix
 * @property {string} description - Command description
 */

/**
 * Get all registered commands grouped by category from the command registry.
 *
 * @returns {Promise<Map<string, MenuItem[]>>} Map of category name to list of menu items
 */
export async function getMenuByLabel() {
  const groups = new Map();
  const commands = await getAllCommands();

  for (const cmd of commands) {
    if (!cmd.name) continue;

    const aliases = Array.isArray(cmd.aliases)
      ? cmd.aliases
          .map((a) => (typeof a === 'string' ? a.trim() : ''))
          .filter(Boolean)
      : [];

    if (aliases.length === 0) continue;

    const groupName = (cmd.category || 'general').trim().toLowerCase();

    const item = {
      name: cmd.name,
      group: groupName,
      commands: aliases,
      withoutPrefix: Boolean(cmd.withoutPrefix || cmd.prefix === false),
      description: cmd.description || '',
    };

    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }
    groups.get(groupName).push(item);
  }

  // Sort items alphabetically within each group
  for (const items of groups.values()) {
    items.sort((a, b) => a.commands[0].localeCompare(b.commands[0]));
  }

  return groups;
}

/**
 * Format the menu text for WhatsApp presentation.
 *
 * @param {object} options
 * @param {string} [options.prefix='.'] - Bot prefix to prepend to commands
 * @param {string} [options.userName='User'] - User display name
 * @param {string} [options.groupFilter] - Optional group label to filter by
 * @returns {Promise<string>} Formatted WhatsApp menu message
 */
export async function formatMenuText({
  prefix = '.',
  userName = 'User',
  groupFilter = '',
} = {}) {
  const groups = await getMenuByLabel();

  if (groups.size === 0) {
    return 'Belum ada menu yang terdaftar.';
  }

  const cleanPrefix = prefix === 'optional' || !prefix ? '' : prefix;
  const filter = groupFilter.trim().toLowerCase();

  // Find matching group case-insensitively
  if (filter) {
    for (const [groupName, items] of groups.entries()) {
      if (groupName.toLowerCase() === filter) {
        const lines = [
          `｢ *${groupName.toLowerCase()}* ｣`,
          ...items.map((item) => {
            const cmd = item.commands[0];
            const cmdText = item.withoutPrefix ? cmd : `${cleanPrefix}${cmd}`;
            return `• \`${cmdText}\``;
          }),
        ];
        return lines.join('\n');
      }
    }
  }

  let totalCommands = 0;
  const sections = [];

  // Sort group keys alphabetically for consistent display
  const sortedGroupNames = [...groups.keys()].sort();

  for (const groupName of sortedGroupNames) {
    const items = groups.get(groupName) || [];
    totalCommands += items.length;

    const lines = [
      `｢ *${groupName.toLowerCase()}* ｣`,
      ...items.map((item) => {
        const cmd = item.commands[0];
        const cmdText = item.withoutPrefix ? cmd : `${cleanPrefix}${cmd}`;
        return `• \`${cmdText}\``;
      }),
    ];

    sections.push(lines.join('\n'));
  }

  const header = [
    `*NAKIRI BOT MENU*`,
    `Halo, *${userName}*! 👋`,
    '',
    `Prefix: \`${cleanPrefix || 'None'}\` | Total: *${totalCommands}* fitur`,
  ].join('\n');

  const footer = `💡 _Ketik \`${cleanPrefix}menu <grup>\` untuk melihat menu spesifik._`;

  return [header, '', sections.join('\n\n'), '', footer].join('\n');
}

export default {
  getMenuByLabel,
  formatMenuText,
};
