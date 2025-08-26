const { Command } = require('../../../utils/command.js');

Command({
  name: 'group-access-features',
  description: 'How can use bot in group.',
  alias: ['access'],
  tags : {
    label : 'group'
  },
  run: async ({ sock, m }) => {
    if (!m.isGroup) return;
    if (!m.isSenderAdmin) return;

    const body = m.content.textWithoutCommand.trim();
    const accessAvailable = ['everyone', 'adminonly'];
    if (!body) return m.reply(__('cmd.group.accessFeatures.ex', { command: m.content.command }));
    if (!accessAvailable.includes(body)) return m.reply(__('cmd.group.accessFeatures.ex', { command: m.content.command }));
    
    await prisma.group.update({ where: { id: m.db.group.id }, data: { accessFeatures: body }});
    m.reply(__('cmd.group.accessFeatures.success', { accessFeatures: body }));
  }
});