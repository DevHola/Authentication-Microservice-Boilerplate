import { type Request, type Response, type NextFunction } from 'express'
import { type User } from '../interfaces/Interface'
import { register } from '../services/userService'
// CREATE USER
export const Register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, usertype } = req.body as User
    await register({ name, email, password, usertype })
    res.status(200).json({
      message: `Registration successful. A verification mail has been sent to ${email}`
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'user already exist') {
        res.status(409).json({
          message: 'User already exists'
        })
      } else {
        next(error)
      }
    }
  }
}
// USER LOGIN

// USER FORGET PASSWORD

// USER RESET PASSWORD

// USER LOGOUT

// REFRESH TOKEN
