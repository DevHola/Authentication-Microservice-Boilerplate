import pg from 'pg'
const { Pool } = pg

export const pool = new Pool({
  user: 'dev',
  password: '12345678',
  host: 'localhost',
  port: 5433,
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
