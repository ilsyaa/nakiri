import { exec } from 'child_process';
import { promisify } from 'util';
import { defineCommand } from '#app/services/bot/index.js';

const execAsync = promisify(exec);

export default defineCommand({
  name: '$',
  aliases: ['$'],
  category: 'owner',
  description: 'Execute shell commands directly from WhatsApp (owner only)',
  prefix: false,
  middlewares: ['sender:isOwner'],

  async execute(payload, ctx) {
    const msg = ctx.msg;
    if (!msg) return;

    const command = msg.body?.argsText?.trim();
    if (!command) return;

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 60000,
        maxBuffer: 1024 * 1024 * 10,
      });

      const output = (
        stdout ||
        stderr ||
        'Command executed with no output.'
      ).trim();

      if (output.length > 4000) {
        await msg.reply(output.slice(0, 4000) + '\n\n... (output truncated)');
      } else {
        await msg.reply(output);
      }
    } catch (err) {
      const errorText = (
        err.stderr ||
        err.stdout ||
        err.message ||
        String(err)
      ).trim();
      await msg.reply(errorText.slice(0, 4000));
    }
  },
});
