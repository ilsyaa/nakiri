import type { ParsedMessage } from '#app/services/bot/message.js'

/**
 * Userland Context Augmentation
 *
 * This file is for userland addons and custom property injections into ctx.
 * Any properties attached to ctx by your middlewares or services should be declared here
 * to enjoy full IDE autocomplete and type safety across all commands and event handlers.
 */
declare module '@nakiri/core/services/modules' {
  interface ModuleContext {
    /**
     * Normalized parsed message object (injected by message gateway)
     */
    msg?: ParsedMessage

    /**
     * Bot database record and configuration (injected by bot-table middleware)
     */
    tableBot?: any

    /**
     * Group database record and settings (injected by group middleware)
     */
    tableGroup?: any

    /**
     * Group member database record (injected by group middleware)
     */
    tableGroupMember?: any
  }
}

declare module '#app/services/bot/types.js' {
  interface CommandContext {
    /**
     * Normalized parsed message object (guaranteed present in command execution)
     */
    msg: ParsedMessage

    /**
     * Bot database record and configuration
     */
    tableBot?: any

    /**
     * Group database record and settings
     */
    tableGroup?: any

    /**
     * Group member database record
     */
    tableGroupMember?: any
  }
}
