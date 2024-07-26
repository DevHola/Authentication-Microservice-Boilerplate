import { pool } from '../config/db'
import { type Request, type Response, type NextFunction } from 'express'
// import { QueryResult } from 'pg'

export const userTypeCreation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description } = req.body
    await pool.query('INSERT INTO usertype (name, description) Values ($1, $2)', [name, description])
    res.status(200).json({
      message: 'Usertype created'
    })
  } catch (error) {
    next(error)
  }
}

export const userTypeDescEdit = async (): Promise<void> => {

}
