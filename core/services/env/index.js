import 'dotenv/config';
import { envSchema } from '@nakiri/core/services/env/schema';
import logger from '@nakiri/core/utils/logger';
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
  logger.error('[ENV]', 'Invalid environment variables.');
  const errorReports = _env.error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
  console.table(errorReports);
  process.exit(1);
}
export default _env.data;
