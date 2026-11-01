import type { ModuleContext } from '@nakiri/core/services/modules'
import type { ParsedMessage } from './message.js'

export interface CommandContext extends ModuleContext<'message'> {
  msg: ParsedMessage
  [key: string]: any
}

export type LazyMiddleware<T = any> = () => Promise<{ default: T } | T>

export type CommandMiddlewareHandler = (
  payload: any,
  ctx: CommandContext,
  args?: string[],
) => Promise<boolean | void> | boolean | void

export type MiddlewareAliasesConfig = Record<
  string,
  LazyMiddleware<CommandMiddlewareHandler>
>

export type CommandMiddlewareResolver = (
  alias: string,
) => Promise<CommandMiddlewareHandler | null> | CommandMiddlewareHandler | null

export interface CommandDefinition {
  /**
   * Unique command identifier name (e.g. 'kick', 'owner', 'ping')
   * Strictly metadata, NOT used as a command trigger.
   */
  readonly name: string

  /**
   * Concise description in English
   */
  readonly description?: string

  /**
   * Category group (e.g. 'owner', 'group', 'utility', 'media')
   */
  readonly category?: string

  /**
   * Command triggers executed by user in WhatsApp (e.g. ['kick'], ['ping'], ['menu', 'help'])
   */
  readonly aliases: string[]

  /**
   * Parameterized middleware rules applied before execute()
   * Example: `['group', 'sender:admin,isOwner', 'bot:admin']`
   */
  readonly middlewares?: string[]

  /**
   * Prefix requirement rule:
   * - `true`: must start with configured prefix (default)
   * - `false`: must NOT have prefix (e.g. '>', '$')
   * - `'optional'`: can execute with or without prefix
   * @default true
   */
  readonly prefix?: boolean | 'optional'

  /**
   * Shorthand equivalent to prefix: false
   * @default false
   */
  readonly withoutPrefix?: boolean

  /**
   * Command execution handler
   */
  readonly execute: (payload: any, ctx: CommandContext) => Promise<any> | any
}
