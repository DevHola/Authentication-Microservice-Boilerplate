import pg from 'pg'
const { Pool } = pg
export const pool = new Pool({
  user: 'dev',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'Banking'
})
pool.connect((error, client, release) => {
  if (error != null) {
    console.log('connection failed', error.stack)
  } else {
    console.log('connection successful')
    release()
  }
})
export const checkAndMigrateDatabase = async (): Promise<void> => {
  try {
    const res = await pool.query(
      "SELECT to_regclass('public.migrations') AS exists"
    )

    if (res.rows[0].exists === null) {
      console.log('Migrations table not found. Running migrations...')
    } else {
      console.log('Migrations table found. Skipping migration.')
    }
  } catch (err) {
    console.error('Error checking database:', err)
  }
}
// postgres-migrations
// knex
// node-pg-migrate
