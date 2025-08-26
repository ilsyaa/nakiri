const { Command } = require('../../../utils/command.js');
const currencyInstance = require('../../../utils/currency.js');

Command({
  name: 'bank-mine',
  description: 'Mining Coin.',
  alias: ['mining', 'mine'],
  run: async ({ m }) => {
    try {
      await currencyInstance.mine({ jid: m.sender, remainingMines: 5, m });
      currencyInstance.messageHistoryMap.set(m.sender, {
        key: m.key,
        message: m.message,
        content: m.content,
      });
      await m.react('🔍');
    } catch (e) {
      return m.reply(e.message);
    }
  }
});
