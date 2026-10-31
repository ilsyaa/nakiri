/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  // 1. Groups table
  const hasGroups = await knex.schema.hasTable('groups');
  if (!hasGroups) {
    await knex.schema.createTable('groups', (table) => {
      table.string('id').primary();
      table.json('settings').nullable();
    });
  }

  // 2. Group members table
  const hasGroupMembers = await knex.schema.hasTable('group_members');
  if (!hasGroupMembers) {
    await knex.schema.createTable('group_members', (table) => {
      table.increments('id').primary();
      table
        .string('group_id')
        .notNullable()
        .references('id')
        .inTable('groups')
        .onDelete('CASCADE');
      table.string('user_lid').nullable();
      table.string('user_pn').nullable();
      table.string('pushname').nullable();
      table.integer('warnings').defaultTo(0);
      table.timestamp('last_warned_at').nullable();
      table.integer('score').defaultTo(0);
      table.timestamp('last_interacted_at').nullable();

      table.index(['group_id']);
      table.unique(['group_id', 'user_lid']);
      table.unique(['group_id', 'user_pn']);
    });
  }
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('group_members');
  await knex.schema.dropTableIfExists('groups');
}
