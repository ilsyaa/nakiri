/**
 * Extract plain text from Zapo message payload or Proto.IMessage object
 */
export function extractText(messagePayload: any): string

/**
 * Extract quoted message details from payload contextInfo
 */
export function getQuoted(messagePayload: any): {
  stanzaId: string
  participant: string
  quotedMessage: any
  text: string
} | null

/**
 * Extract mentioned JIDs from message payload
 */
export function extractMentions(messagePayload: any): string[]

/**
 * Extract media content descriptor from message payload if present
 */
export function extractMedia(messagePayload: any): {
  type: 'image' | 'video' | 'audio' | 'sticker' | 'document'
  media: any
  ptt?: boolean
} | null

declare const _default: {
  extractText: typeof extractText
  getQuoted: typeof getQuoted
  extractMentions: typeof extractMentions
  extractMedia: typeof extractMedia
}

export default _default
