import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { dirEvents, dirApp } from '@nakiri/core/utils/path';
import logger from '@nakiri/core/utils/logger';
import { runPipeline } from './pipeline.js';
import { runStarts } from '@nakiri/core/services/starts/runner.js';

export class ModuleLoader {
  constructor() {
    /** @type {Map<string, any>} filePath -> module */
    this.modules = new Map();
    /** @type {Map<string, any[]>} eventName -> module[] */
    this.eventListeners = new Map();
  }

  /**
   * Memindai dan memuat semua modul event dari app/events/
   * @param {string} [dir]
   */
  async load(dir) {
    this.modules.clear();
    this.eventListeners.clear();

    const eventsDir = dir || dirEvents();
    if (!fs.existsSync(eventsDir)) {
      fs.mkdirSync(eventsDir, { recursive: true });
      return;
    }

    const files = this.scanFiles(eventsDir);
    logger.debug('[LOADER]', `Found ${files.length} event handler file(s).`);

    for (const filePath of files) {
      await this.loadFile(filePath);
    }

    // Urutkan modul di setiap event channel berdasarkan level (ascending: 1, 2, ... 10)
    for (const [, handlers] of this.eventListeners.entries()) {
      handlers.sort((a, b) => (a.level ?? 10) - (b.level ?? 10));
    }

    logger.info(
      '[LOADER]',
      `Loaded ${this.modules.size} module(s) across ${this.eventListeners.size} event channel(s).`
    );
  }

  /**
   * Memindai berkas handler event secara rekursif
   * @param {string} dir
   * @returns {string[]}
   */
  scanFiles(dir) {
    const results = [];

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
        '[LOADER]',
        `Failed to scan directory ${dir}: ${err.message}`
      );
    }
    return results;
  }

  /**
   * Execute application start script once during bot server boot.
   * @param {Record<string, any>} [context]
   * @returns {Promise<boolean>}
   */
  async boot(context = {}) {
    return runStarts('server', context);
  }

  /**
   * Memuat dan memvalidasi satu berkas modul
   * @param {string} filePath
   */
  async loadFile(filePath) {
    try {
      const fileUrl = pathToFileURL(filePath).href;
      const mod = await import(`${fileUrl}?t=${Date.now()}`);
      const moduleDef = mod.default || mod;

      if (!moduleDef || typeof moduleDef !== 'object') {
        logger.warn(
          '[LOADER]',
          `Skipping ${path.basename(filePath)}: export default is not an object.`
        );
        return;
      }

      if (typeof moduleDef.execute !== 'function') {
        logger.warn(
          '[LOADER]',
          `Skipping ${path.basename(filePath)}: "execute" function not found.`
        );
        return;
      }

      const relative = path.relative(dirEvents(), filePath);
      const dirName = path.dirname(relative);
      const category =
        moduleDef.category ||
        (dirName !== '.' ? dirName.split(path.sep)[0] : 'general') ||
        'general';
      const baseName = path.basename(filePath, '.js');
      const name = moduleDef.name || `${category}-${baseName}`;
      const level = Number(moduleDef.level ?? 10);

      // Normalisasi event yang didengarkan
      const rawEvents = moduleDef.events || moduleDef.event || 'message';
      const targetEvents = Array.isArray(rawEvents) ? rawEvents : [rawEvents];

      const moduleRecord = {
        ...moduleDef,
        name,
        category,
        level,
        events: targetEvents,
        filePath,
      };

      this.modules.set(filePath, moduleRecord);

      for (const eventName of targetEvents) {
        if (!this.eventListeners.has(eventName)) {
          this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(moduleRecord);
      }
    } catch (err) {
      logger.error(
        '[LOADER]',
        `Failed to load module "${filePath}": ${err.message}`
      );
    }
  }

  /**
   * Mengalirkan event Zapo melewati pipeline modul yang terurut berdasarkan level
   * @param {string} eventName
   * @param {any} payload
   * @param {{ client: any, sessionId: string }} context
   */
  async dispatch(eventName, payload, context) {
    const specificHandlers = this.eventListeners.get(eventName) || [];
    const wildcardHandlers = this.eventListeners.get('*') || [];

    if (specificHandlers.length === 0 && wildcardHandlers.length === 0) {
      return;
    }

    // Gabungkan handler spesifik & wildcard, deduplikasi, lalu urutkan berdasarkan level
    const combined = Array.from(
      new Set([...specificHandlers, ...wildcardHandlers])
    );
    combined.sort((a, b) => (a.level ?? 10) - (b.level ?? 10));

    try {
      await runPipeline(combined, payload, {
        ...context,
        eventName,
      });
    } catch (err) {
      logger.error(
        `[DISPATCHER:${eventName}]`,
        `Error in execution pipeline: ${err.message ?? err}`
      );
    }
  }

  /**
   * Menghubungkan ModuleLoader ke instance WhatsAppEventBus
   * @param {import('../whatsapp/events.js').WhatsAppEventBus} events
   */
  bind(events) {
    for (const eventName of this.eventListeners.keys()) {
      if (eventName === '*') continue;
      events.on(eventName, (payload, sessionId, client) => {
        this.dispatch(eventName, payload, { client, sessionId });
      });
    }

    logger.debug(
      '[LOADER]',
      `Event dispatcher connected to ${this.eventListeners.size} event channel(s).`
    );
  }
}

export const moduleLoader = new ModuleLoader();
export default moduleLoader;
