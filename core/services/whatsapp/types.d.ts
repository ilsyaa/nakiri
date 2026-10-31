import type { WaClient, WaClientEventMap } from 'zapo-js'

export type DeviceConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'qr_ready'
  | 'pairing_code_ready'
  | 'connected'

export interface SessionLog {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
}

export interface SendTextPayload {
  text: string
  mentions?: string[]
  replyToMessageId?: string
}

export interface SendMediaPayload {
  type: 'image' | 'video' | 'audio' | 'document' | 'sticker'
  media: string | Buffer | Uint8Array
  mimetype?: string
  caption?: string
  fileName?: string
}

export type MessagePayload = SendTextPayload | SendMediaPayload

export type ZapoEventPayload<K extends keyof WaClientEventMap> = Parameters<
  WaClientEventMap[K]
>[0]

export type ZapoEventListener<K extends keyof WaClientEventMap> = (
  event: ZapoEventPayload<K>,
  sessionId: string,
  client: WaClient,
) => void | Promise<void>

export type DynamicZapoEvents = {
  readonly [K in keyof WaClientEventMap]: (
    callback: ZapoEventListener<K>,
  ) => () => void
}

export interface AppCustomEvents {
  readonly qr: (callback: (sessionId: string, qr: string) => void) => () => void
  readonly status: (
    callback: (sessionId: string, status: DeviceConnectionStatus) => void,
  ) => () => void
}

export type WhatsAppEvents = AppCustomEvents &
  DynamicZapoEvents & {
    <K extends keyof WaClientEventMap>(
      event: K,
      callback: ZapoEventListener<K>,
    ): () => void
    (event: 'qr', callback: (sessionId: string, qr: string) => void): () => void
    (
      event: 'status',
      callback: (sessionId: string, status: DeviceConnectionStatus) => void,
    ): () => void
    (
      event: string,
      callback: (payload: any, sessionId: string, client: WaClient) => void,
    ): () => void
  }

export type WhatsAppEventUnsubscriber = {
  readonly [K in keyof WaClientEventMap]: (
    callback: ZapoEventListener<K>,
  ) => void
} & {
  readonly qr: (callback: (sessionId: string, qr: string) => void) => void
  readonly status: (
    callback: (sessionId: string, status: DeviceConnectionStatus) => void,
  ) => void
  <K extends keyof WaClientEventMap>(
    event: K,
    callback: ZapoEventListener<K>,
  ): void
  (event: 'qr', callback: (sessionId: string, qr: string) => void): void
  (
    event: 'status',
    callback: (sessionId: string, status: DeviceConnectionStatus) => void,
  ): void
  (
    event: string,
    callback: (payload: any, sessionId: string, client: WaClient) => void,
  ): void
}

export interface RegisteredSession {
  sessionId: string
  meJid: string
}
