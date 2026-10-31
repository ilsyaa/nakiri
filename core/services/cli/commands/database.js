import {
  runMigrate,
  runMigrateFresh,
  runMigrateRollback,
  runMigrateStatus,
  runSeed,
  makeMigration,
  makeSeeder,
} from '@nakiri/core/services/database/cli';
import { closeDatabase } from '@nakiri/core/services/database/connection';
import { defineCommand } from '../registry.js';

export const migrateCommand = defineCommand({
  name: 'migrate',
  aliases: ['db:migrate'],
  category: 'database',
  description: 'Run pending database migrations',
  usage: 'migrate [--seed] [--fresh]',
  async execute(args, options) {
    try {
      if (options.fresh) {
        await runMigrateFresh({ seed: Boolean(options.seed) });
      } else {
        await runMigrate({ seed: Boolean(options.seed) });
      }
    } finally {
      await closeDatabase();
    }
  },
});

export const migrateFreshCommand = defineCommand({
  name: 'migrate:fresh',
  aliases: ['db:fresh'],
  category: 'database',
  description: 'Drop all tables and re-run all migrations from scratch',
  usage: 'migrate:fresh [--seed]',
  async execute(args, options) {
    try {
      await runMigrateFresh({ seed: Boolean(options.seed) });
    } finally {
      await closeDatabase();
    }
  },
});

export const migrateRollbackCommand = defineCommand({
  name: 'migrate:rollback',
  aliases: ['db:rollback'],
  category: 'database',
  description: 'Rollback the last migration batch',
  usage: 'migrate:rollback [--all]',
  async execute(args, options) {
    try {
      await runMigrateRollback({ all: Boolean(options.all) });
    } finally {
      await closeDatabase();
    }
  },
});

export const migrateStatusCommand = defineCommand({
  name: 'migrate:status',
  aliases: ['db:status'],
  category: 'database',
  description: 'Show execution status of all migrations',
  usage: 'migrate:status',
  async execute() {
    try {
      await runMigrateStatus();
    } finally {
      await closeDatabase();
    }
  },
});

export const seedCommand = defineCommand({
  name: 'db:seed',
  aliases: ['seed'],
  category: 'database',
  description: 'Run database seeders',
  usage: 'db:seed [specific]',
  async execute(args) {
    try {
      await runSeed({ specific: args[0] });
    } finally {
      await closeDatabase();
    }
  },
});

export const makeMigrateCommand = defineCommand({
  name: 'make:migrate',
  aliases: ['make:migration'],
  category: 'database',
  description: 'Create a new migration file in app/database/migrations/',
  usage: 'make:migrate <name>',
  async execute(args) {
    try {
      await makeMigration(args[0]);
    } finally {
      await closeDatabase();
    }
  },
});

export const makeSeedCommand = defineCommand({
  name: 'make:seed',
  aliases: ['make:seeder'],
  category: 'database',
  description: 'Create a new seeder file in app/database/seeds/',
  usage: 'make:seed <name>',
  async execute(args) {
    try {
      await makeSeeder(args[0]);
    } finally {
      await closeDatabase();
    }
  },
});

export const databaseCommands = [
  migrateCommand,
  migrateFreshCommand,
  migrateRollbackCommand,
  migrateStatusCommand,
  seedCommand,
  makeMigrateCommand,
  makeSeedCommand,
];

export default databaseCommands;
