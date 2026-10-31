import { defineCommand } from '#app/services/bot/index.js';
import { delay } from '@nakiri/core/utils/common';
import db from '@nakiri/core/services/database';
import cache from '@nakiri/core/services/cache';
import logger from '@nakiri/core/utils/logger';
import { clearGroupMetadataCache } from '#app/services/bot/index.js';

export default defineCommand({
  name: 'leave',
  aliases: ['out'],
  category: 'owner',
  description: 'Make bot exit the current group (owner only)',
  middlewares: ['group', 'sender:isOwner'],

  async execute(payload, ctx) {
    const { client, msg } = ctx;
    if (!msg) return;

    const groupJid = msg.chat;

    await msg.reply('Selamat tinggal! 👋');
    await delay(1000);

    // 1. Instruct client to leave the group
    if (client?.group?.leaveGroup) {
      try {
        await client.group.leaveGroup([groupJid]);
      } catch (err) {
        logger.warn(
          '[GROUP]',
          `Failed to leave group ${groupJid} via API: ${err.message}`
        );
      }
    }

    // 2. Immediate cleanup in database and cache
    try {
      const deletedMembers = await db('group_members')
        .where({ group_id: groupJid })
        .del();

      const deletedGroup = await db('groups').where({ id: groupJid }).del();

      clearGroupMetadataCache(groupJid);
      cache.delete(`table_group:${groupJid}`);

      logger.info(
        '[GROUP]',
        `Bot exited group ${groupJid} via command. Purged ${deletedGroup} group record(s) and ${deletedMembers} member(s).`
      );
    } catch (err) {
      logger.error(
        '[GROUP]',
        `Error during group cleanup for ${groupJid}: ${err.message}`
      );
    }
  },
});
