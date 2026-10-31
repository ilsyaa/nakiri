export declare class HttpResponse {
  private rawResponse
  constructor(rawResponse: Response)
  ok(): boolean
  status(): number
  headers(): Headers
  json<T = any>(): Promise<T>
  text(): Promise<string>
  arrayBuffer(): Promise<ArrayBuffer>
  get raw(): Response
}
export declare class PendingRequest {
  private requestHeaders
  private timeoutMs
  withHeaders(headers: Record<string, string>): this
  withToken(token: string, type?: string): this
  accept(contentType: string): this
  acceptJson(): this
  timeout(ms: number): this
  private send
  get(url: string, query?: Record<string, any>): Promise<HttpResponse>
  post(url: string, data?: any): Promise<HttpResponse>
  put(url: string, data?: any): Promise<HttpResponse>
  delete(url: string, data?: any): Promise<HttpResponse>
}
export declare class Http {
  static withHeaders(headers: Record<string, string>): PendingRequest
  static withToken(token: string, type?: string): PendingRequest
  static accept(contentType: string): PendingRequest
  static acceptJson(): PendingRequest
  static timeout(ms: number): PendingRequest
  static get(url: string, query?: Record<string, any>): Promise<HttpResponse>
  static post(url: string, data?: any): Promise<HttpResponse>
  static put(url: string, data?: any): Promise<HttpResponse>
  static delete(url: string, data?: any): Promise<HttpResponse>
  static getFromUrl(url: string): Promise<{
    buffer: Buffer<ArrayBuffer>
    mime: string
    ext: string
    size: number
    filename: string
  } | null>
}
