import {
  isLidJid,
  toUserJid,
  unwrapMessage,
  getContextInfo,
  downloadMediaMessage,
  resolveMediaPayload,
} from 'zapo-js';
import cache from '@nakiri/core/services/cache';
import { extractText, extractMentions } from '@nakiri/core/utils/message';
import { isCommand, validateCommand } from './command.js';
import { getTableBot } from '#app/middlewares/bot-table.js';

/**
 * Safely parse a JID to a user-level JID without device suffix
 * @param {string | null | undefined} jid
 * @returns {string | null}
 */
export function safeUserJid(jid) {
  if (!jid || typeof jid !== 'string') return null;
  try {
    return toUserJid(jid);
  } catch {
    return jid;
  }
}

const groupCache = cache.namespace('group:metadata');

/**
 * Check if the sender is an authorized bot owner
 * @param {{ id: string | null, lid: string | null, pn: string | null }} sender
 * @param {any} [botSettingsOrOwners]
 * @param {boolean} [fromMe]
 * @returns {boolean}
 */
export function checkIsOwner(
  sender,
  botSettingsOrOwners = null,
  fromMe = false
) {
  if (fromMe) return true;
  if (!sender) return false;

  const ownerSet = botSettingsOrOwners?._ownerSet;
  if (ownerSet instanceof Set && ownerSet.size > 0) {
    if (sender.id && ownerSet.has(sender.id)) return true;
    if (sender.pn && ownerSet.has(sender.pn)) return true;
    if (sender.lid && ownerSet.has(sender.lid)) return true;

    const pnDigits = sender.pn
      ? sender.pn.split('@')[0].replace(/[^0-9]/g, '')
      : null;
    if (pnDigits && ownerSet.has(pnDigits)) return true;

    const lidDigits = sender.lid
      ? sender.lid.split('@')[0].replace(/[^0-9]/g, '')
      : null;
    if (lidDigits && ownerSet.has(lidDigits)) return true;

    return false;
  }

  // Fallback for array of owners
  const owners = Array.isArray(botSettingsOrOwners)
    ? botSettingsOrOwners
    : botSettingsOrOwners?.owners;

  if (!Array.isArray(owners) || owners.length === 0) return false;

  const senderCandidates = [
    sender?.id,
    sender?.pn,
    sender?.lid,
    sender?.pn ? sender.pn.split('@')[0] : null,
    sender?.lid ? sender.lid.split('@')[0] : null,
  ].filter(Boolean);

  for (const owner of owners) {
    if (!owner) continue;
    const ownerStr = String(owner).trim();

    if (senderCandidates.includes(ownerStr)) {
      return true;
    }

    const cleanOwner = ownerStr.replace(/[^0-9]/g, '');
    if (cleanOwner.length >= 7) {
      for (const cand of senderCandidates) {
        const cleanCand = cand.replace(/[^0-9]/g, '');
        if (cleanCand === cleanOwner) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Clear group metadata cache for a specific group or all groups
 * @param {string} [groupJid]
 */
export function clearGroupMetadataCache(groupJid) {
  if (groupJid) {
    groupCache.delete(groupJid);
  } else {
    groupCache.clear();
  }
}

/**
 * Fetch group metadata with standardized caching (5 minutes TTL) to avoid IQ rate limits
 * @param {any} client
 * @param {string} groupJid
 * @param {boolean} [force=false]
 * @returns {Promise<any | null>}
 */
export async function getGroupMetadata(client, groupJid, force = false) {
  if (!client?.group?.queryGroupMetadata || !groupJid) return null;

  if (force) {
    groupCache.delete(groupJid);
  }

  try {
    return await groupCache.remember(groupJid, '5m', async () => {
      const metadata = await client.group.queryGroupMetadata(groupJid);
      return metadata || null;
    });
  } catch {
    return groupCache.get(groupJid) || null;
  }
}

/**
 * Detect message type from unwrapped message payload
 * @param {any} rawMessage
 * @returns {string}
 */
function getMessageType(rawMessage) {
  if (!rawMessage || typeof rawMessage !== 'object') return '';
  const keys = Object.keys(rawMessage);
  const ignoredKeys = new Set([
    'messageContextInfo',
    'senderKeyDistributionMessage',
  ]);
  return keys.find((k) => !ignoredKeys.has(k)) || keys[0] || '';
}

/**
 * Extract command, argument text, argument array, and prefix details
 * @param {string} rawText
 * @param {string[]} [prefixes]
 * @returns {{ prefix: string, command: string, commandWithoutPrefix: string, argsText: string, args: string[] }}
 */
function parseCommandAndArgs(rawText, prefixes = ['!']) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      prefix: '',
      command: '',
      commandWithoutPrefix: '',
      argsText: '',
      args: [],
    };
  }
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      prefix: '',
      command: '',
      commandWithoutPrefix: '',
      argsText: '',
      args: [],
    };
  }
  const prefixList =
    Array.isArray(prefixes) && prefixes.length > 0
      ? prefixes.includes('/')
        ? prefixes
        : [...prefixes]
      : ['!'];
  const matchedPrefix = prefixList.find((p) => trimmed.startsWith(p)) || '';

  // Handle special prefix-less symbol commands (e.g. '$', '>', '>>')
  if (!matchedPrefix) {
    if (trimmed.startsWith('>>')) {
      const remaining = trimmed.slice(2).trim();
      return {
        prefix: '',
        command: '>>',
        commandWithoutPrefix: '>>',
        argsText: remaining,
        args: remaining ? remaining.split(/\s+/).filter(Boolean) : [],
      };
    }
    if (trimmed.startsWith('>') || trimmed.startsWith('$')) {
      const sym = trimmed.charAt(0);
      const remaining = trimmed.slice(1).trim();
      return {
        prefix: '',
        command: sym,
        commandWithoutPrefix: sym,
        argsText: remaining,
        args: remaining ? remaining.split(/\s+/).filter(Boolean) : [],
      };
    }
  }

  const firstWord = trimmed.split(/\s+/)[0] || '';
  const command = firstWord.toLowerCase();

  const textWithoutPrefix = matchedPrefix
    ? trimmed.slice(matchedPrefix.length).trim()
    : trimmed;
  const partsWithoutPrefix = textWithoutPrefix.split(/\s+/).filter(Boolean);
  const commandWithoutPrefix = partsWithoutPrefix[0]?.toLowerCase() || '';

  const args = partsWithoutPrefix.slice(1);
  const argsText = textWithoutPrefix
    .slice(partsWithoutPrefix[0]?.length || 0)
    .trim();

  return {
    prefix: matchedPrefix,
    command,
    commandWithoutPrefix,
    argsText,
    args,
  };
}

