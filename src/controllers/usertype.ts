import { type Request, type Response, type NextFunction } from 'express'
import { createUserType, UpdateUserType, getAllUserType, getUserType, deleteUserType } from '../services/usertypeService'
import { type UserType } from '../interfaces/Interface'
import { type User } from '../interfaces/user'
export const userTypeCreation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description } = req.body as UserType
    const result = await createUserType({ name, description })
    res.status(200).json({
      message: 'Usertype created',
      result
    })
  } catch (error) {
    next(error)
  }
}
export const userTypeUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id)
    const { name, description } = req.body as UserType
    const result = await UpdateUserType(id, { name, description })
    res.status(200).json({
      message: 'Usertype updated',
      result: result.rows
    })
  } catch (error) {
    next(error)
  }
}

export const AllUserType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userstype = await getAllUserType()
    const user = req.user as User
    console.log(user.user_id)
    res.status(200).json(
      userstype.rows
    )
  } catch (error) {
    next(error)
  }
}
export const getUType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions

    const usertype = await getUserType(id)
    res.status(200).json(usertype.rows)
  } catch (error) {
    next(error)
  }
}
// DELETE SPECIFIC USERTYPE
export const deleteUType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id)
    await deleteUserType(id)
    res.status(200).json({
      message: `usertype ${id} has been deleted`
    })
  } catch (error) {
    next(error)
  }
}
