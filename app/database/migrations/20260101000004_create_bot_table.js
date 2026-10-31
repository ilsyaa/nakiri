/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable('bots');
  if (!exists) {
    await knex.schema.createTable('bots', (table) => {
      table.increments('id').primary();
      table.json('owners').nullable();
      table.json('prefixes').nullable();
      table.boolean('self').defaultTo(false);
    });
  }
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('bots');
}
