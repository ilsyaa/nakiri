import type {
  KnownEventName,
  SingleEventModule,
  MultiEventModule,
  DefaultEventModule,
} from './types.js'

/**
 * Helper to define a Nakiri feature module with automatic type inference and IDE auto-completion.
 *
 * The `payload` and `context` types in `execute()` dynamically follow the specified `event` or `events`.
 * If neither is specified, it defaults to the `'message'` event.
 *
 * @example
 * ```javascript
 * import { defineModule } from '@nakiri/core/services/modules';
 *
 * export default defineModule({
 *   event: 'message',
 *   level: 10,
 *   description: 'Check bot latency',
 *   label: {
 *     commands: ['ping', 'p'],
 *     group: 'utility',
 *   },
 *   async execute(payload, { client, sessionId }) {
 *     // payload is automatically typed as WaIncomingMessageEvent!
 *   }
 * });
 * ```
 */
export function defineModule<E extends KnownEventName | (string & {})>(
  module: SingleEventModule<E>,
): SingleEventModule<E>

export function defineModule<E extends KnownEventName | (string & {})>(
  module: MultiEventModule<E>,
): MultiEventModule<E>

export function defineModule(module: DefaultEventModule): DefaultEventModule
