/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable('reminders');
  if (!exists) {
    await knex.schema.createTable('reminders', (table) => {
      table.increments('id').primary();
      table.string('session_id').notNullable();
      table.string('chat_jid').notNullable();
      table.string('sender_jid').notNullable();
      table.string('sender_pn').nullable();
      table.string('sender_lid').nullable();
      table.string('sender_name').nullable();
      table.text('message').notNullable();
      table.string('mode').notNullable().defaultTo('static');
      table.string('frequency').notNullable().defaultTo('once');
      table.string('timezone').notNullable().defaultTo('Asia/Jakarta');
      table.integer('hour').nullable();
      table.integer('minute').nullable();
      table.integer('day_of_month').nullable();
      table.string('schedule_text').nullable();
      table.timestamp('next_run_at').notNullable();
      table.timestamp('last_run_at').nullable();
      table.string('status').notNullable().defaultTo('active');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      table.index(['status', 'next_run_at']);
      table.index(['session_id', 'sender_pn']);
      table.index(['session_id', 'sender_lid']);
      table.index(['chat_jid']);
    });
  }
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('reminders');
}
