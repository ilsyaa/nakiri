export declare class Storage {
  static save(
    buffer: Buffer,
    options?: {
      filename?: string
      subDir?: string
    },
  ): Promise<string>
  static saveTmp(
    buffer: Buffer,
    options?: {
      filename?: string
      ttlMs?: number
    },
  ): Promise<string>
  static clearTmp(): Promise<void>
  static getBuffer(filepath: string): Promise<Buffer | null>
  static exists(filepath: string): Promise<boolean>
  static delete(filepath: string): Promise<boolean>
}
