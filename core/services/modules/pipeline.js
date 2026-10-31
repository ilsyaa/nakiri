/**
 * Execute an array of handlers (modules) sequentially in an auto-flow event pipeline.
 *
 * Behavior:
 * - Auto-Flow: Handlers automatically advance to the next handler upon completion without requiring next().
 * - Explicit Stop: Handlers can halt the pipeline by calling `ctx.stop()` or `ctx.stopPropagation()`.
 * - Interceptor / Middleware: Handlers may still optionally call `await next()` for onion-style wrapping.
 *
 * @param {Array<{ name: string, level?: number, execute: Function }>} handlers
 * @param {any} payload - Native Zapo payload
 * @param {{ client: any, sessionId: string, eventName: string, [key: string]: any }} context
 * @returns {Promise<void>}
 */
export async function runPipeline(handlers, payload, context) {
  if (!handlers || handlers.length === 0) return;

  let stopped = false;

  const ctx = {
    ...context,
    stop() {
      stopped = true;
    },
    stopPropagation() {
      stopped = true;
    },
  };

  Object.defineProperty(ctx, 'isStopped', {
    get: () => stopped,
    enumerable: true,
    configurable: true,
  });

  let currentIndex = -1;

  async function dispatch(i) {
    if (stopped) return;
    if (i <= currentIndex) {
      throw new Error('next() called multiple times in pipeline handler');
    }
    currentIndex = i;

    if (i >= handlers.length) return;

    const handler = handlers[i];
    if (!handler || typeof handler.execute !== 'function') {
      return dispatch(i + 1);
    }

    let nextCalled = false;
    const nextFn = async () => {
      nextCalled = true;
      if (!stopped) {
        await dispatch(i + 1);
      }
    };

    await handler.execute(payload, ctx, nextFn);

    // Auto-flow: If next() was not called and the pipeline was not stopped,
    // automatically advance to the next handler.
    if (!nextCalled && !stopped && currentIndex === i) {
      await dispatch(i + 1);
    }
  }

  await dispatch(0);
}

export default {
  runPipeline,
};
