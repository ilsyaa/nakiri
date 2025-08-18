const path = require('path');
const { Command } = require('../../../utils/command.js');
const { prisma } = require('../../../utils/prisma.js');
const fs = require('fs');

Command({
  name: 'personal-setlang',
  description: 'Set personal language',
  alias: ['setlang', 'lang'],
  tags : {
    label : 'personal'
  },
  run: async ({ m }) => {
    if (m.isGroup) return;
    const lang = m.content.textWithoutCommand.trim().toLowerCase();
    const langs = fs.readdirSync(path.join(__basedir, 'app', 'lang')).map(v => v.split('.')[0]);
    
    if (!lang) return m.reply(__('personal.setlang.ex', { command: m.content.command, langs: langs.join(', ') }));
    if (!langs.includes(lang)) return m.reply(__('personal.setlang.ex', { command: m.content.command, langs: langs.join(', ') }));

    await prisma.User.update({ where: { id: m.db.user.id }, data: { lang }});
    m.reply(__('personal.setlang.success', { lang }));
  }
});