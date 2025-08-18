const { Command } = require('../../utils/command.js');
const { prisma } = require('../../utils/prisma.js');
const crypto = require('crypto');

Command({
  name: 'dashboard',
  description: 'Login Dashboard',
  alias: ['login', 'logout'],
  run: async ({ m }) => {
    if (m.isGroup) return;

    const { text, prefix } = m.content;

    try {
      if (text === prefix + 'login') {
        const token = crypto.randomBytes(32).toString('hex');

        await prisma.User.update({
          where: { jid: m.senderJid },
          data: { token },
        });

        await m.reply(`${process.env.CLIENT_URL}/api/login/${token}`);
      } else if (text === prefix + 'logout') {
        await prisma.User.update({
          where: { jid: m.senderJid },
          data: { token: '' },
        });

        await m.reply('Logout Success.');
      }
    } catch (error) {
      console.error(error);
      await m.reply('Something went wrong.');
    }
  },
});
