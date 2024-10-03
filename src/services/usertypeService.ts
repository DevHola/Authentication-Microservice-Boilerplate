import { pool } from '../config/db'
import { type QueryResult } from 'pg'
import { type UserType } from '../interfaces/Interface'

export const createUserType = async (usertype: UserType): Promise<QueryResult> => {
  return await pool.query('INSERT INTO usertype (name, description) Values ($1, $2)', [usertype.name, usertype.description])
}

export const UpdateUserType = async (id: number, usertype: UserType): Promise<QueryResult> => {
  return await pool.query('UPDATE usertype SET name=$1, description=$2 WHERE id=$3', [usertype.name, usertype.description, id])
}

export const getAllUserType = async (): Promise<QueryResult> => {
  return await pool.query('SELECT id, name, description From usertype')
}

export const getUserType = async (id: number): Promise<QueryResult> => {
  return await pool.query('SELECT id, name, description From usertype WHERE id = $1', [id])
}

export const deleteUserType = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM usertype WHERE id = $1', [id])
}
