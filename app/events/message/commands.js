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
    const passed = await runEventMiddlewares('message', payload, ctx);
    if (!passed || ctx.isStopped || !ctx.msg) return;
    await dispatchCommand(payload, ctx);
  },
});
