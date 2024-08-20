import { pool } from '../config/db'
import { type token_type } from '../interfaces/Interface'
import { type QueryResult } from 'pg'

export const createTT = async (data: token_type): Promise<QueryResult> => {
  const results = await pool.query('INSERT INTO token_type (name) VALUES ($1)', [data.name])
  return results.rows[0]
}
export const updateTT = async (id: string, name: string): Promise<void> => {
  const results = await pool.query('UPDATE token_type SET name=$1 WHERE token_type_id=$2', [name, id])
  return results.rows[0]
}
