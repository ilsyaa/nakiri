import type { Knex } from 'knex'

export function getDatabaseConfig(): Record<string, Knex.Config>
export const databaseConfig: Record<string, Knex.Config>
export default databaseConfig
