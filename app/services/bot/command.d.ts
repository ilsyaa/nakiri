import type { ParsedMessage } from './message.js'
import type { CommandDefinition } from './types.js'

export declare const DEFAULT_GUARD_MESSAGES: Record<string, string>

export declare function defineCommand(def: CommandDefinition): CommandDefinition

export declare function isCommand(
  msg: any,
  options:
    | string
    | string[]
    | {
        command?: string | string[]
        commands?: string | string[]
        prefix?: boolean | 'optional'
      },
  prefixMode?: boolean | 'optional',
): boolean

export interface CommandValidationResult {
  isValid: boolean
  matched: boolean
  reason?: string
  command?: string
  prefix?: string
  args?: string[]
  argsText?: string
}

export interface ValidateCommandOptions {
  command?: string | string[]
  commands?: string | string[]
  prefix?: boolean | 'optional'
  ownerOnly?: boolean
  adminOnly?: boolean
  superAdminOnly?: boolean
  botAdminOnly?: boolean
  groupOnly?: boolean
  privateOnly?: boolean
  quotedOnly?: boolean
  mediaOnly?: boolean | string[]
  autoReply?: boolean
  messages?: Record<string, string>
}

export declare function validateCommand(
  msg: any,
  options?: ValidateCommandOptions,
): Promise<CommandValidationResult>

declare const _default: {
  defineCommand: typeof defineCommand
  isCommand: typeof isCommand
  validateCommand: typeof validateCommand
  DEFAULT_GUARD_MESSAGES: typeof DEFAULT_GUARD_MESSAGES
}

export default _default
