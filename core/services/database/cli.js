import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import * as p from '@clack/prompts';
import { dirApp } from '@nakiri/core/utils/path';
import logger from '@nakiri/core/utils/logger';
import { db, closeDatabase } from './connection.js';
import { getMigrationDirectories, getSeedDirectories } from './helpers.js';

const KNOWN_COMMANDS = new Set([
  'migrate',
  'migrate:fresh',
  'migrate:rollback',
  'migrate:status',
  'make:migrate',
  'make:migration',
  'make:seed',
  'make:seeder',
  'db:seed',
  'seed',
  'db:help',
  'migrate:help',
]);

/**
 * Check if the given CLI argument matches any database CLI command.
 * @param {string} [command]
 * @returns {boolean}
 */
export function isDatabaseCliCommand(command) {
  if (!command) return false;
  return KNOWN_COMMANDS.has(command.toLowerCase());
}

/**
 * Generate standard YYYYMMDDHHmmss timestamp string.
 * @returns {string}
 */
function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Create a new migration file in app/database/migrations
 * @param {string} [rawName]
 * @returns {Promise<void>}
 */
export async function makeMigration(rawName) {
  let name = rawName?.trim();

  if (!name) {
    if (process.stdin.isTTY) {
      const response = await p.text({
        message: 'Enter migration name:',
        placeholder: 'create_users_table',
        validate(value) {
          if (!value || !value.trim()) return 'Migration name is required!';
        },
      });

      if (p.isCancel(response)) {
        p.cancel('Operation cancelled.');
        return;
      }
      name = String(response).trim();
    } else {
      throw new Error(
        'Migration name is required. Usage: node nakiri make:migrate <name>'
      );
    }
  }

  // Normalize name to snake_case without extension
  const sanitized = name
    .toLowerCase()
    .replace(/\.js$/, '')
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!sanitized) {
    throw new Error(`Invalid migration name: "${name}"`);
  }

  const timestamp = generateTimestamp();
  const fileName = `${timestamp}_${sanitized}.js`;
  const migrationsDir = dirApp('database/migrations');

  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const targetPath = path.join(migrationsDir, fileName);

  // Detect if name matches create_<table_name>_table
  const match = sanitized.match(/^create_(.+)_table$/);
  let templateContent = '';

  if (match && match[1]) {
    const tableName = match[1];
    templateContent = `/**
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable('${tableName}', (table) => {
    table.increments('id').primary();
    table.timestamps(true, true);
  });
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('${tableName}');
}
`;
  } else {
    templateContent = `/**
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  // Write migration schema modifications here
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
  // Write rollback logic here
}
`;
  }

  fs.writeFileSync(targetPath, templateContent, 'utf-8');
  logger.success(
    '[DATABASE]',
    `Created migration: app/database/migrations/${fileName}`
  );
}

/**
 * Create a new seeder file in app/database/seeds
 * @param {string} [rawName]
 * @returns {Promise<void>}
 */
export async function makeSeeder(rawName) {
  let name = rawName?.trim();

  if (!name) {
    if (process.stdin.isTTY) {
      const response = await p.text({
        message: 'Enter seeder name:',
        placeholder: 'user_seeder',
        validate(value) {
          if (!value || !value.trim()) return 'Seeder name is required!';
        },
      });

      if (p.isCancel(response)) {
        p.cancel('Operation cancelled.');
        return;
      }
      name = String(response).trim();
    } else {
      throw new Error(
        'Seeder name is required. Usage: node nakiri make:seed <name>'
      );
    }
  }

  const sanitized = name
    .toLowerCase()
    .replace(/\.js$/, '')
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!sanitized) {
    throw new Error(`Invalid seeder name: "${name}"`);
  }

  const fileName = `${sanitized}.js`;
  const seedsDir = dirApp('database/seeds');

  if (!fs.existsSync(seedsDir)) {
    fs.mkdirSync(seedsDir, { recursive: true });
  }

  const targetPath = path.join(seedsDir, fileName);

  const templateContent = `import { firstOrCreate } from '@nakiri/core/services/database';

/**
 * @param {import('knex').Knex} knex
 */
export async function seed(knex) {
  // Insert default seed records here
}
`;

  fs.writeFileSync(targetPath, templateContent, 'utf-8');
  logger.success(
    '[DATABASE]',
    `Created seeder: app/database/seeds/${fileName}`
  );
}

/**
 * Drop all user tables from the active database connection.
 * @returns {Promise<string[]>} List of dropped tables
 */
