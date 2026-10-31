import type { WaClient } from 'zapo-js'
import type {
  DeviceConnectionStatus,
  WhatsAppEvents,
  WhatsAppEventUnsubscriber,
} from './types.js'

export declare class WhatsAppEventBus {
  readonly on: WhatsAppEvents
  readonly once: WhatsAppEvents
  readonly off: WhatsAppEventUnsubscriber

  constructor()

  addListener(event: string, callback: (...args: any[]) => any): () => void
  addOnceListener(event: string, callback: (...args: any[]) => any): () => void
  removeListener(event: string, callback: (...args: any[]) => any): void
  emit(event: string, ...args: any[]): void
  emitQr(sessionId: string, qr: string): void
  emitStatus(sessionId: string, status: DeviceConnectionStatus): void
  emitMessage(event: any, sessionId: string, client: WaClient): void
  removeAllListeners(): void
}

export default WhatsAppEventBus
