import type { WaStore } from 'zapo-js'
import type { RegisteredSession } from './types'

export type WhatsAppStore = WaStore & {
  getRegisteredSessions(): Promise<RegisteredSession[]>
}

export declare function createWhatsAppStore(): WhatsAppStore

export default createWhatsAppStore
