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
 * Command: make:event <category> <name>
 */
export const makeEventCommand = defineCommand({
  name: 'make:event',
  aliases: ['make:listener'],
  category: 'generator',
  description: 'Create a new event handler module in app/events/',
  usage: 'make:event <category> <name> [--event=message] [--level=10]',
  async execute(args, options) {
    let category = args[0]?.trim();
    let name = args[1]?.trim();

    if (!category && !name && process.stdin.isTTY) {
      const catRes = await p.text({
        message: 'Enter event module category:',
        placeholder: 'utility',
        defaultValue: 'utility',
      });
      if (p.isCancel(catRes)) return;
      category = String(catRes).trim();

      const nameRes = await p.text({
        message: 'Enter event module name:',
        placeholder: 'ping',
        validate(val) {
          if (!val || !val.trim()) return 'Module name is required!';
        },
      });
      if (p.isCancel(nameRes)) return;
      name = String(nameRes).trim();
    } else if (category && !name) {
      // If only 1 argument was provided: default category to utility
      name = category;
      category = 'utility';
    }

    if (!name || !category) {
      throw new Error(
        'Category and name are required. Usage: node nakiri make:event <category> <name>'
      );
    }

    const cleanCategory = toSnakeCase(category);
    const cleanName = toSnakeCase(name);
    const targetEvent = options.event || 'message';
    const targetLevel = options.level ? Number(options.level) : 10;

    const targetDir = dirApp('events', cleanCategory);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileName = `${cleanName}.js`;
    const targetFile = path.join(targetDir, fileName);

    if (fs.existsSync(targetFile)) {
      throw new Error(
        `File already exists: app/events/${cleanCategory}/${fileName}`
      );
    }

    const content = `import { defineModule } from '@nakiri/core/services/modules';

export default defineModule({
  event: '${targetEvent}',
  level: ${targetLevel},
  description: '${cleanName} event listener',

  async execute(payload, ctx) {
    if (payload.key?.fromMe) return;

    // Handle ${targetEvent} event logic here
  },
});
`;

    fs.writeFileSync(targetFile, content, 'utf-8');
    logger.success(
      '[CLI]',
      `Created event module: app/events/${cleanCategory}/${fileName}`
    );
  },
});

/**
 * Command: make:service <name>
 */
export const makeServiceCommand = defineCommand({
  name: 'make:service',
  category: 'generator',
  description: 'Create a new business service module in app/services/',
  usage: 'make:service <name>',
  async execute(args) {
    let name = args[0]?.trim();

    if (!name && process.stdin.isTTY) {
      const nameRes = await p.text({
        message: 'Enter service name:',
        placeholder: 'user',
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
    const fileName = `${cleanName}.service.js`;

    const targetDir = dirApp('services');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetFile = path.join(targetDir, fileName);
    if (fs.existsSync(targetFile)) {
      throw new Error(`File already exists: app/services/${fileName}`);
    }

    const content = `import db from '@nakiri/core/services/database';

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
 */
export const makeUtilCommand = defineCommand({
  name: 'make:util',
  aliases: ['make:helper'],
  category: 'generator',
  description: 'Create a new utility helper in app/utils/',
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
      throw new Error(`File already exists: app/utils/${fileName}`);
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
  makeEventCommand,
  makeServiceCommand,
  makeUtilCommand,
];

export default makeCommands;
