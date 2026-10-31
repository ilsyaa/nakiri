import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirApp } from '@nakiri/core/utils/path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get all migration directories (App)
 * @returns {string[]}
 */
export function getMigrationDirectories() {
  const appMigrations = dirApp('database/migrations');
  if (!fs.existsSync(appMigrations)) {
    fs.mkdirSync(appMigrations, { recursive: true });
  }
  return [appMigrations];
}

/**
 * Get all seed directories (App)
 * @returns {string[]}
 */
export function getSeedDirectories() {
  const appSeeds = dirApp('database/seeds');
  if (!fs.existsSync(appSeeds)) {
    fs.mkdirSync(appSeeds, { recursive: true });
  }
  return [appSeeds];
}

/**
 * Find the first record matching attributes, or create it with merged attributes and values.
 *
 * Usage:
 * - With query builder:
 *   await firstOrCreate(knex('cores'), { id: 'main' }, { prefixes: '["!"]' })
 * - With knex instance and table name:
 *   await firstOrCreate(knex, 'cores', { id: 'main' }, { prefixes: '["!"]' })
 *
 * @template T
 * @param {import('knex').Knex | import('knex').Knex.QueryBuilder} target
 * @param {string | Record<string, any>} tableNameOrAttributes
 * @param {Record<string, any>} [attributesOrValues]
 * @param {Record<string, any>} [maybeValues]
 * @returns {Promise<T & { $wasCreated?: boolean }>}
 */
export async function firstOrCreate(
  target,
  tableNameOrAttributes,
  attributesOrValues = {},
  maybeValues = {}
) {
  /** @type {import('knex').Knex.QueryBuilder} */
  let query;
  let attributes;
  let values = {};

  if (typeof tableNameOrAttributes === 'string') {
    const knex = /** @type {import('knex').Knex} */ (target);
    query = knex(tableNameOrAttributes);
    attributes = attributesOrValues || {};
    values = maybeValues || {};
  } else {
    query = /** @type {import('knex').Knex.QueryBuilder} */ (target);
    attributes = tableNameOrAttributes || {};
    values = attributesOrValues || {};
  }

  // 1. Check if record already exists
  const existing = await query.clone().where(attributes).first();
  if (existing) {
    Object.defineProperty(existing, '$wasCreated', {
      value: false,
      configurable: true,
      enumerable: false,
      writable: true,
    });
    return existing;
  }

  // 2. Insert new record with attributes merged with values
  const dataToInsert = { ...attributes, ...values };

  try {
    await query.clone().clearSelect().clearWhere().insert(dataToInsert);
  } catch (error) {
    const err = /** @type {any} */ (error);
    // Gracefully handle race condition if another process created it concurrently
    const isDuplicate =
      err.code === 'SQLITE_CONSTRAINT' ||
      err.code === 'ER_DUP_ENTRY' ||
      err.code === '23505' ||
      err.message?.includes('UNIQUE constraint') ||
      err.message?.includes('Duplicate entry');

    if (isDuplicate) {
      const createdRecord = await query.clone().where(attributes).first();
      if (createdRecord) {
        Object.defineProperty(createdRecord, '$wasCreated', {
          value: false,
          configurable: true,
          enumerable: false,
          writable: true,
        });
        return createdRecord;
      }
    }
    throw error;
  }

  // 3. Return newly created record
  const result = await query.clone().where(attributes).first();
  if (result) {
    Object.defineProperty(result, '$wasCreated', {
      value: true,
      configurable: true,
      enumerable: false,
      writable: true,
    });
  }
  return result;
}
