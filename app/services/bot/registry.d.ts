import type { CommandDefinition, CommandMiddlewareResolver } from './types.js'

export class CommandRegistry {
  commandsMap: Map<string, CommandDefinition>
  uniqueCommands: Set<CommandDefinition>
  middlewareResolver: CommandMiddlewareResolver | null
  isLoaded: boolean
  loadPromise: Promise<void> | null

  setMiddlewareResolver(resolver: CommandMiddlewareResolver): void
  resolveMiddleware(
    alias: string,
  ): Promise<
    | ((
        payload: any,
        ctx: any,
        args?: string[],
      ) => Promise<boolean | void> | boolean | void)
    | null
  >
  scanFiles(dir: string): string[]
  load(dir?: string): Promise<void>
  getAll(): Promise<CommandDefinition[]>
  get(trigger: string): Promise<CommandDefinition | undefined>
  dispatch(payload: any, ctx: any): Promise<boolean>
}

export const commandRegistry: CommandRegistry
export function loadCommands(dir?: string): Promise<void>
export function getAllCommands(): Promise<CommandDefinition[]>
export function getCommand(
  trigger: string,
): Promise<CommandDefinition | undefined>
export function dispatchCommand(payload: any, ctx: any): Promise<boolean>

export default commandRegistry
