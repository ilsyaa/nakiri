import { defineModule } from '@nakiri/core/services/modules';
import cache from '@nakiri/core/services/cache';
import logger from '@nakiri/core/utils/logger';
import {
  dispatchCommand,
  getCommand,
  getGroupMetadata,
  reply,
  react,
  safeUserJid,
  getBotSettings,
  checkIsOwner,
} from '#app/services/bot/index.js';
import {
  getShortcutCommand,
  findParticipant,
  getGroupSettings,
} from '#app/services/shortcut.js';

export default defineModule({
  name: 'reaction-shortcut',
  events: ['message_addon', 'message'],
  level: 10,
  category: 'reaction',
  description: 'Trigger bot commands via emoji reaction shortcuts',

  async execute(payload, ctx) {
    // 1. Identify reaction payload (either from message_addon or plaintext reactionMessage)
    let reaction = null;
    if (payload?.kind === 'reaction' && payload?.decrypted?.reaction) {
      reaction = payload.decrypted.reaction;
    } else if (payload?.message?.reactionMessage) {
      reaction = payload.message.reactionMessage;
    }

    if (!reaction) return;

    // 2. Validate group context and reject bot's own reactions
    const key = payload?.key || {};
    const chatJid = key.remoteJid;
    if (!chatJid || !chatJid.endsWith('@g.us')) return;
    if (key.fromMe) return;

    // 3. Extract emoji glyph and target message ID
    const emoji = reaction.text?.trim();
    if (!emoji) return; // Ignore reaction removals (empty string)

    const targetKey = reaction.key || {};
    const targetId = targetKey.id || payload.targetMessageId;
    if (!targetId) return;

    const reactorJid = key.participant;
    if (!reactorJid) return;

    // 4. In-memory deduplication (15s TTL) to prevent duplicate executions from dual events
    const dedupeKey = `react_sc:${chatJid}:${targetId}:${reactorJid}:${emoji}`;
    if (cache.has(dedupeKey)) return;
    cache.set(dedupeKey, true, '15s');

    // 5. Look up command mapped to this emoji in the group
    const commandName = await getShortcutCommand(chatJid, emoji);
    if (!commandName) return;

    const cmdDef = await getCommand(commandName);
    if (!cmdDef) {
      logger.debug(
        '[SHORTCUT]',
        `Mapped command '${commandName}' for emoji '${emoji}' is not registered.`
      );
      return;
    }

    const client = ctx.client;

    // 6. Fetch live group roster and metadata
    const metadata = await getGroupMetadata(client, chatJid);
    const participants = metadata?.participants || [];

    // 7. Resolve bot credentials and administrative permissions
    let botPn = null;
    let botLid = null;
    try {
      const creds = client?.getCredentials?.();
      if (creds) {
        botPn = safeUserJid(creds.meJid);
        botLid = safeUserJid(creds.meLid);
      }
    } catch {}

    const botPart = findParticipant(participants, botPn || botLid);
    const botIsAdmin = Boolean(botPart?.isAdmin);
    const botIsSuperAdmin = Boolean(botPart?.isSuperAdmin);

    // 8. Resolve reactor participant and permissions
    const reactorPart = findParticipant(participants, reactorJid);
    const reactorPn = reactorPart?.phoneNumber
      ? reactorPart.phoneNumber.includes('@')
        ? reactorPart.phoneNumber
        : `${reactorPart.phoneNumber.replace(/[^0-9]/g, '')}@s.whatsapp.net`
      : reactorJid.endsWith('@s.whatsapp.net')
        ? reactorJid
        : null;

    const reactorLid = reactorPart?.lid
      ? reactorPart.lid.includes('@')
        ? reactorPart.lid
        : `${reactorPart.lid.replace(/[^0-9]/g, '')}@lid`
      : reactorJid.endsWith('@lid')
        ? reactorJid
        : null;

    const reactorAdmin = Boolean(reactorPart?.isAdmin);
    const reactorSuperAdmin = Boolean(reactorPart?.isSuperAdmin);

    const botSettings = await getBotSettings();
    const reactorIsOwner = checkIsOwner(
      { id: reactorJid, pn: reactorPn, lid: reactorLid },
      botSettings
    );

    // 9. Resolve target message author (the participant being acted upon)
    const targetFromMe = Boolean(targetKey.fromMe);
    let targetSenderJid = targetFromMe
      ? botPn || botLid
      : targetKey.participant ||
        (targetKey.remoteJid && targetKey.remoteJid !== chatJid
          ? targetKey.remoteJid
          : null);

    // Fallback to local message store if target author is omitted by peer
    if (!targetSenderJid && client?.stores?.messages?.getById) {
      try {
        const stored = await client.stores.messages.getById(targetId);
        if (stored?.key?.participant) {
          targetSenderJid = stored.key.participant;
        } else if (stored?.senderJid) {
          targetSenderJid = stored.senderJid;
        }
      } catch {}
    }

    if (!targetSenderJid && !targetFromMe) {
      logger.debug(
        '[SHORTCUT]',
        `Could not resolve target message author for message ${targetId} in ${chatJid}`
      );
      return;
    }

    const targetPart = targetSenderJid
      ? findParticipant(participants, targetSenderJid)
      : null;

    const targetPn = targetPart?.phoneNumber
      ? targetPart.phoneNumber.includes('@')
        ? targetPart.phoneNumber
        : `${targetPart.phoneNumber.replace(/[^0-9]/g, '')}@s.whatsapp.net`
      : targetSenderJid?.endsWith('@s.whatsapp.net')
        ? targetSenderJid
        : null;

    const targetLid = targetPart?.lid
      ? targetPart.lid.includes('@')
        ? targetPart.lid
        : `${targetPart.lid.replace(/[^0-9]/g, '')}@lid`
      : targetSenderJid?.endsWith('@lid')
        ? targetSenderJid
        : null;

    const targetAdmin = Boolean(targetPart?.isAdmin);
    const targetSuperAdmin = Boolean(targetPart?.isSuperAdmin);
    const targetIsOwner = targetSenderJid
      ? checkIsOwner(
          { id: targetSenderJid, pn: targetPn, lid: targetLid },
          botSettings
        )
      : false;

    // 10. Load group settings for ctx.tableGroup
    const groupSettings = await getGroupSettings(chatJid);
    ctx.tableGroup = {
      id: chatJid,
      settings: groupSettings,
    };

    // 11. Construct synthetic QuotedMessage and ParsedMessage objects
    const quotedTarget = {
      remoteJid: chatJid,
      key: {
        id: targetId,
        remoteJid: chatJid,
        participant: targetFromMe ? undefined : targetSenderJid || undefined,
        fromMe: targetFromMe,
      },
    };

    const quoted = {
      stanzaId: targetId,
      sender: {
        id: targetSenderJid || targetPn || targetLid,
        pn: targetPn,
        lid: targetLid,
      },
      permissions: {
        admin: targetAdmin,
        superAdmin: targetSuperAdmin,
        isOwner: targetIsOwner,
      },
      flags: {
        fromMe: targetFromMe,
        isText: true,
        isMedia: false,
        isImage: false,
        isVideo: false,
        isAudio: false,
        isSticker: false,
        isStickerAnimated: false,
        isDocument: false,
      },
      body: {
        mtype: 'extendedTextMessage',
        rawText: '',
        prefix: null,
        command: null,
        commandWithoutPrefix: null,
        argsText: '',
        args: [],
        mentionedJid: [],
        expiration: 0,
      },
      reply: (content, options) =>
        reply(client, quotedTarget, content, options),
      react: (emojiStr) => react(client, quotedTarget, emojiStr),
    };

    const msg = {
      chat: chatJid,
      stanzaId: payload?.key?.id || `sc-${Date.now()}`,
      sender: {
        id: reactorJid,
        pn: reactorPn,
        lid: reactorLid,
        name: reactorPart?.displayName || reactorPart?.username || null,
      },
      bot: {
        id: botPn || botLid,
        pn: botPn,
        lid: botLid,
      },
      group: {
        id: chatJid,
        subject: metadata?.subject || '',
        participants,
      },
      permissions: {
        sender: {
          admin: reactorAdmin,
          superAdmin: reactorSuperAdmin,
          isOwner: reactorIsOwner,
        },
        bot: {
          admin: botIsAdmin,
          superAdmin: botIsSuperAdmin,
          isOwner: false,
        },
      },
      flags: {
        fromMe: false,
        isGroup: true,
        isText: true,
        isMedia: false,
        isImage: false,
        isVideo: false,
        isAudio: false,
        isSticker: false,
        isStickerAnimated: false,
        isDocument: false,
      },
      body: {
        mtype: 'reactionShortcut',
        rawText: `.${commandName}`,
        prefix: '.',
        command: commandName,
        commandWithoutPrefix: commandName,
        argsText: '',
        args: [],
        mentionedJid: [],
        expiration: 0,
      },
      quoted,
      reply: (content, options) =>
        reply(client, quotedTarget, content, options),
      react: (emojiStr) => react(client, quotedTarget, emojiStr),
    };

    ctx.msg = msg;

    logger.info(
      '[SHORTCUT]',
      `Triggering command '.${commandName}' from reaction '${emoji}' by ${reactorJid} in ${chatJid}`
    );

    // 12. Dispatch to command registry with all parameterized guards strictly applied
    await dispatchCommand(payload, ctx);
  },
});
