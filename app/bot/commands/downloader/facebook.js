const { Command } = require('../../../utils/command.js');
const snapsave = require('../../../utils/scrape/snapsave.js');

Command({
  name: 'downloader-facebook',
  description: 'Download media from facebook.',
  alias: ['fbdl', 'facebook', 'fesnuk'],
  tags : {
    label : 'downloader'
  },
  run: async ({ m }) => {
    const body = m.content.textWithoutCommand.trim();
    if (!body) return m.reply(__('cmd.downloader.fb.ex', { command: m.content.command }));
    // if (!(/^(https?:\/\/)?(www\.|m\.|web\.|l\.)?(facebook\.com|fb\.me|fb\.watch)(\/[\w\-\.]*)*(\/photo\.php\?.*)?(\/posts\/\d+)?(\/videos\/\d+)?(\?[\w=&%-]*)?(#.*)?$/i).test(body)) return m.reply(__('cmd.downloader.fb.ex', { command: m.content.command }));

    const res = await snapsave(body);

    m.react('⌛');
    if (res.ok) {
      await m.reply({
        video: { url: res.data.resolutions[0].url }, 
        caption: `*${res.data.title}* - ${res.data.resolutions[0].resolution}`
      }).then(() => m.react('✅'))
        .catch(() => m.react('❌'));
    } else {
      m.react('❌');
    }
  }
});