import logger from '@nakiri/core/utils/logger';
import stickerSkill from './sticker.js';
import reminderSkill from './reminder.js';
import groupInfoSkill from './group-info.js';
import memberInfoSkill from './member-info.js';
import listRemindersSkill from './list-reminders.js';
import cancelReminderSkill from './cancel-reminder.js';

/**
 * Registered AI skills.
 * Add new skill modules to this list.
 */
export const skills = [
  stickerSkill,
  reminderSkill,
  groupInfoSkill,
  memberInfoSkill,
  listRemindersSkill,
  cancelReminderSkill,
];

const skillMap = new Map(skills.map((skill) => [skill.name, skill]));

/**
 * Build OpenAI-compatible tool definitions for every registered skill.
 *
 * @returns {Array<{ type: 'function', function: { name: string, description: string, parameters: object } }>}
 */
export function getSkillDefinitions() {
  return skills.map((skill) => ({
    type: 'function',
    function: {
      name: skill.name,
      description: skill.description,
      parameters: skill.parameters,
    },
  }));
}

/**
 * Execute a skill by tool name.
 *
 * @param {string} name
 * @param {string | Record<string, any>} rawArgs - JSON string from the AI provider
 * @param {any} context - Skill execution context (client, msg, payload, ctx)
 * @returns {Promise<string>} Tool result text for the AI provider
 */
export async function executeSkill(name, rawArgs, context) {
  const skill = skillMap.get(name);
  if (!skill) {
    return `Skill "${name}" is not available.`;
  }

  let args = {};
  if (rawArgs && typeof rawArgs === 'object') {
    args = rawArgs;
  } else if (typeof rawArgs === 'string' && rawArgs.trim()) {
    try {
      args = JSON.parse(rawArgs);
    } catch {
      return `Skill "${name}" received invalid arguments.`;
    }
  }

  try {
    return await skill.execute(args, context);
  } catch (err) {
    logger.error('[AI_SKILL]', `Skill "${name}" failed: ${err.message}`);
    return `Skill "${name}" failed to execute.`;
  }
}

export default {
  skills,
  getSkillDefinitions,
  executeSkill,
};
