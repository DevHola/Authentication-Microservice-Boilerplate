import pg from 'pg'
const { Pool } = pg
const user = process.env.DBUSER
const password = process.env.DBPASSWORD
const host = process.env.DBHOST
const port = process.env.DBPORT
const database = process.env.DATABASE
if (user == null && password == null && host == null && port == null && database == null) {
  throw new Error('env not set')
}
export const pool = new Pool({
  user,
  password,
  host,
  port: 5432,
  database
})
pool.connect((error, client, release) => {
  if (error != null) {
    console.log('connection failed', error.stack)
  } else {
    // console.log('connection successful')
    release()
  }
})
