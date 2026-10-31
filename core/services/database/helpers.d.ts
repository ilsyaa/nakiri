import type { Knex } from 'knex'

/**
 * Get all migration directories (Core + Modules)
 */
export function getMigrationDirectories(): string[]

/**
 * Get all seed directories (Core + Modules)
 */
export function getSeedDirectories(): string[]

/**
 * Find the first record matching attributes, or create it with merged attributes and values.
 */
export function firstOrCreate<T = any>(
  query: Knex.QueryBuilder,
  attributes: Record<string, any>,
  values?: Record<string, any>,
): Promise<T & { $wasCreated?: boolean }>

export function firstOrCreate<T = any>(
  knex: Knex,
  tableName: string,
  attributes: Record<string, any>,
  values?: Record<string, any>,
): Promise<T & { $wasCreated?: boolean }>
