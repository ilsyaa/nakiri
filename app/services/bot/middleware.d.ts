import type { CommandMiddlewareHandler } from './types.js'

export declare function getKernel(): Promise<any>
export declare function resetKernelCache(): void
export declare function getCommandMiddleware(
  alias: string,
): Promise<CommandMiddlewareHandler | null>
export declare function runEventMiddlewares(
  eventName: string,
  payload: any,
  ctx: any,
): Promise<boolean>

declare const _default: {
  getKernel: typeof getKernel
  resetKernelCache: typeof resetKernelCache
  getCommandMiddleware: typeof getCommandMiddleware
  runEventMiddlewares: typeof runEventMiddlewares
}

export default _default
