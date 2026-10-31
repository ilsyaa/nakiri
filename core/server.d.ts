import { SessionManager, WhatsAppEventBus } from './services/whatsapp'

export function bootScreen(): void

export function startServer(): Promise<{
  sessionManager: SessionManager
  store: any
  events: WhatsAppEventBus
}>

export default startServer
