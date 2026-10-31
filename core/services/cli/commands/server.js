import { defineCommand } from '../registry.js';

export const startServerCommand = defineCommand({
  name: 'start',
  aliases: ['serve', 'bot'],
  category: 'server',
  description: 'Start Nakiri WhatsApp bot runtime server',
  usage: 'start',
  async execute() {
    const { startServer } = await import('@nakiri/core/server');
    await startServer();
  },
});

export default startServerCommand;
