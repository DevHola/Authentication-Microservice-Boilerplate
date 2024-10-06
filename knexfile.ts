/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
import type { Knex } from 'knex'
require('ts-node/register')
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(__dirname, './src/', '.env') })

const environments: string[] = ['development', 'staging', 'production']

const connection: Knex.ConnectionConfig = {
  user: process.env.DBUSER as string,
  password: process.env.DBPASSWORD as string,
  host: process.env.DBHOST as string,
  database: process.env.DATABASE as string
}

const commonConfig: Knex.Config = {
  client: 'pg',
  connection,
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'Auth_knex_migrations',
    directory: 'src/db/migrations'
  },
  seeds: {
    directory: 'src/db/seeds'
  }
}

export default Object.fromEntries(environments.map((env: string) => [env, commonConfig]))
