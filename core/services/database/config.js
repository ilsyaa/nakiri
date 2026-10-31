import env from '@nakiri/core/services/env';
import { dirStorage } from '@nakiri/core/utils/path';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getMigrationDirectories, getSeedDirectories } from './helpers.js';

const __filename = fileURLToPath(import.meta.url);
const isCompiled = __filename.endsWith('.js');
const loadExtensions = isCompiled ? ['.js'] : ['.ts'];

const sqliteFilename = dirStorage('database.sqlite');
fs.mkdirSync(path.dirname(sqliteFilename), { recursive: true });

/**
 * Generate Knex database configuration dynamically.
 * @returns {Record<string, import('knex').Knex.Config>}
 */
export const getDatabaseConfig = () => {
  const migrationDirs = getMigrationDirectories();
  const seedDirs = getSeedDirectories();

  return {
    mysql: {
      client: 'mysql2',
      connection: {
        host: env.DB_HOST || '127.0.0.1',
        port: env.DB_PORT || 3306,
        user: env.DB_USER || 'root',
        password: env.DB_PASSWORD || '',
        database: env.DB_DATABASE || 'nakiri',
      },
      migrations: {
        directory: migrationDirs,
        tableName: 'knex_migrations',
        loadExtensions,
      },
      seeds: {
        directory: seedDirs,
        loadExtensions,
      },
      pool: {
        min: 2,
        max: 10,
      },
    },
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: sqliteFilename,
      },
      useNullAsDefault: true,
      migrations: {
        directory: migrationDirs,
        tableName: 'knex_migrations',
        loadExtensions,
      },
      seeds: {
        directory: seedDirs,
        loadExtensions,
      },
    },
  };
};

export const databaseConfig = getDatabaseConfig();

export default databaseConfig;
