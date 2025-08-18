const { Command } = require('../../../utils/command.js');

Command({
  name: 'group-link',
  description: 'Get link group.',
  alias: ['gclink'],
  tags : {
    label : 'group'
  },
  run: async ({ sock, m }) => {
    if (!m.isGroup) return;
    if (!m.isSenderAdmin) return;
    if (!m.isBotAdmin) return m.reply(__('botNotAdmin'));

    await m.reply(`https://chat.whatsapp.com/${await sock.groupInviteCode(m.chat)}`);
  }
});