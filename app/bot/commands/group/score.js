const { Command } = require('../../../utils/command.js');
const { prisma } = require('../../../utils/prisma.js');

Command({
  name: 'group-score',
  description: 'Enable and disable group score',
  alias: ['socialcredit', 'score'],
  tags : {
    label : 'group'
  },
  run: async ({ m }) => {
    if (!m.isGroup) return;
    if (!m.isSenderAdmin) return;
    if (!m.content.textWithoutCommand.trim()) return m.reply(__('group.score.ex', { command: m.content.command }));

    switch (m.content.textWithoutCommand.trim().toLowerCase()) {
    case 'enable':
    case 'on':
    case 'activate':
    case 'true':
      if (m.db.group.activityScore) return m.reply(__('group.score.alreadyOn'));
      m.db.group.activityScore = true;
      await prisma.group.update({ where: { id: m.db.group.id }, data: { activityScore: true } });
      m.reply(__('group.score.on'));
      break;

    case 'disable':
    case 'off':
    case 'deactivate':
    case 'false':
      if (!m.db.group.activityScore) return m.reply(__('group.score.alreadyOff'));
      m.db.group.activityScore = false;
      await prisma.group.update({ where: { id: m.db.group.id }, data: { activityScore: false } });
      m.reply(__('group.score.off'));
      break;

    case 'reset':
      await prisma.groupParticipant.updateMany({ where: { groupId: m.db.groupParticipant.id }, data: { score: 0 } });
      m.reply(__('group.score.reset'));
      break;
      
    default:
      m.reply(__('group.score.ex', { command: m.content.command }));
    }

  }
});