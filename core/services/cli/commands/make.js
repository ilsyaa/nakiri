import fs from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';
import { dirApp } from '@nakiri/core/utils/path';
import logger from '@nakiri/core/utils/logger';
import { defineCommand } from '../registry.js';

/**
 * Format string to snake_case without extension
 * @param {string} str
 * @returns {string}
 */
function toSnakeCase(str) {
  return str
    .replace(/\.js$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Format string to kebab-case without extension
 * @param {string} str
 * @returns {string}
 */
function toKebabCase(str) {
  return str
    .replace(/\.js$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format string to camelCase
 * @param {string} str
 * @returns {string}
 */
function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Format string to PascalCase
 * @param {string} str
 * @returns {string}
 */
function toPascalCase(str) {
  return str
    .replace(/\.js$/, '')
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[a-z]/, (chr) => chr.toUpperCase());
}

/**
 * Command: make:command <category> <name>
 * Create a declarative bot command in app/commands/<category>/<name>.js (Architecture v2)
 */
export const makeCommandCommand = defineCommand({
  name: 'make:command',
  aliases: ['make:cmd'],
  category: 'generator',
  description:
    'Create a new declarative bot command in app/commands/<category>/<name>.js',
  usage:
    'make:command <category> <name> [--prefix=true|false|optional] [--desc="..."]',
  async execute(args, options) {
    let category = args[0]?.trim();
    let name = args[1]?.trim();
    let description = options.desc || options.description || '';
    let middlewares = [];

    // Interactive prompts if arguments are missing in interactive terminal
    if (!category && !name && process.stdin.isTTY) {
      const catRes = await p.select({
        message: 'Select command category:',
        options: [
          { value: 'utility', label: 'utility', hint: 'General utilities (ping, menu, etc.)' },
          { value: 'group', label: 'group', hint: 'Group management (kick, warn, etc.)' },
          { value: 'owner', label: 'owner', hint: 'Owner-only maintenance (eval, exec, etc.)' },
          { value: 'general', label: 'general', hint: 'Other custom features' },
        ],
      });
      if (p.isCancel(catRes)) return;
      category = String(catRes).trim();

      const nameRes = await p.text({
        message: 'Enter command trigger name:',
        placeholder: 'ping',
        validate(val) {
          if (!val || !val.trim()) return 'Command name is required!';
        },
      });
      if (p.isCancel(nameRes)) return;
      name = String(nameRes).trim();

      const descRes = await p.text({
        message: 'Enter command description:',
        placeholder: `${name} command`,
        defaultValue: `${name} command`,
      });
      if (p.isCancel(descRes)) return;
      description = String(descRes).trim();

      const guardRes = await p.multiselect({
        message: 'Select middleware guards (space to select, enter to confirm):',
        options: [
          { value: 'group', label: 'group', hint: 'Require execution in WhatsApp group' },
          { value: 'private', label: 'private', hint: 'Require execution in private 1:1 chat' },
          { value: 'sender:isOwner', label: 'sender:isOwner', hint: 'Only bot owner can run' },
          { value: 'sender:admin,superAdmin', label: 'sender:admin,superAdmin', hint: 'Only group admin can run' },
          { value: 'sender:admin,superAdmin,isOwner', label: 'sender:admin,superAdmin,isOwner', hint: 'Admin or bot owner' },
          { value: 'bot:admin', label: 'bot:admin', hint: 'Require bot to be group admin' },
        ],
        required: false,
      });
      if (p.isCancel(guardRes)) return;
      middlewares = Array.isArray(guardRes) ? guardRes : [];
    } else if (category && !name) {
      // If only 1 argument was provided: default category to utility
      name = category;
      category = 'utility';
    }

    if (!name || !category) {
      throw new Error(
        'Category and name are required. Usage: node nakiri make:command <category> <name>'
      );
    }

    const cleanCategory = toSnakeCase(category);
    const cleanName = toSnakeCase(name);
    const finalDesc = description || `${cleanName} command`;

    const targetDir = dirApp('commands', cleanCategory);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileName = `${cleanName}.js`;
    const targetFile = path.join(targetDir, fileName);

    if (fs.existsSync(targetFile)) {
      throw new Error(
        `Command file already exists: app/commands/${cleanCategory}/${fileName}`
      );
    }

    const prefixOpt = options.prefix ? `, prefix: '${options.prefix}'` : '';
    const middlewareStr =
      middlewares.length > 0
        ? `[${middlewares.map((m) => `'${m}'`).join(', ')}]`
        : '[]';

    const content = `import { defineCommand } from '#app/services/bot/index.js';

export default defineCommand({
  name: '${cleanName}',
  category: '${cleanCategory}',
  description: '${finalDesc}',${prefixOpt}
  middlewares: ${middlewareStr},

  async execute(payload, ctx) {
    const { client, msg } = ctx;

    // Command logic goes here
    await msg.reply('Hello from ${cleanName}!');
  },
});
`;

    fs.writeFileSync(targetFile, content, 'utf-8');
    logger.success(
      '[CLI]',
      `Created command: app/commands/${cleanCategory}/${fileName}`
    );
  },
});

/**
 * Command: make:middleware <name>
 * Create a new userland middleware in app/middlewares/<name>.js (Architecture v2)
 */
export const makeMiddlewareCommand = defineCommand({
  name: 'make:middleware',
  aliases: ['make:guard'],
  category: 'generator',
  description: 'Create a new middleware module in app/middlewares/<name>.js',
  usage: 'make:middleware <name>',
  async execute(args) {
    let name = args[0]?.trim();

    if (!name && process.stdin.isTTY) {
      const nameRes = await p.text({
        message: 'Enter middleware name:',
        placeholder: 'auth_check',
        validate(val) {
          if (!val || !val.trim()) return 'Middleware name is required!';
        },
      });
      if (p.isCancel(nameRes)) return;
      name = String(nameRes).trim();
    }

    if (!name) {
      throw new Error(
        'Middleware name is required. Usage: node nakiri make:middleware <name>'
      );
    }

    const cleanName = toSnakeCase(name);
    const camelName = toCamelCase(cleanName);
    const fileName = `${cleanName}.js`;

    const targetDir = dirApp('middlewares');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetFile = path.join(targetDir, fileName);
    if (fs.existsSync(targetFile)) {
      throw new Error(
        `Middleware file already exists: app/middlewares/${fileName}`
      );
    }

    const content = `/**
 * Middleware: ${cleanName}
 *
 * @param {import('#app/types/context').Context} ctx
 * @param {() => Promise<void>} next
 * @returns {Promise<void>}
 */
export default async function ${camelName}Middleware(ctx, next) {
  // Logic executed BEFORE downstream handlers
  if (!ctx.msg) return;

  await next();

  // Logic executed AFTER downstream handlers
}
`;

    fs.writeFileSync(targetFile, content, 'utf-8');
    logger.success('[CLI]', `Created middleware: app/middlewares/${fileName}`);
    console.log(
      `\x1b[36m  [Tip]\x1b[0m Register in \x1b[33mapp/starts/kernel.js\x1b[0m under eventMiddlewares or middlewareAliases.`
    );
  },
});

/**
 * Command: make:event <event> <name>
 * Create a native WhatsApp event module in app/events/<event>/<name>.js (Architecture v2)
 */
export const makeEventCommand = defineCommand({
  name: 'make:event',
  aliases: ['make:listener'],
  category: 'generator',
  description:
    'Create a new event handler module in app/events/<event>/<name>.js',
  usage: 'make:event <event> <name> [--level=10] [--desc="..."]',
  async execute(args, options) {
    let eventName = args[0]?.trim();
    let name = args[1]?.trim();

    if (!eventName && !name && process.stdin.isTTY) {
      const eventRes = await p.select({
        message: 'Select native WhatsApp event channel:',
        options: [
          { value: 'message', label: 'message', hint: 'Incoming messages' },
          { value: 'group', label: 'group', hint: 'Group updates, joins, leaves' },
          { value: 'connection', label: 'connection', hint: 'Connection status changes' },
          { value: 'call', label: 'call', hint: 'Incoming VoIP calls' },
          { value: 'presence', label: 'presence', hint: 'User typing or online presence' },
        ],
      });
      if (p.isCancel(eventRes)) return;
      eventName = String(eventRes).trim();

      const nameRes = await p.text({
        message: 'Enter event handler name:',
        placeholder: 'sync-cache',
        validate(val) {
          if (!val || !val.trim()) return 'Handler name is required!';
        },
      });
      if (p.isCancel(nameRes)) return;
      name = String(nameRes).trim();
    } else if (eventName && !name) {
      // Default to message event channel
      name = eventName;
      eventName = 'message';
    }

    if (!name || !eventName) {
      throw new Error(
        'Event channel and handler name are required. Usage: node nakiri make:event <event> <name>'
      );
    }

    const cleanEvent = toSnakeCase(eventName);
    const cleanName = toKebabCase(name);
    const targetLevel = options.level ? Number(options.level) : 10;
    const finalDesc =
      options.desc ||
      options.description ||
      `${cleanName} ${cleanEvent} event listener`;

    const targetDir = dirApp('events', cleanEvent);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileName = `${cleanName}.js`;
    const targetFile = path.join(targetDir, fileName);

    if (fs.existsSync(targetFile)) {
      throw new Error(
        `Event file already exists: app/events/${cleanEvent}/${fileName}`
      );
    }

    const content = `import { defineModule } from '@nakiri/core/services/modules';

export default defineModule({
  name: '${cleanEvent}-${cleanName}',
  event: '${cleanEvent}',
  level: ${targetLevel},
  category: '${cleanEvent}',
  description: '${finalDesc}',

  async execute(payload, ctx) {
    if (payload.key?.fromMe) return;

    // Handle ${cleanEvent} event logic here
  },
});
`;

    fs.writeFileSync(targetFile, content, 'utf-8');
    logger.success(
      '[CLI]',
      `Created event handler: app/events/${cleanEvent}/${fileName}`
    );
  },
});

/**
 * Command: make:service <name>
 * Create a business service in app/services/<name>.js (Architecture v2)
 */
export const makeServiceCommand = defineCommand({
  name: 'make:service',
  category: 'generator',
  description: 'Create a new business service module in app/services/<name>.js',
  usage: 'make:service <name>',
  async execute(args) {
    let name = args[0]?.trim();

    if (!name && process.stdin.isTTY) {
      const nameRes = await p.text({
        message: 'Enter service name:',
        placeholder: 'payment',
        validate(val) {
          if (!val || !val.trim()) return 'Service name is required!';
        },
      });
      if (p.isCancel(nameRes)) return;
      name = String(nameRes).trim();
    }

    if (!name) {
      throw new Error(
        'Service name is required. Usage: node nakiri make:service <name>'
      );
    }

    const baseName = name.replace(/\.service(\.js)?$/, '');
    const cleanName = toSnakeCase(baseName);
    const className = `${toPascalCase(cleanName)}Service`;
    const fileName = `${cleanName}.js`;

    const targetDir = dirApp('services');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetFile = path.join(targetDir, fileName);
    if (fs.existsSync(targetFile)) {
      throw new Error(`Service file already exists: app/services/${fileName}`);
    }

    const content = `import db from '@nakiri/core/services/database';

/**
 * Service: ${className}
 */
export class ${className} {
  // Define service methods here
}

export default new ${className}();
`;

    fs.writeFileSync(targetFile, content, 'utf-8');
    logger.success('[CLI]', `Created service module: app/services/${fileName}`);
  },
});

/**
 * Command: make:util <name>
 * Create a utility helper in app/utils/<name>.js
 */
export const makeUtilCommand = defineCommand({
  name: 'make:util',
  aliases: ['make:helper'],
  category: 'generator',
  description: 'Create a new utility helper in app/utils/<name>.js',
  usage: 'make:util <name>',
  async execute(args) {
    let name = args[0]?.trim();

    if (!name && process.stdin.isTTY) {
      const nameRes = await p.text({
        message: 'Enter utility helper name:',
        placeholder: 'formatter',
        validate(val) {
          if (!val || !val.trim()) return 'Utility name is required!';
        },
      });
      if (p.isCancel(nameRes)) return;
      name = String(nameRes).trim();
    }

    if (!name) {
      throw new Error(
        'Utility name is required. Usage: node nakiri make:util <name>'
      );
    }

    const cleanName = toSnakeCase(name);
    const fileName = `${cleanName}.js`;

    const targetDir = dirApp('utils');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetFile = path.join(targetDir, fileName);
    if (fs.existsSync(targetFile)) {
      throw new Error(`Utility file already exists: app/utils/${fileName}`);
    }

    const content = `/**
 * Utility helper: ${cleanName}
 */
export function exampleHelper() {
  // Write pure helper logic here
}

export default {
  exampleHelper,
};
`;

    fs.writeFileSync(targetFile, content, 'utf-8');
    logger.success('[CLI]', `Created utility helper: app/utils/${fileName}`);
  },
});

export const makeCommands = [
  makeCommandCommand,
  makeMiddlewareCommand,
  makeEventCommand,
  makeServiceCommand,
  makeUtilCommand,
];

export default makeCommands;
