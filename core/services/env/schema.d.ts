import { z } from 'zod'

export declare const envSchema: z.ZodObject<
  {
    KEY: z.ZodString
    SESSION_ID: z.ZodDefault<z.ZodString>
    CACHE_DRIVER: z.ZodDefault<
      z.ZodEnum<{
        redis: 'redis'
        lru: 'lru'
      }>
    >
    REDIS_URL: z.ZodOptional<z.ZodString>
    DB_CONNECTION: z.ZodEnum<{
      sqlite: 'sqlite'
      mysql: 'mysql'
    }>
    DB_HOST: z.ZodOptional<z.ZodString>
    DB_PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>
    DB_USER: z.ZodOptional<z.ZodString>
    DB_PASSWORD: z.ZodOptional<z.ZodString>
    DB_DATABASE: z.ZodOptional<z.ZodString>
    STORE_ENABLED: z.ZodDefault<
      z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>
    >
    STORE_CHATS: z.ZodDefault<
      z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>
    >
    STORE_CONTACTS: z.ZodDefault<
      z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>
    >
    STORE_GROUPS: z.ZodDefault<
      z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>
    >
    STORE_MESSAGES: z.ZodDefault<
      z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>
    >
    STORE_MESSAGE_RETENTION_DAYS: z.ZodDefault<z.ZodCoercedNumber<unknown>>
    STORE_BATCH_INTERVAL_MS: z.ZodDefault<z.ZodCoercedNumber<unknown>>
  },
  z.core.$strip
>

export type Env = z.infer<typeof envSchema>
