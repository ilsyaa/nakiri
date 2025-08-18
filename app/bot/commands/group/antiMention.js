const { Command } = require('../../../utils/command.js');

Command({
  name: 'group-antimention',
  description: 'Enable and disable anti mention',
  alias: ['antimention'],
  tags : {
    label : 'group'
  },
  run: async ({ m }) => {
    if (!m.isGroup) return;
    if (!m.isSenderAdmin) return;
    if (!m.isBotAdmin) return m.reply(__('botNotAdmin'));

    const body = m.content.textWithoutCommand.trim();
    switch (body.toLowerCase()) {
    case 'enable':
    case 'on':
      if (m.db.group.antiMention.enable) return m.reply(__('group.antimention.alreadyOn'));
      await prisma.group.update({
        where: { id: m.db.group.id }, 
        data: {
          antiMention: {
            ...m.db.group.antiMention,
            enable: true,
          }
        }
      });
      m.reply(__('group.antimention.on'));
      break;

    case 'disable':
    case 'off':
      if (!m.db.group.antiMention.enable) return m.reply(__('group.antimention.alreadyOff'));
      await prisma.group.update({ 
        where: { id: m.db.group.id }, 
        data: {
          antiMention: {
            ...m.db.group.antiMention,
            enable: false,
          }
        }
      });
      m.reply(__('group.antimention.off'));
      break;
            
    default:
      m.reply(__('group.antimention.ex', { command: m.content.command }));
    }
  }
});