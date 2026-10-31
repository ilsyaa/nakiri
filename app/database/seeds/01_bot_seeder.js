import { firstOrCreate } from '@nakiri/core/services/database';

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
  await firstOrCreate(
    knex('bots'),
    { id: 1 },
    {
      owners: JSON.stringify(['6285174902345', '210900309037136']),
      prefixes: JSON.stringify(['!', '.', '#']),
      self: false,
    }
  );
}
