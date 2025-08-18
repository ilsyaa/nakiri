const { Command } = require('../../../utils/command.js');

Command({
  name: 'personal-info',
  description: 'My Profile Info',
  alias: ['profile', 'my'],
  tags : {
    label : 'personal'
  },
  run: async ({ sock, m }) => {
    let text = '*`❖ Personal Info`*\n';
    text += `▷ Name : ${m.pushName}\n`;
    text += `▷ Number : ${m.sender.split('@')[0]}\n`;
    text += `▷ Exp : ${m.db.user.exp}\n`;
    text += `▷ Subscribe : ${m.db.user.subscription.type.toUpperCase()}`;

    if (m.isGroup) {
      text += '\n\n';
      text += '*`❖ Group Status`*\n';
      text += `▷ Social Credit : ${m.db.groupParticipant.score}\n`;
      text += `▷ Strike : ${m.db.groupParticipant.strike}/${m.db.group.maxStrike}\n`;
      text += `▷ Role : ${m.groupMetadata.participants.find(v => v.jid === m.sender).admin}\n`;
    }

    let image = null;
    image = await sock.profilePictureUrl(m.sender, 'image').catch(() => null);

    await m.sendMessage(m.chat, {
      text,
      contextInfo: {
        externalAdReply: {
          title: 'Personal Profile',
          body: `- ${m.pushName} -`,
          mediaType: 2,
          thumbnailUrl: image,
          sourceUrl: 'https://nakiri.koding.in',
        }
      }
    });
  }
});