/**
 * Match an actor against a list of group participants
 * @param {Array<any>} participants
 * @param {{ id?: string | null, pn?: string | null, lid?: string | null }} actor
 * @returns {any | null}
 */
function findGroupParticipant(participants, actor) {
  if (!Array.isArray(participants) || !actor) return null;

  const actorTargets = new Set(
    [
      actor.id,
      actor.pn,
      actor.lid,
      actor.pn ? actor.pn.split('@')[0] : null,
      actor.lid ? actor.lid.split('@')[0] : null,
    ].filter(Boolean)
  );

  for (const p of participants) {
    if (!p) continue;

    const pTargets = [
      p.jid,
      p.lid,
      p.phoneNumber,
      p.jid ? p.jid.split('@')[0] : null,
      p.lid ? p.lid.split('@')[0] : null,
    ].filter(Boolean);

    for (const target of pTargets) {
      if (actorTargets.has(target)) {
        return p;
      }
    }
  }

  return null;
}

/**
 * Extract and normalize quoted message details if present
 * @param {any} contextInfo
 * @param {{ id: string | null, lid: string | null, pn: string | null }} bot
 * @param {any} [botSettings]
 * @returns {any | null}
 */
function parseQuotedMessage(contextInfo, bot, botSettings = null) {
  if (!contextInfo || !contextInfo.quotedMessage) return null;

  let quotedRaw = contextInfo.quotedMessage;
  try {
    quotedRaw = unwrapMessage(quotedRaw) || quotedRaw;
  } catch {}

  const quotedParticipant = contextInfo.participant
    ? safeUserJid(contextInfo.participant)
    : null;

  let quotedLid = null;
  let quotedPn = null;
  if (quotedParticipant) {
    if (isLidJid(quotedParticipant)) {
      quotedLid = quotedParticipant;
    } else {
      quotedPn = quotedParticipant;
    }
  }

  const quotedParticipantAlt = contextInfo.participantAlt
    ? safeUserJid(contextInfo.participantAlt)
    : null;
  if (quotedParticipantAlt) {
    if (isLidJid(quotedParticipantAlt)) {
      quotedLid = quotedLid || quotedParticipantAlt;
    } else {
      quotedPn = quotedPn || quotedParticipantAlt;
    }
  }

  const quotedSenderId = quotedPn || quotedLid || quotedParticipant || null;

  const isFromMe = Boolean(
    quotedParticipant &&
    (quotedParticipant === bot?.pn || quotedParticipant === bot?.lid)
  );

  const isText = Boolean(
    quotedRaw?.conversation || quotedRaw?.extendedTextMessage
  );
  const isImage = Boolean(quotedRaw?.imageMessage);
  const isVideo = Boolean(quotedRaw?.videoMessage || quotedRaw?.ptvMessage);
  const isAudio = Boolean(quotedRaw?.audioMessage);
  const isSticker = Boolean(quotedRaw?.stickerMessage);
  const isStickerAnimated = Boolean(quotedRaw?.stickerMessage?.isAnimated);
  const isDocument = Boolean(
    quotedRaw?.documentMessage ||
    quotedRaw?.documentWithCaptionMessage?.message?.documentMessage
  );
  const isMedia = Boolean(
    isImage || isVideo || isAudio || isSticker || isDocument
  );

  const rawText = extractText(quotedRaw) || '';
  const mtype = getMessageType(quotedRaw);
  const { prefix, command, commandWithoutPrefix, argsText, args } =
    parseCommandAndArgs(rawText, botSettings?.prefixes);
  const mentionedJid = Array.isArray(contextInfo.mentionedJid)
    ? [...contextInfo.mentionedJid]
    : [];
  const expiration = Number(contextInfo.expiration || 0);

  return {
    stanzaId: contextInfo.stanzaId || '',
    sender: {
      id: quotedSenderId,
      lid: quotedLid,
      pn: quotedPn,
    },
    permissions: {
      isOwner: false,
      admin: false,
      superAdmin: false,
    },
    flags: {
      fromMe: isFromMe,
      isText,
      isMedia,
      isImage,
      isVideo,
      isAudio,
      isSticker,
      isStickerAnimated,
      isDocument,
    },
    body: {
      mtype,
      rawText,
      prefix,
      command,
      commandWithoutPrefix,
      argsText,
      args,
      mentionedJid,
      expiration,
    },
  };
}

