import type {
  ModuleContext,
  ModuleNextFn,
  ModuleLabelDefinition,
} from './types.js'

export interface ModuleHandler {
  name: string
  category?: string
  event?: string | string[]
  events?: string[]
  level?: number
  description?: string
  filePath?: string
  label?: ModuleLabelDefinition
  execute: (
    payload: any,
    context: ModuleContext,
    next?: ModuleNextFn,
  ) => Promise<any> | any
}

export function runPipeline(
  handlers: ModuleHandler[],
  payload: any,
  context: {
    client: any
    sessionId: string
    eventName: string
    [key: string]: any
  },
): Promise<void>

declare const _default: {
  runPipeline: typeof runPipeline
}

export default _default
