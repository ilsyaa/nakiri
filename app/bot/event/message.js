const { default: consola } = require('consola');
const serialize = require('../../utils/serialize.js');
const { getAliases } = require('../../utils/command.js');
const middleware = require('../../bot/middleware/app.js');
const { prisma } = require('../../utils/prisma.js');
const { USER_DEFAULT, PARTICIPANT_DEFAULT } = require('../../utils/schemaData.js');
const { isJidUser } = require('baileys');

module.exports = async function ({
  sock
}) {
  sock.ev.on('messages.upsert', async (event) => {
    if (event.type !== 'notify') return;
    
    for (const message of event.messages) {
      if (!message?.message) {
        consola.info(message.messageStubParameters);
        continue;
      }

      const m = await serialize({
        sock,
        WAMessage: message,
      });

      if (m.isGroup && isJidUser(m.sender)) {
        m.db.groupParticipant = await prisma.groupParticipant.upsert({
          where: {
            groupId_jid: {
              jid: m.sender,
              groupId: m.groupMetadata.id
            }
          },
          update: {},
          create: {
            ...PARTICIPANT_DEFAULT,
            jid: m.sender,
            groupId: m.groupMetadata.id,
            isAdmin: m.isSenderAdmin
          },
        });
      }
      
      if (isJidUser(m.sender)) {
        m.db.user = await prisma.User.findUnique({ where: { jid: m.sender } });
      }
      
      m.lang = m.isGroup ? (m.db?.group?.lang || process.env.APP_LOCALE) : (m.db?.user?.lang || process.env.APP_LOCALE);
      setI18n(m.lang);
            
      const commands = getAliases(m.content.commandWithoutPrefix.toLowerCase());
      const $next = await _middleware(sock, m, middleware, commands);
      if (m.isGroup && m.db.group?.accessFeatures != 'everyone' && !m.isSenderAdmin) return;
      if(typeof $next == 'object' && !$next?.continueCommand) return;
      if (commands.length > 0 && isJidUser(m.sender) && !m.db?.user) {
        m.db.user = await prisma.User.create({
          data: {
            ...USER_DEFAULT,
            jid: m.sender,
            pushName: m.pushName,
            lang: m.sender.startsWith('62') ? 'id' : 'en'
          }
        });
      }
      for (const command of commands) {
        // if (m.isGroup && !m.db.group.publicFeatures.includes(command.name)) continue;
        if(!command?.options?.withoutPrefix && !m.content.prefix) continue;
        try {
          await command.run({ sock, m, options: command.options });
        } catch (error) {
          consola.error(error);
        }
      }
    }
  });
};

const _middleware = async (sock, m, middlewares, commands) => {
  let $next = true;
  // eslint-disable-next-line no-unused-vars
  for (let [key, middleware] of middlewares.entries()) {
    try {
      $next = await middleware.handler(sock, m, true, commands);
    } catch (error) {
      if(!error?.hideLogs) console.log(error);
      $next = error;
      if(error?.break) break;
    }
  }
  return $next;
};