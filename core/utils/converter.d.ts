export interface WebpConvertOptions {
  memeText?: string
  crop?: boolean
}

export declare function imageToWebp(
  buffer: Buffer,
  memeText?: string | WebpConvertOptions,
  options?: boolean | WebpConvertOptions,
): Promise<Buffer>
export declare function videoToWebp(
  buffer: Buffer,
  memeText?: string | WebpConvertOptions,
  options?: boolean | WebpConvertOptions,
): Promise<Buffer>
export declare function stickerToImage(buffer: Buffer): Promise<Buffer>
export declare function stickerToVideo(buffer: Buffer): Promise<Buffer>
export declare function toAudio(buffer: Buffer, ext?: string): Promise<Buffer>
export declare function toPTT(buffer: Buffer): Promise<Buffer>
export declare function toVideo(buffer: Buffer, ext?: string): Promise<Buffer>
export declare function compressVideo(buffer: Buffer): Promise<Buffer>
export declare function toNumber(value: any, fallback?: number): number
export declare function toBoolean(value: any): boolean
export declare function parseDurationToMs(timeStr: string): number
export declare function formatMsToDuration(ms: number): string
export declare function toBase64(data: string | Buffer): string
export declare function fromBase64(base64: string): string
