const { Command } = require('../../../utils/command.js');
const snapsave = require('../../../utils/scrape/snapsave.js');

Command({
  name: 'downloader-instagram',
  description: 'Download media from instagram.',
  alias: ['igdl', 'instagram', 'insta'],
  tags : {
    label : 'downloader'
  },
  run: async ({ m }) => {
    const body = m.content.textWithoutCommand.trim();
    if (!body) return m.reply(__('downloader.ig.ex', { command: m.content.command }));

    const res = await snapsave(body);

    m.react('⌛');
    if (res.ok) {
      await m.reply({
        video: { url: res.data.resolutions[0].url }
      }).then(() => m.react('✅'))
        .catch(() => m.react('❌'));
    } else {
      m.react('❌');
    }
  }
});