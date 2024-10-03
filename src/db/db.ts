/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import Knex from 'knex'
import configs from '../../knexfile'

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
const environment = process.env.NODE_ENV || 'development'

// Create a Knex instance using the appropriate environment configuration
export const database = Knex(configs[environment])
