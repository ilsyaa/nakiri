import { CliRegistry, CommandDefinition } from './registry.js'

export * from './registry.js'

export const cliRegistry: CliRegistry

export function isCliCommand(command?: string): boolean

export function runCli(rawArgs: string[]): Promise<number>

declare const _default: CliRegistry

export default _default
