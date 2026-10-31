import type { WaClient, WaClientEventMap } from 'zapo-js'
import type { DeviceConnectionStatus } from '../whatsapp/types.js'

/**
 * All native event keys emitted by Zapo client
 */
export type ZapoEventName = string & keyof WaClientEventMap

/**
 * Custom application-level events emitted by Nakiri WhatsApp service
 */
export interface AppCustomEventPayloadMap {
  qr: string
  status: DeviceConnectionStatus
}

/**
 * Mapping of all known event names to their native payload types
 */
export type AllEventPayloadMap = {
  [K in ZapoEventName]: Parameters<WaClientEventMap[K]>[0]
} & AppCustomEventPayloadMap

/**
 * Union of all known event names supported by Nakiri
 */
export type KnownEventName = string & keyof AllEventPayloadMap

/**
 * Helper to dynamically resolve the payload type based on event name(s).
 * If the event name is unknown or wildcard ('*'), it resolves to `any`.
 */
export type EventPayload<E> = E extends KnownEventName
  ? AllEventPayloadMap[E]
  : any

/**
 * Execution context passed to module `execute` function
 */
export interface ModuleContext<E = string> {
  /** The native Zapo client instance */
  client: WaClient
  /** Active WhatsApp session ID */
  sessionId: string
  /** Name of the event being dispatched */
  eventName: E

  /** Halt the event pipeline immediately, preventing downstream handlers from executing */
  stop: () => void
  /** Alias for stop() */
  stopPropagation: () => void
  /** Whether the pipeline has been explicitly stopped */
  readonly isStopped: boolean

  /** Allows downstream plugins and middlewares to attach custom properties */
  [key: string]: any
}

/**
 * Next function for pipeline chaining / interceptors
 */
export type ModuleNextFn = () => Promise<void>

/**
 * Common module groups with IDE autocomplete suggestions
 */
export type KnownModuleGroup =
  | 'group'
  | 'utility'
  | 'admin'
  | 'owner'
  | 'bot'
  | 'general'
  | 'tools'
  | 'games'
  | (string & {})

/**
 * Metadata for command triggers and group allocation
 */
export interface ModuleLabelDefinition {
  /** List of command triggers or aliases */
  commands: string[] | readonly string[]
  /** Group/section for module allocation in lowercase (e.g. 'group', 'utility', 'admin', 'owner') */
  group: KnownModuleGroup
  /** Whether the commands are executed without a bot prefix */
  withoutPrefix?: boolean
}

/**
 * Base metadata shared by all module definitions
 */
export interface BaseModuleDefinition {
  /** Unique module identifier (defaults to `${category}-${filename}`) */
  name?: string
  /** Feature category (defaults to parent folder name) */
  category?: string
  /**
   * Execution priority level:
   * - `1..9`: Interceptors / filters (gatekeeper, rate limiter, blacklist)
   * - `10`: Standard feature module (commands, games, tools)
   * @default 10
   */
  level?: number
  /** Human-readable description of what this module does */
  description?: string
  /** Command triggers and group allocation */
  label?: ModuleLabelDefinition
}

/**
 * Module definition listening to a single event
 */
export interface SingleEventModule<
  E extends string,
> extends BaseModuleDefinition {
  /** Single event name to listen to (e.g. 'message', 'call', 'group') */
  event: E
  events?: never
  /**
   * Module handler execution
   */
  execute: (
    payload: EventPayload<E>,
    context: ModuleContext<E>,
    next?: ModuleNextFn,
  ) => Promise<any> | any
}

/**
 * Module definition listening to multiple events
 */
export interface MultiEventModule<
  E extends string,
> extends BaseModuleDefinition {
  event?: never
  /** List of event names to listen to (e.g. ['message', 'call']) */
  events: readonly E[] | E[]
  /**
   * Module handler execution
   */
  execute: (
    payload: EventPayload<E>,
    context: ModuleContext<E>,
    next?: ModuleNextFn,
  ) => Promise<any> | any
}

/**
 * Module definition with default event ('message')
 */
export interface DefaultEventModule extends BaseModuleDefinition {
  event?: never
  events?: never
  /**
   * Module handler execution (defaults to 'message' event)
   */
  execute: (
    payload: EventPayload<'message'>,
    context: ModuleContext<'message'>,
    next?: ModuleNextFn,
  ) => Promise<any> | any
}

/**
 * Generic module definition union
 */
export type ModuleDefinition<E extends string = 'message'> =
  SingleEventModule<E> | MultiEventModule<E> | DefaultEventModule

/**
 * Lazy import definition for event middlewares
 */
export type LazyMiddleware<T = any> = () => Promise<{ default: T }>

/**
 * Type-safe middleware handler for native WhatsApp events.
 * Scoped strictly to the specific event name K.
 */
export type EventMiddleware<
  K extends keyof WaClientEventMap = keyof WaClientEventMap,
> = (
  payload: Parameters<WaClientEventMap[K]>[0],
  ctx: ModuleContext<K>,
  next?: () => Promise<void>,
) => Promise<boolean | void> | boolean | void

/**
 * Scoped event middlewares map in kernel.js
 */
export type EventMiddlewaresConfig = {
  [K in keyof WaClientEventMap]?: LazyMiddleware<EventMiddleware<K>>[]
}
