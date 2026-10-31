export function isDatabaseCliCommand(command?: string): boolean
export function handleDatabaseCli(args: string[]): Promise<number>
export function makeMigration(rawName?: string): Promise<void>
export function makeSeeder(rawName?: string): Promise<void>
export function runMigrate(options?: { seed?: boolean }): Promise<void>
export function runMigrateFresh(options?: { seed?: boolean }): Promise<void>
export function runMigrateRollback(options?: { all?: boolean }): Promise<void>
export function runMigrateStatus(): Promise<void>
export function runSeed(options?: { specific?: string }): Promise<void>
export function dropAllTables(): Promise<string[]>
export function printDatabaseHelp(): void

declare const _default: {
  isDatabaseCliCommand: typeof isDatabaseCliCommand
  handleDatabaseCli: typeof handleDatabaseCli
  makeMigration: typeof makeMigration
  makeSeeder: typeof makeSeeder
  runMigrate: typeof runMigrate
  runMigrateFresh: typeof runMigrateFresh
  runMigrateRollback: typeof runMigrateRollback
  runMigrateStatus: typeof runMigrateStatus
  runSeed: typeof runSeed
  dropAllTables: typeof dropAllTables
  printDatabaseHelp: typeof printDatabaseHelp
}

export default _default
