import { type User } from '../interfaces/Interface'
import { pool } from '../config/db'
// import { type QueryResult } from 'pg'
import * as bcrypt from 'bcrypt'
import crypto from 'crypto'
// import * as jwt from 'jsonwebtoken'

export const register = async (user: User): Promise<void> => {
  const finduser = await pool.query('SELECT * FROM users WHERE email = $1', [user.email])
  const users = finduser.rows[0] as User | undefined
  if (users != null) {
    throw new Error('user already exist')
  } else {
    const hashpassword = await bcrypt.hash(user.password, 10)
    await pool.query('INSERT INTO users (name, email, password, usertype) Values ($1,$2,$3,$4)', [user.name, user.email, hashpassword, user.usertype])
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
    } else {
      return user
    }
  }
}

export const accountVerify = async (id: string): Promise<void> => {
  await pool.query('UPDATE users SET isverified=$1 WHERE user_id=$2', [true, id])
}

export const storeRefreshToken = async (token: string, id: string): Promise<void> => {
  if (process.env.AUTH_REFRESH_TOKEN_SECRET != null) {
    const encrypttoken = crypto.createHmac('sha512', process.env.AUTH_REFRESH_TOKEN_SECRET).update(token).digest('hex')
    await pool.query('UPDATE users SET token=$1 WHERE user_id=$2', [encrypttoken, id])
  }
}
export const checkemail = async (email: string): Promise<User> => {
  const finduser = await pool.query('SELECT user_id, name, email FROM users WHERE email=$1', [email])
  const user = finduser.rows[0] as User | undefined
  if (user == null) {
    throw new Error('User not found')
  } else {
    return user
  }
}
export const storeResetToken = async (token: string, id: string): Promise<void> => {
  if (process.env.AUTH_ACCESS_TOKEN_SECRET != null) {
    const encrypttoken = crypto.createHmac('sha512', process.env.AUTH_ACCESS_TOKEN_SECRET).update(token).digest('hex')
    await pool.query('UPDATE users SET reset_token=$1 WHERE user_id=$2', [encrypttoken, id])
  }
}
// 50/50
export const passwordReset = async (password: string, id: string): Promise<void> => {
  await pool.query('UPDATE users SET password=$1, reset_token=$2 WHERE user_id=$3', [password, null, id])
}
export const accountLogout = async (id: string): Promise<void> => {
  await pool.query('UPDATE users SET token=$1, WHERE user_id=$2', [null, id])
}
