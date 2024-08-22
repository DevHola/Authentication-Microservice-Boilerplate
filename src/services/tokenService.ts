import { type QueryResult } from 'pg'
import { pool } from '../config/db'
// import { type token } from '../interfaces/Interface'
import crypto from 'crypto'
import { type token } from '../interfaces/Interface'

export const storetoken = async (hash: string, tokenID: number, userID: string): Promise<void> => {
  switch (tokenID) {
    case 1:
      if (process.env.AUTH_REFRESH_TOKEN_SECRET != null) {
        const encrypttoken = crypto.createHmac('sha512', process.env.AUTH_REFRESH_TOKEN_SECRET).update(hash).digest('hex')
        await pool.query('INSERT INTO tokens (hash,token_type_id,user_id) VALUES ($1,$2,$3)', [encrypttoken, tokenID, userID])
      }
      break
    case 2:
      if (process.env.AUTH_ACCESS_TOKEN_SECRET != null) {
        const encrypttoken = crypto.createHmac('sha512', process.env.AUTH_ACCESS_TOKEN_SECRET).update(hash).digest('hex')
        await pool.query('INSERT INTO tokens (hash,token_type_id,user_id) VALUES ($1,$2,$3)', [encrypttoken, tokenID, userID])
      }
      break
    case 3:
      if (process.env.AUTH_ACCESS_TOKEN_SECRET != null) {
        const encrypttoken = crypto.createHmac('sha512', process.env.AUTH_ACCESS_TOKEN_SECRET).update(hash).digest('hex')
        await pool.query('INSERT INTO tokens (hash,token_type_id,user_id) VALUES ($1,$2,$3)', [encrypttoken, tokenID, userID])
      }
      break
    default:
      break
  }
}
export const accountLogout = async (id: string, hash: string): Promise<void> => {
  const secret = process.env.AUTH_REFRESH_TOKEN_SECRET
  if (secret != null) {
    const encrypttoken = crypto.createHmac('sha512', secret).update(hash).digest('hex')
    await pool.query('DELETE FROM tokens WHERE hash=$1 AND user_id=$2', [encrypttoken, id])
  }
}
export const MasterAccountLogout = async (id: string): Promise<QueryResult> => {
  const token = await pool.query('DELETE FROM tokens where user_id=$1', [id])
  return token.rows[0]
}
export const compareRefreshtokens = async (id: string, toenctoken: string): Promise<boolean> => {
  const secret = process.env.AUTH_REFRESH_TOKEN_SECRET
  if (secret != null) {
    const encrypttoken = crypto.createHmac('sha512', secret).update(toenctoken).digest('hex')
    const findtoken = await pool.query('SELECT tokens.*, token_type.name FROM tokens INNER JOIN token_type ON tokens.token_type_id = token_type.id WHERE tokens.user_id=$1 AND tokens.hash=$2 AND tokens.token_type_id=1', [id, encrypttoken])
    const token = findtoken.rows[0] as token | undefined
    if (token !== null) {
      return true
    }
    return false
  }
  return false
}
export const compareresetverifytokens = async (id: string, toenctoken: string): Promise<boolean> => {
  const secret = process.env.AUTH_ACCESS_TOKEN_SECRET
  if (secret != null) {
    const encrypttoken = crypto.createHmac('sha512', secret).update(toenctoken).digest('hex')
    const findtoken = await pool.query('SELECT * FROM tokens WHERE user_id = $1  AND hash = $2 AND token_type_id IN (2, 3)', [id, encrypttoken])
    const token = findtoken.rows[0] as token | undefined
    if (token !== null) {
      return true
    }
    return false
  }
  return false
}
