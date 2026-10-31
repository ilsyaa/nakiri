import fs from 'fs';
import { pathToFileURL } from 'url';
import { dirApp } from '@nakiri/core/utils/path';
import logger from '@nakiri/core/utils/logger';

/**
 * Cache loaded kernel module
 * @type {any}
 */
let cachedKernel = null;

/**
 * Load app/starts/kernel.js dynamically
 * @returns {Promise<any>}
 */
export async function getKernel() {
  if (cachedKernel) return cachedKernel;

  try {
    const kernelPath = dirApp('starts', 'kernel.js');
    if (fs.existsSync(kernelPath)) {
      const kernelUrl = pathToFileURL(kernelPath).href;
      cachedKernel = await import(`${kernelUrl}?t=${Date.now()}`);
      return cachedKernel;
    }
  } catch (err) {
    logger.warn(
      '[KERNEL]',
      `Failed to load app/starts/kernel.js: ${err.message}`
    );
  }

  return null;
}

/**
 * Reset cached kernel (useful for hot-reloading and testing)
 */
export function resetKernelCache() {
  cachedKernel = null;
  resolvedMiddlewareCache.clear();
}

/**
 * Cache of resolved command middlewares for instant $O(1)$ lookups
 * @type {Map<string, import('./types.js').CommandMiddlewareHandler>}
 */
const resolvedMiddlewareCache = new Map();

/**
 * Resolve a custom command middleware by alias name from kernel.js
 * @param {string} alias
 * @returns {Promise<import('./types.js').CommandMiddlewareHandler | null>}
 */
export async function getCommandMiddleware(alias) {
  if (resolvedMiddlewareCache.has(alias)) {
    return resolvedMiddlewareCache.get(alias) || null;
  }

  const kernel = await getKernel();
  const lazyLoader = kernel?.middlewareAliases?.[alias];
  if (!lazyLoader) return null;

  try {
    const mod = await lazyLoader();
    /** @type {import('./types.js').CommandMiddlewareHandler} */
    const handler = typeof mod === 'function' ? mod : mod?.default || mod;
    resolvedMiddlewareCache.set(alias, handler);
    return handler;
  } catch (err) {
    logger.error(
      '[KERNEL]',
      `Failed to resolve command middleware alias "${alias}": ${err.message}`
    );
    return null;
  }
}

/**
 * Execute the sequence of event middlewares for a given event name from kernel.js
 * @param {string} eventName
 * @param {any} payload
 * @param {any} ctx
 * @returns {Promise<boolean>} returns false if stopped, true otherwise
 */
export async function runEventMiddlewares(eventName, payload, ctx) {
  const kernel = await getKernel();
  const loaders = kernel?.eventMiddlewares?.[eventName];
  if (!Array.isArray(loaders) || loaders.length === 0) return true;

  for (const load of loaders) {
    if (ctx.isStopped) return false;

    const mod = await load();
    const middleware = mod.default || mod;

    const result = await middleware(payload, ctx);
    if (result === false || ctx.isStopped) {
      return false;
    }
  }

  return !ctx.isStopped;
}

export default {
  getKernel,
  resetKernelCache,
  getCommandMiddleware,
  runEventMiddlewares,
};
