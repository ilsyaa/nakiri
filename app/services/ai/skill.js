/**
 * Declarative AI skill definition.
 *
 * @param {object} definition
 * @param {string} definition.name - Tool name exposed to the AI provider
 * @param {string} definition.description - When the AI should call this skill
 * @param {object} [definition.parameters] - JSON Schema for tool arguments
 * @param {(args: Record<string, any>, context: any) => Promise<string> | string} definition.execute
 * @returns {Readonly<{ name: string, description: string, parameters: object, execute: Function }>}
 */
export function defineSkill({
  name,
  description,
  parameters = { type: 'object', properties: {} },
  execute,
}) {
  if (!name || typeof name !== 'string') {
    throw new Error('Skill name is required');
  }
  if (!description || typeof description !== 'string') {
    throw new Error(`Skill "${name}" requires a description`);
  }
  if (typeof execute !== 'function') {
    throw new Error(`Skill "${name}" requires an execute function`);
  }

  return Object.freeze({ name, description, parameters, execute });
}

export default defineSkill;
