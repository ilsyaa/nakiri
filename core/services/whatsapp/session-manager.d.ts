import type { WaClient } from 'zapo-js'
import type { DeviceConnectionStatus } from './types'
import type { WhatsAppEventBus } from './events'
import type { SessionLogger } from './logger'
import type { createWhatsAppStore } from './store'

export declare class SessionManager {
  constructor(
    store: ReturnType<typeof createWhatsAppStore>,
    events: WhatsAppEventBus,
    logger: SessionLogger,
  )

  hasSession(sessionId: string): boolean
  getActiveSessions(): string[]
  getClient(sessionId: string): WaClient | null
  getStatus(sessionId: string): DeviceConnectionStatus
  isReady(sessionId: string): boolean
  getQr(sessionId: string): string | null
  getQrDataUrl(sessionId: string): string | null
  setQrDataUrl(sessionId: string, dataUrl: string): void
  getPairingCode(sessionId: string): string | null
  connect(sessionId: string, pairingNumber?: string): Promise<void>
  disconnect(sessionId: string): Promise<void>
  logout(sessionId: string): Promise<void>
  destroy(): Promise<void>
}

export default SessionManager
