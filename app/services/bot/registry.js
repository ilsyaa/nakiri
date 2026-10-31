import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { dirApp } from '@nakiri/core/utils/path';
import logger from '@nakiri/core/utils/logger';
import { getCommandMiddleware } from './middleware.js';

export class CommandRegistry {
  constructor() {
    /** @type {Map<string, import('./types.js').CommandDefinition>} */
    this.commandsMap = new Map();
    /** @type {Set<import('./types.js').CommandDefinition>} */
    this.uniqueCommands = new Set();
    /** @type {import('./types.js').CommandMiddlewareResolver | null} */
    this.middlewareResolver = null;
    this.isLoaded = false;
    /** @type {Promise<void> | null} */
    this.loadPromise = null;
  }

  /**
   * Set custom middleware resolver function
   * @param {import('./types.js').CommandMiddlewareResolver} resolver
   */
  setMiddlewareResolver(resolver) {
    this.middlewareResolver = resolver;
  }

  /**
   * Resolve a middleware handler by alias
   * @param {string} alias
   * @returns {Promise<((payload: any, ctx: any, args?: string[]) => Promise<boolean | void> | boolean | void) | null>}
   */
  async resolveMiddleware(alias) {
    if (typeof this.middlewareResolver === 'function') {
      const custom = await this.middlewareResolver(alias);
      if (custom) return custom;
    }

    // Check command middleware alias from kernel.js
    return await getCommandMiddleware(alias);
  }

  /**
   * Recursively scan command files in directory
   * @param {string} dir
   * @returns {string[]}
   */
  scanFiles(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.')) {
            results.push(...this.scanFiles(fullPath));
          }
        } else if (
          entry.isFile() &&
          entry.name.endsWith('.js') &&
          !entry.name.endsWith('.d.ts') &&
          !entry.name.startsWith('.')
        ) {
          results.push(fullPath);
        }
      }
    } catch (err) {
      logger.warn(
        '[REGISTRY]',
        `Failed to scan directory ${dir}: ${err.message}`
      );
    }

    return results;
  }

  /**
   * Discover and load all command definitions
   * @param {string} [dir]
   * @returns {Promise<void>}
   */
  async load(dir) {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      this.commandsMap.clear();
      this.uniqueCommands.clear();

      const commandsDir = dir || dirApp('commands');
      if (!fs.existsSync(commandsDir)) {
        fs.mkdirSync(commandsDir, { recursive: true });
        this.isLoaded = true;
        return;
      }

      const files = this.scanFiles(commandsDir);
      logger.debug('[REGISTRY]', `Found ${files.length} command file(s).`);

      for (const filePath of files) {
        try {
          const fileUrl = `${pathToFileURL(filePath).href}?t=${Date.now()}`;
          const imported = await import(fileUrl);
          const def = imported.default || imported;

          if (!def || typeof def !== 'object') continue;
          if (!def.name || typeof def.execute !== 'function') {
            logger.warn(
              '[REGISTRY]',
              `Skipping ${path.basename(filePath)}: Missing 'name' or 'execute' function.`
            );
            continue;
          }

          this.uniqueCommands.add(def);

          // Register primary trigger
          const primary = def.name.trim().toLowerCase();
          this.commandsMap.set(primary, def);

          // Register aliases
          const aliases = [
            ...(Array.isArray(def.aliases) ? def.aliases : []),
            ...(Array.isArray(def.commands) ? def.commands : []),
          ];

          for (const alias of aliases) {
            if (typeof alias === 'string' && alias.trim()) {
              this.commandsMap.set(alias.trim().toLowerCase(), def);
            }
          }
        } catch (err) {
          logger.error(
            '[REGISTRY]',
            `Failed to load command file ${path.basename(filePath)}: ${err.message}`
          );
        }
      }

      this.isLoaded = true;
      logger.info(
        '[REGISTRY]',
        `Loaded ${this.uniqueCommands.size} unique command(s) with ${this.commandsMap.size} trigger(s).`
      );
    })();

    return this.loadPromise;
  }

  /**
   * Get all registered unique command definitions
   * @returns {Promise<import('./types.js').CommandDefinition[]>}
   */
  async getAll() {
    if (!this.isLoaded) {
      await this.load();
    }
    return [...this.uniqueCommands];
  }

  /**
   * Get a command by name or alias
   * @param {string} trigger
   * @returns {Promise<import('./types.js').CommandDefinition | undefined>}
   */
  async get(trigger) {
    if (!this.isLoaded) {
      await this.load();
    }
    if (!trigger) return undefined;
    return this.commandsMap.get(trigger.trim().toLowerCase());
  }

  /**
   * Dispatch an incoming message to matching command and execute middleware pipeline
   * @param {any} payload
   * @param {any} ctx
   * @returns {Promise<boolean>} returns true if command matched and executed
   */
  async dispatch(payload, ctx) {
    if (!this.isLoaded) {
      await this.load();
    }

    const msg = ctx.msg;
    if (!msg?.body) return false;

    const trigger = msg.body.commandWithoutPrefix;
    if (!trigger) return false;

    const command = this.commandsMap.get(trigger.toLowerCase());
    if (!command) return false;

    // Prefix verification rule
    const hasPrefix = Boolean(msg.body.prefix);
    const prefixRule =
      command.prefix !== undefined
        ? command.prefix
        : command.withoutPrefix
          ? false
          : true;

    if (prefixRule === true && !hasPrefix) {
      return false;
    }

    if (prefixRule === false && hasPrefix) {
      return false;
    }

    // Execute parameterized command middlewares
    if (Array.isArray(command.middlewares) && command.middlewares.length > 0) {
      for (const rule of command.middlewares) {
        if (!rule || typeof rule !== 'string') continue;

        const colonIdx = rule.indexOf(':');
        let alias = rule.trim();
        let args = [];

        if (colonIdx !== -1) {
          alias = rule.slice(0, colonIdx).trim();
          args = rule
            .slice(colonIdx + 1)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }

        const middleware = await this.resolveMiddleware(alias);
        if (!middleware) {
          logger.warn(
            '[REGISTRY]',
            `Command '${command.name}' references unknown middleware alias '${alias}'`
          );
          continue;
        }

        const allowed = await middleware(payload, ctx, args);
        if (allowed === false || ctx.isStopped) {
          return false;
        }
      }
    }

    // Execute command handler
    try {
      await command.execute(payload, ctx);
      return true;
    } catch (err) {
      logger.error(
        '[COMMAND]',
        `Execution error in command '${command.name}': ${err.message}`,
        err
      );
      try {
        await msg.reply('Terjadi kesalahan saat memproses perintah.');
      } catch {}
      return false;
    }
  }
}

export const commandRegistry = new CommandRegistry();
export const loadCommands = (dir) => commandRegistry.load(dir);
export const getAllCommands = () => commandRegistry.getAll();
export const getCommand = (trigger) => commandRegistry.get(trigger);
export const dispatchCommand = (payload, ctx) =>
  commandRegistry.dispatch(payload, ctx);

export default commandRegistry;
