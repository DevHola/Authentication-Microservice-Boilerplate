import type { Knex } from 'knex'

export async function up (knex: Knex): Promise<void> {
  await knex.schema.createTableIfNotExists('usertype', async (table) => {
    table.increments('id').primary()
    table.string('name', 500).notNullable()
    table.string('description', 500).notNullable()
    table.timestamps(true, true)
  })
}

export async function down (knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('usertype')
}
