import { type User } from '../interfaces/Interface'
import { pool } from '../config/db'
import { type QueryResult } from 'pg'
import * as bcrypt from 'bcrypt'
import crypto from 'crypto'
// import * as jwt from 'jsonwebtoken'

export const register = async (user: User): Promise<QueryResult> => {
  const finduser = await pool.query('SELECT * FROM users WHERE email = $1', [user.email])
  const users = finduser.rows[0] as User | undefined
  if (users != null) {
    throw new Error('user already exist')
  } else {
    const hashpassword = await bcrypt.hash(user.password, 10)
    return await pool.query('INSERT INTO users (name, email, password, usertype) Values ($1,$2,$3,$4)', [user.name, user.email, hashpassword, user.usertype])
  }
}

export const login = async (email: string, password: string): Promise<User> => {
  const finduser = await pool.query('SELECT user_id, email, password FROM users WHERE email = $1', [email])
  const user = finduser.rows[0] as User | undefined
  if (user == null) {
    throw new Error('User not found')
  } else {
    const passwordcompare = await bcrypt.compare(password, user.password)
    if (!passwordcompare) {
      throw new Error('incorrect credentials')
    }
    return user
  }
}

export const storeRefreshToken = async (token: string, id: string): Promise<void> => {
  if (process.env.AUTH_REFRESH_TOKEN_SECRET != null) {
    const encrypttoken = crypto.createHmac('sha512', process.env.AUTH_REFRESH_TOKEN_SECRET).update(token).digest('hex')
    await pool.query('UPDATE users SET token=$1 WHERE user_id=$2', [encrypttoken, id])
  }
}
export const checkemail = async (email: string): Promise<boolean> => {
  const finduser = await pool.query('SELECT name, email FROM users WHERE email=$1', [email])
  const user = finduser.rows[0] as User | undefined
  if (user != null) {
    return true
  } else {
    throw new Error('User not found')
  }
}