export async function dropAllTables() {
  const clientName = db.client.config.client;
  const droppedTables = [];

  if (clientName === 'better-sqlite3' || clientName === 'sqlite3') {
    await db.raw('PRAGMA foreign_keys = OFF;');
    const tables = await db('sqlite_master')
      .where('type', 'table')
      .whereNot('name', 'like', 'sqlite_%')
      .select('name');

    for (const { name } of tables) {
      await db.schema.dropTableIfExists(name);
      droppedTables.push(name);
    }
    await db.raw('PRAGMA foreign_keys = ON;');
  } else {
    // MySQL / MariaDB
    await db.raw('SET FOREIGN_KEY_CHECKS = 0;');
    const [tables] = await db.raw(
      'SHOW FULL TABLES WHERE Table_type = "BASE TABLE"'
    );
    for (const row of tables) {
      const tableName = Object.values(row)[0];
      await db.schema.dropTableIfExists(tableName);
      droppedTables.push(tableName);
    }
    await db.raw('SET FOREIGN_KEY_CHECKS = 1;');
  }

  return droppedTables;
}

/**
 * Run pending database migrations
 * @param {object} [options]
 * @param {boolean} [options.seed=false]
 * @returns {Promise<void>}
 */
export async function runMigrate({ seed = false } = {}) {
  const migrationDirs = getMigrationDirectories();
  const [batchNo, log] = await db.migrate.latest({
    directory: migrationDirs,
    tableName: 'knex_migrations',
  });

  if (log && log.length > 0) {
    for (const file of log) {
      logger.success(
        '[DATABASE]',
        `Migrated: ${path.basename(file)} (batch ${batchNo})`
      );
    }
  } else {
    logger.info('[DATABASE]', 'Database schema is already up to date.');
  }

  if (seed) {
    await runSeed();
  }
}

/**
 * Drop all tables and re-run all migrations from scratch.
 * @param {object} [options]
 * @param {boolean} [options.seed=false]
 * @returns {Promise<void>}
 */
export async function runMigrateFresh({ seed = false } = {}) {
  logger.warn('[DATABASE]', 'Dropping all existing database tables...');
  const dropped = await dropAllTables();
  if (dropped.length > 0) {
    logger.info(
      '[DATABASE]',
      `Dropped ${dropped.length} table(s): ${dropped.join(', ')}`
    );
  }

  logger.info('[DATABASE]', 'Running migrations from scratch...');
  const migrationDirs = getMigrationDirectories();
  const [batchNo, log] = await db.migrate.latest({
    directory: migrationDirs,
    tableName: 'knex_migrations',
  });

  if (log && log.length > 0) {
    for (const file of log) {
      logger.success(
        '[DATABASE]',
        `Migrated: ${path.basename(file)} (batch ${batchNo})`
      );
    }
  } else {
    logger.info('[DATABASE]', 'No migration files found to execute.');
  }

  if (seed) {
    await runSeed();
  }
}

/**
 * Rollback the last migration batch or all migrations.
 * @param {object} [options]
 * @param {boolean} [options.all=false]
 * @returns {Promise<void>}
 */
export async function runMigrateRollback({ all = false } = {}) {
  const migrationDirs = getMigrationDirectories();
  const [batchNo, log] = await db.migrate.rollback(
    {
      directory: migrationDirs,
      tableName: 'knex_migrations',
    },
    all
  );

  if (log && log.length > 0) {
    for (const file of log) {
      logger.warn(
        '[DATABASE]',
        `Rolled back: ${path.basename(file)} (batch ${batchNo})`
      );
    }
  } else {
    logger.info(
      '[DATABASE]',
      'Already at the base migration. Nothing to rollback.'
    );
  }
}

/**
 * Show list and execution status of all migrations.
 * @returns {Promise<void>}
 */
export async function runMigrateStatus() {
  const migrationDirs = getMigrationDirectories();
  const [completed, pending] = await db.migrate.list({
    directory: migrationDirs,
    tableName: 'knex_migrations',
  });

  console.log(pc.bold('\n Database Migrations Status:'));
  console.log(pc.dim('--------------------------------------------------'));

  if (completed.length === 0 && pending.length === 0) {
    console.log(pc.yellow('  No migrations found in app/database/migrations'));
  } else {
    for (const item of completed) {
      const fileName = typeof item === 'string' ? item : item.name || item.file;
      console.log(`  ${pc.green('✔ Ran     ')}  ${fileName}`);
    }
    for (const item of pending) {
      const fileName = typeof item === 'string' ? item : item.file || item.name;
      console.log(`  ${pc.yellow('⏳ Pending ')}  ${fileName}`);
    }
  }

  console.log(pc.dim('--------------------------------------------------'));
  console.log(
    ` Total: ${pc.bold(String(completed.length + pending.length))} | Ran: ${pc.green(String(completed.length))} | Pending: ${pc.yellow(String(pending.length))}\n`
  );
}

