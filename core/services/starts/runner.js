import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import logger from '@nakiri/core/utils/logger';
import { dirApp } from '@nakiri/core/utils/path';

/**
 * @typedef {(context: Record<string, any>) => any} StartHandler
 * @typedef {StartHandler | string} StartItem
 */

let hasRun = false;
let currentContext = null;

export class StartsManager {
  constructor() {
    /** @type {StartItem[]} */
    this._global = [];
    /** @type {StartItem[]} */
    this._server = [];
    /** @type {StartItem[]} */
    this._terminal = [];

    /** @type {'server' | 'terminal' | null} */
    this.environment = null;
    this.isServer = false;
    this.isTerminal = false;
    this.isCli = false;
    this.context = null;
  }

  /**
   * Register startup files/callbacks that run in ALL environments (Server & Terminal).
   * @param {StartItem[] | StartItem} items
   * @returns {this}
   */
  use(items) {
    const list = Array.isArray(items) ? items : [items];
    this._global.push(...list.filter(Boolean));
    return this;
  }

  /**
   * Register startup files/callbacks that run ONLY when the WhatsApp bot server is running.
   * @param {StartItem[] | StartItem} items
   * @returns {this}
   */
  server(items) {
    const list = Array.isArray(items) ? items : [items];
    this._server.push(...list.filter(Boolean));
    return this;
  }

  /**
   * Register startup files/callbacks that run ONLY when executing CLI commands in terminal.
   * @param {StartItem[] | StartItem} items
   * @returns {this}
   */
  terminal(items) {
    const list = Array.isArray(items) ? items : [items];
    this._terminal.push(...list.filter(Boolean));
    return this;
  }

  /**
   * Alias for terminal()
   * @param {StartItem[] | StartItem} items
   * @returns {this}
   */
  cli(items) {
    return this.terminal(items);
  }

  /**
   * Clear all registered items (mainly for testing)
   */
  clear() {
    this._global = [];
    this._server = [];
    this._terminal = [];
  }
}

/**
 * Global singleton StartsManager instance (AdonisJS-like app instance)
 */
export const app = new StartsManager();

/**
 * Helper to define starts with IDE autocomplete and type safety
 * @param {(app: StartsManager, context: Record<string, any>) => any} callback
 * @returns {(app: StartsManager, context: Record<string, any>) => any}
 */
export function defineStarts(callback) {
  return callback;
}

/**
 * Locate the primary start script inside app/starts
 * @returns {string | null}
 */
export function findStartScript() {
  const startsDir = dirApp('starts');
  if (!fs.existsSync(startsDir)) return null;

  // 1. Prioritize index.js
  const indexPath = path.join(startsDir, 'index.js');
  if (fs.existsSync(indexPath)) return indexPath;

  // 2. Fall back to the first non-hidden .js file
  try {
    const entries = fs.readdirSync(startsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.isFile() &&
        entry.name.endsWith('.js') &&
        !entry.name.endsWith('.d.ts') &&
        !entry.name.startsWith('.') &&
        !entry.name.startsWith('_')
      ) {
        return path.join(startsDir, entry.name);
      }
    }
  } catch (err) {
    logger.warn('[STARTS]', `Failed to scan starts directory: ${err.message}`);
  }

  return null;
}

/**
 * Execute the application start script once.
 *
 * @param {'server' | 'terminal'} [environment='server'] - Execution environment
 * @param {Record<string, any>} [extraContext={}] - Additional context properties
 * @returns {Promise<boolean>} True if executed, false if already executed or script not found
 */
export async function runStarts(environment = 'server', extraContext = {}) {
  if (hasRun) {
    return false;
  }

  const scriptPath = findStartScript();
  if (!scriptPath) {
    hasRun = true;
    return false;
  }

  hasRun = true;

  const context = {
    environment,
    isServer: environment === 'server',
    isTerminal: environment === 'terminal',
    isCli: environment === 'terminal',
    ...extraContext,
  };

  app.environment = environment;
  app.isServer = context.isServer;
  app.isTerminal = context.isTerminal;
  app.isCli = context.isCli;
  app.context = context;
  currentContext = context;

  try {
    const fileUrl = pathToFileURL(scriptPath).href;
    const mod = await import(`${fileUrl}?t=${Date.now()}`);
    const startFn = mod.default || mod.start || mod.boot;

    if (typeof startFn === 'function') {
      await startFn(app, context);
    }

    // Resolve items matching current environment
    const targetItems = [
      ...app._global,
      ...(environment === 'server' ? app._server : app._terminal),
    ];

    for (const item of targetItems) {
      try {
        if (typeof item === 'function') {
          const result = await item(context);
          if (
            result &&
            (typeof result === 'object' || typeof result === 'function')
          ) {
            const hook =
              result.default || result.boot || result.start || result.execute;
            if (typeof hook === 'function') {
              await hook(context);
            }
          }
        } else if (typeof item === 'string') {
          const resolved = path.isAbsolute(item)
            ? item
            : path.resolve(path.dirname(scriptPath), item);
          const subMod = await import(pathToFileURL(resolved).href);
          const hook =
            subMod.default || subMod.boot || subMod.start || subMod.execute;
          if (typeof hook === 'function') {
            await hook(context);
          }
        }
      } catch (itemErr) {
        logger.error(
          '[STARTS]',
          `Failed executing registered start item: ${itemErr.message}`
        );
      }
    }

    logger.debug(
      '[STARTS]',
      `Executed start script: ${path.basename(scriptPath)} (${environment}) with ${targetItems.length} registered item(s)`
    );
    return true;
  } catch (err) {
    logger.error(
      '[STARTS]',
      `Failed to execute start script "${path.basename(scriptPath)}": ${err.message}`
    );
    return false;
  }
}

/**
 * Execute a callback only when running in server mode
 * @template T
 * @param {(context: Record<string, any>) => Promise<T> | T} callback
 * @returns {Promise<T | undefined>}
 */
export async function onServer(callback) {
  if (currentContext?.isServer && typeof callback === 'function') {
    return callback(currentContext);
  }
}

/**
 * Execute a callback only when running in terminal (CLI) mode
 * @template T
 * @param {(context: Record<string, any>) => Promise<T> | T} callback
 * @returns {Promise<T | undefined>}
 */
export async function onTerminal(callback) {
  if (currentContext?.isTerminal && typeof callback === 'function') {
    return callback(currentContext);
  }
}

/**
 * Get active start execution context
 * @returns {Record<string, any> | null}
 */
export function getStartsContext() {
  return currentContext;
}

/**
 * Reset execution state (mainly for testing)
 */
export function resetStartsState() {
  hasRun = false;
  currentContext = null;
  app.clear();
}

export default {
  app,
  StartsManager,
  defineStarts,
  findStartScript,
  runStarts,
  onServer,
  onTerminal,
  getStartsContext,
  resetStartsState,
};
