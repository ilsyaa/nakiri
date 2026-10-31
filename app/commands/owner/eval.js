import util from 'util';
import fs from 'fs';
import os from 'os';
import { defineCommand } from '#app/services/bot/index.js';
import db from '@nakiri/core/services/database';
import cache from '@nakiri/core/services/cache';

export default defineCommand({
  name: '>',
  aliases: ['>', '>>'],
  category: 'owner',
  description: 'Evaluate JavaScript code directly from WhatsApp (owner only)',
  prefix: false,
  middlewares: ['sender:isOwner'],

  async execute(payload, ctx) {
    const msg = ctx.msg;
    if (!msg) return;

    const code = msg.body?.argsText?.trim();
    if (!code) return;

    try {
      const scope = {
        client: ctx.client,
        msg,
        payload,
        ctx,
        db,
        cache,
        os,
        fs,
        util,
      };

      const paramNames = Object.keys(scope);
      const paramValues = Object.values(scope);

      let result;
      try {
        // Attempt 1: Expression evaluation (auto-return)
        const wrappedCode = code.includes('return')
          ? `return (async () => { ${code} })()`
          : `return (async () => { return (${code}); })()`;

        const fn = new Function(...paramNames, wrappedCode);
        result = await fn(...paramValues);
      } catch (exprErr) {
        // Attempt 2: Statement block evaluation
        const fn = new Function(
          ...paramNames,
          `return (async () => { ${code} })()`
        );
        result = await fn(...paramValues);
      }

      let formatted;
      if (typeof result === 'string') {
        formatted = result;
      } else {
        formatted = util.inspect(result, { depth: 2, showHidden: false });
      }

      if (formatted.length > 4000) {
        await msg.reply(
          formatted.slice(0, 4000) + '\n\n... (output truncated)'
        );
      } else {
        await msg.reply(formatted);
      }
    } catch (err) {
      const errorMsg = String(err?.stack || err?.message || err);
      await msg.reply(errorMsg.slice(0, 4000));
    }
  },
});
