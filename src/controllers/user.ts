import { type Request, type Response, type NextFunction } from 'express'
import { type User } from '../interfaces/Interface'
import { register, login, storeRefreshToken, checkemail } from '../services/userService'
import { reuseableMail } from '../config/config'
import * as jwt from 'jsonwebtoken'
const refresh = {
  secret: process.env.AUTH_REFRESH_TOKEN_SECRET,
  cookie: {
    name: 'refreshTnk'
  }
}

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
export const Login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as User
    const user: User = await login(email, password)
    const accesstoken = await accesstokengen(user)
    const refreshtoken = await refreshtokengen(user)
    res.cookie(
      refresh.cookie.name,
      refreshtoken,
      {
        httpOnly: true,
        sameSite: 'none',
        secure: false,
        maxAge: 24 * 60 * 60 * 1000

      }
    )
    res.status(200).json({
      token: accesstoken
    })
  } catch (error) {
    next(error)
  }
}

// USER FORGET PASSWORD
export const forgetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body.email as User
    const find = await checkemail(email)
    if (find) {
      const content: string = ''
      const subject: string = 'ACCOUNT PASSWORD RESET'
      const from: string = ''
      await reuseableMail(subject, content, email, from)
      res.status(200).json({
        message: 'Reset Code has been sent to your mail'
      })
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        res.status(409).json({
          message: 'User does not exisy'
        })
      }
    } else {
      next(error)
    }
  }
}

// USER RESET PASSWORD

// USER LOGOUT

// ACCESS TOKEN
const accesstokengen = async (data: User): Promise<string> => {
  if (process.env.AUTH_ACCESS_TOKEN_SECRET != null) {
    const accesstoken = jwt.sign({ id: data.user_id, email: data.email }, process.env.AUTH_ACCESS_TOKEN_SECRET, { expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY })
    return accesstoken
  } else {
    throw new Error('Missing environment variable: AUTH_REFRESH_TOKEN_SECRET')
  }
}

// REFRESH TOKEN
const refreshtokengen = async (data: User): Promise<string> => {
  if (process.env.AUTH_REFRESH_TOKEN_SECRET != null && data.user_id != null) {
    const refreshtoken = jwt.sign({ id: data.user_id, email: data.email }, process.env.AUTH_REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRY
    })
    await storeRefreshToken(refreshtoken, data.user_id)
    return refreshtoken
  } else {
    throw new Error('Missing environment variable: AUTH_REFRESH_TOKEN_SECRET')
  }
}
