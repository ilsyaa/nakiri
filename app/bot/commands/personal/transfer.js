const { Command } = require('../../../utils/command.js');
const currencyInstance = require('../../../utils/currency.js');

Command({
  name: 'bank-transfer',
  description: 'Transfer Coin.',
  alias: ['transfer', 'tf'],
  tags : {
    label : 'personal'
  },
  run: async ({ m }) => {
    let toJid = null;

    const [ amount, to ] = m.content.textWithoutCommand.split(' ');

    if (m.content.mentionedJid.length) toJid = m.content.mentionedJid[0];
    if (m.quoted) toJid = m.quoted.sender;
    if (to) toJid = to;

    if (!toJid) return m.reply(__('cmd.personal.transfer.ex', { command: m.content.command }));

    if (!toJid.includes('@')) toJid = toJid + '@s.whatsapp.net';

    if (amount <= 1) return m.reply(__('cmd.personal.transfer.amountMinTransfer'));

    try {
      const transaction = await currencyInstance.transfer({ fromJid: m.sender, toJid, amount: Number(amount) });
      currencyInstance.messageHistoryMap.set(transaction.id, {
        key: m.key,
        message: m.message,
        content: m.content,
      });
      if (currencyInstance.minerMap.size == 0) return m.reply(__('cmd.personal.transfer.pending'));
    } catch (e) {
      console.log(e.message);
      return m.reply(e.message);
    }
  }
});
