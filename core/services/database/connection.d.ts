import type { Knex } from 'knex'

export const db: Knex

export function initDatabase(): Promise<Knex>
export function closeDatabase(): Promise<void>

declare const _default: {
  db: Knex
  initDatabase: typeof initDatabase
  closeDatabase: typeof closeDatabase
}

export default _default
