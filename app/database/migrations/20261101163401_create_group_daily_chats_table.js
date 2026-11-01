/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  const hasTable = await knex.schema.hasTable('group_daily_chats');
  if (!hasTable) {
    await knex.schema.createTable('group_daily_chats', (table) => {
      table.increments('id').primary();
      table
        .string('group_id')
        .notNullable()
        .references('id')
        .inTable('groups')
        .onDelete('CASCADE');
      table.string('date', 10).notNullable(); // YYYY-MM-DD
      table.text('messages').notNullable();
      table.integer('message_count').defaultTo(0);
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      table.unique(['group_id', 'date']);
      table.index(['group_id', 'date']);
    });
  }
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('group_daily_chats');
}
