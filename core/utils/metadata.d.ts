export interface ExifMetadata {
  packname?: string
  author?: string
  categories?: string[]
}
export declare function writeExif(
  buffer: Buffer,
  metadata: ExifMetadata,
): Promise<Buffer>
export interface MediaMetadata {
  duration?: number
  width?: number
  height?: number
  size?: number
  bitrate?: number
  format?: string
}
export declare function extractMetadata(
  buffer: Buffer,
  ext?: string,
): Promise<MediaMetadata>