/**
 * Parse and normalize incoming message metadata and identities
 *
 * Extracts bot identity, sender identity (resolving LID vs PN), and common message flags including isOwner.
 * Uses lazy getters for content (text, quoted, mentions, media) for zero overhead.
 *
 * @param {any} payload - Native Zapo message payload
 * @param {any} [client] - Zapo client instance (optional, for resolving bot identity)
 * @returns {Promise<import('./message.js').ParsedMessage>}
 */
export async function parseMessage(payload, client = null, botSettings = null) {
  if (!botSettings) {
    botSettings = await getTableBot();
  }

  const key = payload?.key || {};
  const fromMe = Boolean(key.fromMe);
  const isGroup = Boolean(
    key.isGroup !== undefined ? key.isGroup : key.remoteJid?.endsWith('@g.us')
  );
  const isBroadcast = Boolean(
    key.isBroadcast !== undefined
      ? key.isBroadcast
      : key.remoteJid?.endsWith('@broadcast')
  );
  const isNewsletter = Boolean(
    key.isNewsletter !== undefined
      ? key.isNewsletter
      : key.remoteJid?.endsWith('@newsletter')
  );

  // Extract raw message content for type detection
  let raw = payload?.message || payload;
  try {
    raw = unwrapMessage(raw) || raw;
  } catch {}

  const isText = Boolean(raw?.conversation || raw?.extendedTextMessage);
  const isImage = Boolean(raw?.imageMessage);
  const isVideo = Boolean(raw?.videoMessage || raw?.ptvMessage);
  const isAudio = Boolean(raw?.audioMessage);
  const isSticker = Boolean(raw?.stickerMessage);
  const isStickerAnimated = Boolean(raw?.stickerMessage?.isAnimated);
  const isDocument = Boolean(
    raw?.documentMessage ||
    raw?.documentWithCaptionMessage?.message?.documentMessage
  );
  const isMedia = Boolean(
    isImage || isVideo || isAudio || isSticker || isDocument
  );

  const rawText = extractText(payload) || '';
  const mtype = getMessageType(raw);
  const { prefix, command, commandWithoutPrefix, argsText, args } =
    parseCommandAndArgs(rawText, botSettings?.prefixes);
  const contextInfo = getContextInfo(raw);
  const mentionedJid = extractMentions(payload) || [];
  const expiration = Number(
    payload?.expirationSeconds || contextInfo?.expiration || 0
  );

  // 1. Resolve bot credentials (LID and PN)
  let botLid = null;
  let botPn = null;

  try {
    const creds =
      typeof client?.getCredentials === 'function'
        ? client.getCredentials()
        : null;

    if (creds) {
      botPn = safeUserJid(creds.meJid);
      botLid = safeUserJid(creds.meLid);
    }
  } catch {
    // Fallback if client or credentials not available
  }

  const botId = botPn || botLid || null;
  const quoted = parseQuotedMessage(
    contextInfo,
    {
      id: botId,
      lid: botLid,
      pn: botPn,
    },
    botSettings
  );

  // 2. Resolve sender identities (LID and PN)
  let senderLid = null;
  let senderPn = null;
  let primarySenderJid = null;

  if (fromMe) {
    senderLid = botLid;
    senderPn = botPn;
    primarySenderJid = botPn || botLid || safeUserJid(key.remoteJid);
  } else if (isGroup) {
    const participant = key.participant || null;
    const participantAlt = key.participantAlt || null;
    primarySenderJid = participant;

    if (participant) {
      if (isLidJid(participant)) {
        senderLid = participant;
        senderPn = safeUserJid(participantAlt);
      } else {
        senderPn = safeUserJid(participant);
        senderLid = participantAlt || null;
      }
    }
  } else {
    // Direct 1:1 chat
    const remoteJid = key.remoteJid || null;
    const remoteJidAlt = key.remoteJidAlt || null;
    primarySenderJid = remoteJid;

    if (remoteJid) {
      if (isLidJid(remoteJid)) {
        senderLid = remoteJid;
        senderPn = safeUserJid(remoteJidAlt);
      } else {
        senderPn = safeUserJid(remoteJid);
        senderLid = remoteJidAlt || null;
      }
    }
  }

  const senderId =
    senderPn || senderLid || safeUserJid(primarySenderJid) || null;
  const senderName = payload?.pushName || key.senderUsername || null;

  const senderIsOwner = checkIsOwner(
    { id: senderId, lid: senderLid, pn: senderPn },
    botSettings,
    fromMe
  );

  const botIsOwner = checkIsOwner(
    { id: botId, lid: botLid, pn: botPn },
    botSettings,
    true
  );

  const quotedIsOwner = quoted
    ? checkIsOwner(quoted.sender, botSettings, quoted.flags.fromMe)
    : false;

  // 3. Resolve group admin permissions if applicable
  let groupMeta = null;
  let botIsAdmin = false;
  let botIsSuperAdmin = false;
  let senderIsAdmin = false;
  let senderIsSuperAdmin = false;
  let quotedIsAdmin = false;
  let quotedIsSuperAdmin = false;

  if (isGroup && client && key.remoteJid) {
    groupMeta = await getGroupMetadata(client, key.remoteJid);
    if (groupMeta?.participants) {
      const botParticipant = findGroupParticipant(groupMeta.participants, {
        id: botId,
        lid: botLid,
        pn: botPn,
      });
      if (botParticipant) {
        botIsAdmin = Boolean(
          botParticipant.isAdmin || botParticipant.isSuperAdmin
        );
        botIsSuperAdmin = Boolean(botParticipant.isSuperAdmin);
      }

      const senderParticipant = fromMe
        ? botParticipant
        : findGroupParticipant(groupMeta.participants, {
            id: senderId,
            lid: senderLid,
            pn: senderPn,
          });

      if (senderParticipant) {
        senderIsAdmin = Boolean(
          senderParticipant.isAdmin || senderParticipant.isSuperAdmin
        );
        senderIsSuperAdmin = Boolean(senderParticipant.isSuperAdmin);
      }

      if (quoted) {
        const quotedParticipant = quoted.flags.fromMe
          ? botParticipant
          : findGroupParticipant(groupMeta.participants, quoted.sender);

        if (quotedParticipant) {
          quotedIsAdmin = Boolean(
            quotedParticipant.isAdmin || quotedParticipant.isSuperAdmin
          );
          quotedIsSuperAdmin = Boolean(quotedParticipant.isSuperAdmin);
        }
      }
    }
  }

  if (quoted) {
    quoted.permissions = {
      isOwner: quotedIsOwner,
      admin: quotedIsAdmin,
      superAdmin: quotedIsSuperAdmin,
    };
  }

  const msg = {
    chat: key.remoteJid,
    flags: {
      fromMe,
      isGroup,
      isText,
      isSticker,
      isStickerAnimated,
      isImage,
      isVideo,
      isAudio,
      isDocument,
      isMedia,
      isBroadcast,
      isNewsletter,
    },
    permissions: {
      bot: {
        isOwner: botIsOwner,
        admin: botIsAdmin,
        superAdmin: botIsSuperAdmin,
      },
      sender: {
        isOwner: senderIsOwner,
        admin: senderIsAdmin,
        superAdmin: senderIsSuperAdmin,
      },
    },
    bot: {
      id: botId,
      lid: botLid,
      pn: botPn,
    },
    sender: {
      id: senderId,
      lid: senderLid,
      pn: senderPn,
      name: senderName,
    },
    body: {
      mtype,
      rawText,
      prefix,
      command,
      commandWithoutPrefix,
      argsText,
      args,
      mentionedJid,
      expiration,
    },
    quoted,
    group: groupMeta || null,
  };

  // Attach non-enumerable helper wrappers to avoid polluting console.log(msg)
  Object.defineProperties(msg, {
    _rawPayload: { value: payload, enumerable: false, writable: true },
    send: {
      value: (targetOrContent, contentOrOptions, maybeOptions) => {
        if (
          typeof targetOrContent === 'string' &&
          (targetOrContent.includes('@') || targetOrContent.includes('-')) &&
          contentOrOptions !== undefined
        ) {
          return send(client, targetOrContent, contentOrOptions, maybeOptions);
        }
        return send(client, payload, targetOrContent, contentOrOptions);
      },
      enumerable: false,
      writable: true,
      configurable: true,
    },
    reply: {
      value: (content, options) => reply(client, payload, content, options),
      enumerable: false,
      writable: true,
      configurable: true,
    },
    react: {
      value: (emoji) => react(client, payload, emoji),
      enumerable: false,
      writable: true,
      configurable: true,
    },
    download: {
      value: (options) => downloadMedia(client, payload, options),
      enumerable: false,
      writable: true,
      configurable: true,
    },
    isCommand: {
      value: (options, prefixMode) => isCommand(msg, options, prefixMode),
      enumerable: false,
      writable: true,
      configurable: true,
    },
    validateCommand: {
      value: (options) => validateCommand(msg, options),
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });

  if (quoted && contextInfo?.quotedMessage) {
    const rawQuoted = contextInfo.quotedMessage;
    const quotedTarget = {
      remoteJid: key.remoteJid,
      key: {
        id: quoted.stanzaId,
        remoteJid: key.remoteJid,
        participant: quoted.flags.fromMe
          ? undefined
          : quoted.sender.id || undefined,
        fromMe: quoted.flags.fromMe,
      },
      message: rawQuoted,
    };

    Object.defineProperties(quoted, {
      _rawMessage: { value: rawQuoted, enumerable: false, writable: true },
      send: {
        value: (targetOrContent, contentOrOptions, maybeOptions) => {
          if (
            typeof targetOrContent === 'string' &&
            (targetOrContent.includes('@') || targetOrContent.includes('-')) &&
            contentOrOptions !== undefined
          ) {
            return send(
              client,
              targetOrContent,
              contentOrOptions,
              maybeOptions
            );
          }
          return send(client, key.remoteJid, targetOrContent, contentOrOptions);
        },
        enumerable: false,
        writable: true,
        configurable: true,
      },
      reply: {
        value: (content, options) =>
          reply(client, quotedTarget, content, options),
        enumerable: false,
        writable: true,
        configurable: true,
      },
      react: {
        value: (emoji) => react(client, quotedTarget, emoji),
        enumerable: false,
        writable: true,
        configurable: true,
      },
      download: {
        value: (options) => downloadMedia(client, rawQuoted, options),
        enumerable: false,
        writable: true,
        configurable: true,
      },
    });
  }

  return /** @type {import('./message.js').ParsedMessage} */ (msg);
}

/**
 * Convenient alias for parseMessage
 */
export const serialize = parseMessage;

/**
 * Extract user and LID JIDs from text containing @mentions
 * @param {string} text
 * @returns {string[]}
 */
export function extractMentionsFromText(text) {
  if (!text || typeof text !== 'string') return [];
  const regex = /(?:^|[^\w])@([0-9]{5,20}(?:@(?:s\.whatsapp\.net|lid))?)/g;
  const mentions = new Set();
  let m;
  while ((m = regex.exec(text)) !== null) {
    let jid = m[1];
    if (!jid.includes('@')) {
      jid = `${jid}@s.whatsapp.net`;
    }
    mentions.add(jid);
  }
  return [...mentions];
}

/**
 * Extract plain text string from string or Zapo content object
 * @param {string | object} content
 * @returns {string}
 */
function extractTextFromContent(content) {
  if (typeof content === 'string') return content;
  if (!content || typeof content !== 'object') return '';
  return (
    content.text ||
    content.caption ||
    content.conversation ||
    content.extendedTextMessage?.text ||
    ''
  );
}

/**
 * Send a message with automatic mention resolution
 * @param {any} client - Zapo client instance
 * @param {any} target - Destination JID, native message event, ParsedMessage, or message key
 * @param {string | object} content - Message content (text string or Zapo content object)
 * @param {object} [options] - Additional send options
 * @returns {Promise<any>}
 */
export async function send(client, target, content, options = {}) {
  if (!client?.message?.send) {
    throw new Error('client.message.send is required to send a message');
  }

  const destination =
    typeof target === 'string'
      ? target
      : target?.key?.remoteJid || target?.remoteJid || null;

  if (!destination) {
    throw new Error('Unable to determine destination JID');
  }

  const messageContent =
    typeof content === 'string' ? { type: 'text', text: content } : content;

  const sendOptions = { ...options };

  if (sendOptions.autoMention !== false) {
    const text = extractTextFromContent(messageContent);
    const autoMentions = extractMentionsFromText(text);
    if (autoMentions.length > 0) {
      const existing = Array.isArray(sendOptions.mentions)
        ? sendOptions.mentions
        : [];
      sendOptions.mentions = [...new Set([...existing, ...autoMentions])];
    }
  }

  delete sendOptions.autoMention;

  return await client.message.send(destination, messageContent, sendOptions);
}

/**
 * Send a reply to a message with automatic mention resolution
 * Delegates to send() with options.quote configured
 * @param {any} client - Zapo client instance
 * @param {any} target - Native message event, ParsedMessage, QuotedMessage, or message key
 * @param {string | object} content - Message content (text string or Zapo content object)
 * @param {object} [options] - Additional send options (e.g. mentions, quote)
 * @returns {Promise<any>}
 */
export async function reply(client, target, content, options = {}) {
  let quoteTarget = options?.quote;
  if (quoteTarget === undefined) {
    quoteTarget = target?._rawPayload || (target?.key ? target : undefined);
  } else if (quoteTarget === false) {
    quoteTarget = undefined;
  }

  const sendOptions = { ...options };
  if (quoteTarget) {
    sendOptions.quote = quoteTarget;
  } else {
    delete sendOptions.quote;
  }

  return await send(client, target, content, sendOptions);
}

/**
 * React to a message with an emoji
 * @param {any} client - Zapo client instance
 * @param {any} target - Native message event, ParsedMessage, QuotedMessage, or message key
 * @param {string} [emoji=''] - Emoji character, or empty string to remove reaction
 * @returns {Promise<any>}
 */
export async function react(client, target, emoji = '') {
  if (!client?.message?.send) {
    throw new Error('client.message.send is required to send a reaction');
  }

  const destination =
    target?.key?.remoteJid ||
    target?.remoteJid ||
    (typeof target === 'string' ? target : null);

  if (!destination) {
    throw new Error('Unable to determine destination JID for reaction');
  }

  const reactionTarget = target?._rawPayload || (target?.key ? target : target);

  return await client.message.send(destination, {
    type: 'reaction',
    emoji: String(emoji || ''),
    target: reactionTarget,
  });
}

/**
 * Download media from a message or quoted message
 * @param {any} client - Zapo client instance (or null to use stateless downloadMediaMessage)
 * @param {any} target - Native message event, ParsedMessage, QuotedMessage, or raw Proto.IMessage
 * @param {object} [options]
 * @param {string} [options.toFile] - File path to stream media directly to disk
 * @param {boolean} [options.asStream] - Return Readable stream instead of Buffer
 * @param {number} [options.maxBytes] - Cap maximum bytes to download
 * @param {AbortSignal} [options.signal] - Abort signal
 * @returns {Promise<Buffer | import('stream').Readable | string>}
 */
export async function downloadMedia(client, target, options = {}) {
  const source =
    target?._rawMessage || target?._rawPayload || target?.message || target;

  if (!source) {
    throw new Error('Target message is empty or missing');
  }

  const innerMsg = source?.message || source;
  const mediaPayload = resolveMediaPayload(innerMsg);
  if (!mediaPayload) {
    throw new Error('Target message does not contain downloadable media');
  }

  // 1. Download directly to file
  if (options?.toFile && typeof options.toFile === 'string') {
    if (typeof client?.message?.downloadToFile === 'function') {
      await client.message.downloadToFile(source, options.toFile, options);
      return options.toFile;
    }

    const stream =
      typeof client?.message?.download === 'function'
        ? await client.message.download(source, options)
        : await downloadMediaMessage(source, options);

    const { createWriteStream } = await import('node:fs');
    await new Promise((resolve, reject) => {
      const out = createWriteStream(options.toFile);
      stream.pipe(out);
      out.on('finish', resolve);
      out.on('error', reject);
      stream.on('error', reject);
    });
    return options.toFile;
  }

  // 2. Return stream
  if (options?.asStream) {
    if (typeof client?.message?.download === 'function') {
      return await client.message.download(source, options);
    }
    return await downloadMediaMessage(source, options);
  }

  // 3. Return Buffer (default)
  if (typeof client?.message?.downloadBytes === 'function') {
    const bytes = await client.message.downloadBytes(source, options);
    return Buffer.from(bytes);
  }

  const stream = await downloadMediaMessage(source, options);
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export { isCommand, validateCommand };

export default {
  parseMessage,
  serialize,
  getGroupMetadata,
  clearGroupMetadataCache,
  send,
  reply,
  react,
  downloadMedia,
  extractMentionsFromText,
  isCommand,
  validateCommand,
};
