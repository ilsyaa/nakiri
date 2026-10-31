import knex from 'knex';
import env from '@nakiri/core/services/env';
import { getDatabaseConfig } from './config.js';
import logger from '@nakiri/core/utils/logger';

const config = getDatabaseConfig()[env.DB_CONNECTION];
if (!config) {
  throw new Error(`Unsupported DB_CONNECTION: "${env.DB_CONNECTION}"`);
}

/** @type {import('knex').Knex} */
export const db = knex(config);

db.client.on('query', (query) => {
  if (query.bindings) {
    query.bindings = query.bindings.map((v) =>
      typeof v === 'object' && v !== null ? JSON.stringify(v) : v
    );
  }
});

/**
 * Initialize and verify database connection.
 *
 * @returns {Promise<import('knex').Knex>}
 */
export const initDatabase = async () => {
  try {
    await db.raw('SELECT 1');
    logger.success('[DATABASE]', `Database connected (${env.DB_CONNECTION}).`);
    return db;
  } catch (err) {
    logger.error('[DATABASE]', `Database connection failed: ${err.message}`);
    throw err;
  }
};

/**
 * Close database connection pool gracefully.
 * @returns {Promise<void>}
 */
export const closeDatabase = async () => {
  if (db) {
    try {
      await db.destroy();
      logger.info('[DATABASE]', 'Database connection pool closed.');
    } catch (err) {
      logger.error('[DATABASE]', `Failed to close database: ${err.message}`);
    }
  }
};

export default { db, initDatabase, closeDatabase };
