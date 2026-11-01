import { defineCommand } from '#app/services/bot/index.js';

export default defineCommand({
  name: 'test',
  aliases: ['test'],
  description: 'test',

  async execute(payload, ctx) {
    console.log(ctx);
  },
});
