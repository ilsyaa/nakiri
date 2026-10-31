import { defineModule } from '@nakiri/core/services/modules';
import {
  runEventMiddlewares,
  dispatchCommand,
} from '#app/services/bot/index.js';

export default defineModule({
  name: 'message-commands',
  event: 'message',
  level: 10,
  category: 'message',
  description: 'Native WhatsApp message event gateway and command dispatcher',

  async execute(payload, ctx) {
    // 1. Run scoped message event middlewares (ignore filter, parse ctx.msg, group score & access)
    const passed = await runEventMiddlewares('message', payload, ctx);
    if (!passed || ctx.isStopped || !ctx.msg) return;

    // 2. Dispatch message to matching bot command in registry
    await dispatchCommand(payload, ctx);
  },
});
