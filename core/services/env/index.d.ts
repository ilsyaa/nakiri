import { z } from 'zod'
import { envSchema } from './schema.js'

export type Env = z.infer<typeof envSchema>

declare const env: Env

export default env
