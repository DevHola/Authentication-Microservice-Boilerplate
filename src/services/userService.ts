import { type User } from '../interfaces/Interface'
import { pool } from '../config/db'
import * as bcrypt from 'bcrypt'
import crypto from 'crypto'

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
    const finduser = await pool.query('SELECT token FROM users WHERE user_id=$1', [id])
    const user = finduser.rows[0] as User | undefined
    if (user == null) {
      throw new Error('User not found')
    }
    const encrypttoken = crypto.createHmac('sha512', process.env.AUTH_REFRESH_TOKEN_SECRET).update(token).digest('hex')
    const newtokens = (user.token != null) ? [...user.token, encrypttoken] : [encrypttoken]
    await pool.query('UPDATE users SET token=$1 WHERE user_id=$2', [newtokens, id])
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
export const passwordReset = async (password: string, id: string): Promise<void> => {
  const hashpassword = await bcrypt.hash(password, 10)
  await pool.query('UPDATE users SET password=$1, reset_token=$2 WHERE user_id=$3', [hashpassword, null, id])
}
export const accountLogout = async (id: string, token: string): Promise<void> => {
  const finduser = await pool.query('SELECT token FROM users WHERE user_id=$1', [id])
  const user = finduser.rows[0] as User | undefined
  if (user == null) {
    throw new Error('User not found')
  }
  const userToken = user.token
  if (process.env.AUTH_REFRESH_TOKEN_SECRET != null) {
    const encrypttoken = crypto.createHmac('sha512', process.env.AUTH_REFRESH_TOKEN_SECRET).update(token).digest('hex')
    const result = userToken?.filter((token) => token !== encrypttoken)
    await pool.query('UPDATE users SET token=$1 WHERE user_id=$2', [result, id])
  }
}
export const MasterAccountLogout = async (id: string): Promise<void> => {
  const finduser = await pool.query('SELECT token FROM users WHERE user_id=$1', [id])
  const user = finduser.rows[0] as User | undefined
  if (user == null) {
    throw new Error('User not found')
  }
  const usertoken: string[] = []
  await pool.query('UPDATE users SET token=$1 WHERE user_id=$2', [usertoken, id])
}
export const compareRefreshtokens = async (id: string, toenctoken: string): Promise<boolean> => {
  const finduser = await pool.query('SELECT token FROM users WHERE user_id=$1', [id])
  const user = finduser.rows[0] as User | undefined
  if (user == null) {
    throw new Error('Authentication failed')
  }
  const secret = process.env.AUTH_REFRESH_TOKEN_SECRET
  if (secret != null) {
    const encrypttoken = crypto.createHmac('sha512', secret).update(toenctoken).digest('hex')
    const userToken = user.token
    const token = userToken?.find((token) => token === encrypttoken)
    if (token != null && token.length > 0) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}
