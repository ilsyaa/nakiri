/**
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  const hasColumn = await knex.schema.hasColumn('bots', 'shortcuts');
  if (!hasColumn) {
    await knex.schema.table('bots', (table) => {
      table.json('shortcuts').nullable();
    });
  }
}

/**
 * @param {import('knex').Knex} knex
 */
export async function down(knex) {
  const hasColumn = await knex.schema.hasColumn('bots', 'shortcuts');
  if (hasColumn) {
    await knex.schema.table('bots', (table) => {
      table.dropColumn('shortcuts');
    });
  }
}
