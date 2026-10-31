export interface MessageFlags {
  readonly fromMe: boolean
  readonly isGroup: boolean
  readonly isText: boolean
  readonly isSticker: boolean
  readonly isStickerAnimated: boolean
  readonly isImage: boolean
  readonly isVideo: boolean
  readonly isAudio: boolean
  readonly isDocument: boolean
  readonly isMedia: boolean
  readonly isBroadcast: boolean
  readonly isNewsletter: boolean
}

export interface ActorPermissions {
  readonly isOwner: boolean
  readonly admin: boolean
  readonly superAdmin: boolean
}

export interface MessagePermissions {
  readonly bot: ActorPermissions
  readonly sender: ActorPermissions
}

export interface BotIdentity {
  readonly id: string | null
  readonly lid: string | null
  readonly pn: string | null
}

export interface SenderIdentity {
  readonly id: string | null
  readonly lid: string | null
  readonly pn: string | null
  readonly name: string | null
}

export interface MessageBody {
  readonly mtype: string
  readonly rawText: string
  readonly prefix: string
  readonly command: string
  readonly commandWithoutPrefix: string
  readonly argsText: string
  readonly args: string[]
  readonly mentionedJid: string[]
  readonly expiration: number
}

export interface QuotedSender {
  readonly id: string | null
  readonly lid: string | null
  readonly pn: string | null
}

export interface QuotedFlags {
  readonly fromMe: boolean
  readonly isText: boolean
  readonly isMedia: boolean
  readonly isImage: boolean
  readonly isVideo: boolean
  readonly isAudio: boolean
  readonly isSticker: boolean
  readonly isStickerAnimated: boolean
  readonly isDocument: boolean
}

export interface QuotedBody {
  readonly mtype: string
  readonly rawText: string
  readonly prefix: string
  readonly command: string
  readonly commandWithoutPrefix: string
  readonly argsText: string
  readonly args: string[]
  readonly mentionedJid: string[]
  readonly expiration: number
}

export interface DownloadMediaOptions {
  readonly toFile?: string
  readonly asStream?: boolean
  readonly maxBytes?: number
  readonly signal?: AbortSignal
}

export interface QuotedMessage {
  readonly stanzaId: string
  readonly sender: QuotedSender
  readonly permissions: ActorPermissions
  readonly flags: QuotedFlags
  readonly body: MessageBody
  send(content: string | any, options?: any): Promise<any>
  send(destination: string, content: string | any, options?: any): Promise<any>
  reply(content: string | any, options?: any): Promise<any>
  react(emoji?: string): Promise<any>
  download(
    options?: DownloadMediaOptions,
  ): Promise<Buffer | import('stream').Readable | string>
}

export interface ParsedMessage {
  readonly chat: string
  readonly group: any | null
  readonly flags: MessageFlags
  readonly permissions: MessagePermissions
  readonly bot: BotIdentity
  readonly sender: SenderIdentity
  readonly body: MessageBody
  readonly quoted: QuotedMessage | null
  send(content: string | any, options?: any): Promise<any>
  send(destination: string, content: string | any, options?: any): Promise<any>
  reply(content: string | any, options?: any): Promise<any>
  react(emoji?: string): Promise<any>
  download(
    options?: DownloadMediaOptions,
  ): Promise<Buffer | import('stream').Readable | string>
  isCommand(
    options: string | string[] | import('./command.js').CommandOptions,
    prefixMode?: import('./command.js').CommandPrefixMode,
  ): boolean
  validateCommand(
    options?: import('./command.js').CommandGuardOptions,
  ): Promise<import('./command.js').CommandValidationResult>
}

export interface BotSettings {
  readonly id?: number
  readonly owners?: string[]
  readonly prefixes?: string[]
  readonly self?: boolean
  readonly [key: string]: any
}

/**
 * Fetch group metadata with standardized caching (15 minutes TTL)
 */
export function getGroupMetadata(
  client: any,
  groupJid: string,
  force?: boolean,
): Promise<any | null>

/**
 * Clear group metadata cache for a specific group or all groups
 */
export function clearGroupMetadataCache(groupJid?: string): void

/**
 * Parse and normalize incoming message metadata and identities
 *
 * @param payload Native Zapo message payload
 * @param client Optional Zapo client instance to resolve bot credentials
 */
export function parseMessage(
  payload: any,
  client?: any,
  botSettings?: any,
): Promise<ParsedMessage>

/**
 * Convenient alias for parseMessage
 */
export const serialize: typeof parseMessage

/**
 * Extract user and LID JIDs from text containing @<phoneOrLid> mentions
 */
export function extractMentionsFromText(text: string): string[]

/**
 * Send a message with automatic mention resolution
 */
export function send(
  client: any,
  target: any,
  content: string | any,
  options?: any,
): Promise<any>

/**
 * Send a reply to a message with automatic mention resolution
 */
export function reply(
  client: any,
  target: any,
  content: string | any,
  options?: any,
): Promise<any>

/**
 * React to a message with an emoji
 */
export function react(client: any, target: any, emoji?: string): Promise<any>

/**
 * Download media from a message or quoted message
 */
export function downloadMedia(
  client: any,
  target: any,
  options?: DownloadMediaOptions,
): Promise<Buffer | import('stream').Readable | string>

export { isCommand, validateCommand } from './command.js'

declare const _default: {
  parseMessage: typeof parseMessage
  serialize: typeof parseMessage
  getGroupMetadata: typeof getGroupMetadata
  clearGroupMetadataCache: typeof clearGroupMetadataCache
  send: typeof send
  reply: typeof reply
  react: typeof react
  downloadMedia: typeof downloadMedia
  extractMentionsFromText: typeof extractMentionsFromText
  isCommand: typeof import('./command.js').isCommand
  validateCommand: typeof import('./command.js').validateCommand
}

export default _default
