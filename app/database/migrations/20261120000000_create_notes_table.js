/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable('notes');
  if (exists) return;

  await knex.schema.createTable('notes', (table) => {
    table.increments('id').primary();
    table.string('session_id', 64).notNullable();
    table.string('scope', 16).notNullable();
    table.string('scope_key', 191).notNullable();
    table.string('name', 32).notNullable();
    table.text('content').notNullable();

    // Personal note ownership
    table.string('owner_jid', 191).nullable();
    table.string('owner_pn', 191).nullable();
    table.string('owner_lid', 191).nullable();

    // Group note author (last editor)
    table.string('author_jid', 191).nullable();
    table.string('author_pn', 191).nullable();
    table.string('author_lid', 191).nullable();
    table.string('author_name', 191).nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['session_id', 'scope', 'scope_key', 'name']);
    table.index(['session_id', 'scope', 'scope_key']);
    table.index(['session_id', 'scope', 'name']);
    table.index(['session_id', 'scope', 'owner_pn']);
    table.index(['session_id', 'scope', 'owner_lid']);
  });
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('notes');
}
