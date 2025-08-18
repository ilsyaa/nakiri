const { Command } = require('../../../utils/command.js');

Command({
  name: 'other-join',
  description: 'Join group via link',
  alias: ['join'],
  tags : {
    label : 'other'
  },
  run: async ({ sock, m }) => {
    const link = m.content.textWithoutCommand.trim();
    if (!link) return m.reply(__('join.ex', { prefix: m.content.prefix }));
    const [_, code] = link.match(/https?:\/\/chat.whatsapp.com\/(.*)/) || [null, null];

    await sock.groupAcceptInvite(code).then(() => {
      m.reply(__('join.success'));
    }).catch((e) => {
      m.reply(__('join.failed', { message: e.message }));
    });
  }
});