/**
 * Run database seeders.
 * @param {object} [options]
 * @param {string} [options.specific]
 * @returns {Promise<void>}
 */
export async function runSeed({ specific } = {}) {
  const seedDirs = getSeedDirectories();
  const [log] = await db.seed.run({
    directory: seedDirs,
    specific,
  });

  if (log && log.length > 0) {
    for (const file of log) {
      logger.success('[DATABASE]', `Seeded: ${path.basename(file)}`);
    }
  } else {
    logger.info('[DATABASE]', 'No seed files found to execute.');
  }
}

/**
 * Print CLI help overview for database commands.
 */
export function printDatabaseHelp() {
  console.log(pc.bold('\nNakiri Database CLI Commands:'));
  console.log(
    pc.dim('==================================================================')
  );
  console.log(
    `  ${pc.cyan('node nakiri migrate')}                 Run all pending migrations`
  );
  console.log(
    `  ${pc.cyan('node nakiri migrate --seed')}          Run migrations and execute seeders`
  );
  console.log(
    `  ${pc.cyan('node nakiri migrate:fresh')}           Drop all tables and re-run all migrations`
  );
  console.log(
    `  ${pc.cyan('node nakiri migrate:fresh --seed')}    Drop tables, migrate, and execute seeders`
  );
  console.log(
    `  ${pc.cyan('node nakiri migrate:rollback')}        Rollback the last batch of migrations`
  );
  console.log(
    `  ${pc.cyan('node nakiri migrate:rollback --all')}  Rollback all executed migrations`
  );
  console.log(
    `  ${pc.cyan('node nakiri migrate:status')}          Show status of completed & pending migrations`
  );
  console.log(
    `  ${pc.cyan('node nakiri make:migrate <name>')}     Create a new migration file`
  );
  console.log(
    `  ${pc.cyan('node nakiri make:seed <name>')}        Create a new seeder file`
  );
  console.log(
    `  ${pc.cyan('node nakiri db:seed')}                 Run all database seeders`
  );
  console.log(
    pc.dim(
      '==================================================================\n'
    )
  );
}

/**
 * Dispatch CLI arguments to the corresponding database command.
 * @param {string[]} args - Process arguments (e.g. process.argv.slice(2))
 * @returns {Promise<number>} Exit code (0 for success, 1 for failure)
 */
export async function handleDatabaseCli(args) {
  if (!args || args.length === 0) return 0;

  const rawCommand = args[0].toLowerCase();
  const hasSeedFlag = args.includes('--seed');
  const hasAllFlag = args.includes('--all');
  const targetName = args[1] && !args[1].startsWith('--') ? args[1] : undefined;

  try {
    switch (rawCommand) {
      case 'make:migrate':
      case 'make:migration':
        await makeMigration(targetName);
        break;

      case 'make:seed':
      case 'make:seeder':
        await makeSeeder(targetName);
        break;

      case 'migrate':
        if (args.includes('--fresh') || args.includes(':fresh')) {
          await runMigrateFresh({ seed: hasSeedFlag });
        } else {
          await runMigrate({ seed: hasSeedFlag });
        }
        break;

      case 'migrate:fresh':
        await runMigrateFresh({ seed: hasSeedFlag });
        break;

      case 'migrate:rollback':
        await runMigrateRollback({ all: hasAllFlag });
        break;

      case 'migrate:status':
        await runMigrateStatus();
        break;

      case 'db:seed':
      case 'seed':
        await runSeed({ specific: targetName });
        break;

      case 'db:help':
      case 'migrate:help':
        printDatabaseHelp();
        break;

      default:
        logger.error('[DATABASE]', `Unknown database command: "${rawCommand}"`);
        printDatabaseHelp();
        return 1;
    }

    return 0;
  } catch (error) {
    logger.error('[DATABASE]', error.message ?? error);
    return 1;
  } finally {
    await closeDatabase();
  }
}

export default {
  isDatabaseCliCommand,
  handleDatabaseCli,
  makeMigration,
  makeSeeder,
  runMigrate,
  runMigrateFresh,
  runMigrateRollback,
  runMigrateStatus,
  runSeed,
  dropAllTables,
  printDatabaseHelp,
};
