import { z } from 'zod';

export const envSchema = z.object({
  KEY: z.string(),
  SESSION_ID: z.string().default('main'),
  CACHE_DRIVER: z.enum(['redis', 'lru']).default('lru'),
  REDIS_URL: z.string().optional(),

  DB_CONNECTION: z.enum(['sqlite', 'mysql']),
  DB_HOST: z.string().optional(),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_DATABASE: z.string().optional(),

  STORE_ENABLED: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        if (val.toLowerCase() === 'true') return true;
        if (val.toLowerCase() === 'false') return false;
      }
      return val;
    }, z.boolean())
    .default(true),
  STORE_CHATS: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        if (val.toLowerCase() === 'true') return true;
        if (val.toLowerCase() === 'false') return false;
      }
      return val;
    }, z.boolean())
    .default(true),
  STORE_CONTACTS: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        if (val.toLowerCase() === 'true') return true;
        if (val.toLowerCase() === 'false') return false;
      }
      return val;
    }, z.boolean())
    .default(true),
  STORE_GROUPS: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        if (val.toLowerCase() === 'true') return true;
        if (val.toLowerCase() === 'false') return false;
      }
      return val;
    }, z.boolean())
    .default(true),
  STORE_MESSAGES: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        if (val.toLowerCase() === 'true') return true;
        if (val.toLowerCase() === 'false') return false;
      }
      return val;
    }, z.boolean())
    .default(false),
  STORE_MESSAGE_RETENTION_DAYS: z.coerce.number().default(7),
  STORE_BATCH_INTERVAL_MS: z.coerce.number().default(5000),
});
