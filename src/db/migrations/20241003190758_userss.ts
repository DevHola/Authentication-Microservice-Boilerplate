import type { Knex } from 'knex'

export async function up (knex: Knex): Promise<void> {
  await knex.schema.createTableIfNotExists('users', (table) => {
    table.uuid('user_id').defaultTo(knex.raw('gen_random_uuid()')).primary() // Auto-incrementing id
    table.string('name', 255).notNullable()
    table.string('email', 255).unique().notNullable()
    table.string('password', 255).notNullable()
    table.boolean('isverified').notNullable().defaultTo(false)
    table.boolean('2FA').notNullable().defaultTo(false)
    table.integer('usertype').unsigned().notNullable()
    table.foreign('usertype').references('id').inTable('usertype')
    table.timestamps(true, true)
  })
}

export async function down (knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users')
}
