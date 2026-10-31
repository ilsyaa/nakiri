export type StartEnvironment = 'server' | 'terminal'

export interface StartContext {
  environment: StartEnvironment
  isServer: boolean
  isTerminal: boolean
  isCli: boolean
  [key: string]: any
}

export type StartHandler = (context: StartContext) => Promise<any> | any

export type StartItem = StartHandler | string

export class StartsManager {
  environment: StartEnvironment | null
  isServer: boolean
  isTerminal: boolean
  isCli: boolean
  context: StartContext | null

  use(items: StartItem[] | StartItem): this
  server(items: StartItem[] | StartItem): this
  terminal(items: StartItem[] | StartItem): this
  cli(items: StartItem[] | StartItem): this
  clear(): void
}

export const app: StartsManager

export function defineStarts(
  callback: (app: StartsManager, context: StartContext) => any,
): (app: StartsManager, context: StartContext) => any

export function findStartScript(): string | null

export function runStarts(
  environment?: StartEnvironment,
  extraContext?: Record<string, any>,
): Promise<boolean>

export function onServer<T = any>(
  callback: (context: StartContext) => Promise<T> | T,
): Promise<T | undefined>

export function onTerminal<T = any>(
  callback: (context: StartContext) => Promise<T> | T,
): Promise<T | undefined>

export function getStartsContext(): StartContext | null

export function resetStartsState(): void

declare const _default: {
  app: StartsManager
  StartsManager: typeof StartsManager
  defineStarts: typeof defineStarts
  findStartScript: typeof findStartScript
  runStarts: typeof runStarts
  onServer: typeof onServer
  onTerminal: typeof onTerminal
  getStartsContext: typeof getStartsContext
  resetStartsState: typeof resetStartsState
}

export default _default
