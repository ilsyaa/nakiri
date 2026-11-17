/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  const hasTable = await knex.schema.hasTable('reminders');
  if (!hasTable) return;

  const hasColumn = await knex.schema.hasColumn('reminders', 'call_seconds');
  if (!hasColumn) {
    await knex.schema.alterTable('reminders', (table) => {
      table.integer('call_seconds').nullable();
    });
  }
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  const hasTable = await knex.schema.hasTable('reminders');
  if (!hasTable) return;

  const hasColumn = await knex.schema.hasColumn('reminders', 'call_seconds');
  if (hasColumn) {
    await knex.schema.alterTable('reminders', (table) => {
      table.dropColumn('call_seconds');
    });
  }
}
