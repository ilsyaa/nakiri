import type { WhatsAppEventBus } from '../whatsapp/events.js'
import type { ModuleHandler } from './pipeline.js'

export class ModuleLoader {
  modules: Map<string, ModuleHandler>
  eventListeners: Map<string, ModuleHandler[]>

  load(): Promise<void>
  loadFile(filePath: string): Promise<void>
  scanFiles(dir: string): string[]
  scanBootFiles(dir: string): string[]
  boot(context?: Record<string, any>): Promise<void>
  dispatch(
    eventName: string,
    payload: any,
    context: { client: any; sessionId: string; [key: string]: any },
  ): Promise<void>
  bind(events: WhatsAppEventBus): void
}

export const moduleLoader: ModuleLoader
export default moduleLoader
