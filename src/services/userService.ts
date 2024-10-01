import { type User } from '../interfaces/Interface'
import { pool } from '../config/db'
import * as bcrypt from 'bcrypt'

export const register = async (user: User): Promise<User> => {
  const hashpassword = await bcrypt.hash(user.password, 10)
  const createuser = await pool.query('INSERT INTO users (name, email, password, usertype) Values ($1,$2,$3,$4) RETURNING user_id,email,name', [user.name, user.email, hashpassword, user.usertype])
  const fineuser = createuser.rows[0] as User
  if (fineuser === null) {
    throw new Error('User not created')
  } else {
    return fineuser
  }
}

export const checkemailexist = async (email: string): Promise<boolean> => {
  const finduser = await pool.query('SELECT user_id, name, email FROM users WHERE email=$1', [email])
  const user = finduser.rows[0] as User | undefined
  if (user == null) {
    return false
  } else {
    return true
  }
}

export const comparePassword = async (password: string, email: string): Promise<boolean> => {
  const finduser = await pool.query('SELECT password FROM users WHERE email=$1', [email])
  const user = finduser.rows[0] as User | undefined
  if (user == null) {
    throw new Error('Authentication failed')
  }
  const passwordcompare = await bcrypt.compare(password, user.password)
  if (!passwordcompare) {
    return false
  } else {
    return true
  }
}

export const accountVerify = async (id: string): Promise<void> => {
  await pool.query('UPDATE users SET isverified=$1 WHERE user_id=$2', [true, id])
}

export const getuserbyemail = async (email: string): Promise<User> => {
  const finduser = await pool.query('SELECT user_id, name, email, isverified FROM users WHERE email=$1', [email])
  const user = finduser.rows[0] as User
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  return user
}

export const passwordReset = async (password: string, id: string): Promise<void> => {
  const hashpassword = await bcrypt.hash(password, 10)
  await pool.query('UPDATE users SET password=$1 WHERE user_id=$2', [hashpassword, id])
}
