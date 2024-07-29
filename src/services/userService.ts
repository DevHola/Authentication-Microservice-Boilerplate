import { type User } from '../interfaces/Interface'
import { pool } from '../config/db'
import { type QueryResult } from 'pg'
import * as bcrypt from 'bcrypt'

export const register = async (user: User): Promise<QueryResult> => {
  const finduser = await pool.query('SELECT * FROM users WHERE email = $1', [user.email])
  const users = finduser.rows[0] as User | undefined
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (users) {
    throw new Error('user already exist')
  } else {
    const hashpassword = await bcrypt.hash(user.password, 10)
    return await pool.query('INSERT INTO users (name, email, password, usertype) Values ($1,$2,$3,$4)', [user.name, user.email, hashpassword, user.usertype])
  }
}
