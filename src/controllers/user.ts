import { type Request, type Response, type NextFunction } from 'express'
import { type User } from '../interfaces/Interface'
import { register, comparePassword, getuserbyemail, accountVerify, passwordReset, checkemailexist } from '../services/userService'
// import { type CustomRequest } from '../middleware/jwt'
import { validationResult } from 'express-validator/check'
import { StatusCodes } from 'http-status-codes'
import { deleteRVToken, storeRefreshToken } from '../config/redis'
import { accesstokengen, refreshtokengen, Resetpasswordmail, resettokengen, validateAccessToken, validateRefreshToken, validateresetToken, validateverifyToken, verificationmail, verifytokengen } from '../config/reuseables'
import createMQProducer from '../config/rabbitmqconfig'
const url = process.env.MQCONNECTURL ?? ''

export const Register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const error = validationResult(req)
  if (!error.isEmpty()) {
    res.status(StatusCodes.NOT_FOUND).json({ errors: error.array() })
  }
  try {
    const name: string = req.body.name
    const email: string = req.body.email
    const password: string = req.body.password
    const usertype: number = req.body.usertype
    const check = await checkemailexist(email)
    // https://www.npmjs.com/package/response-status-code
    if (check) {
      throw new Error('user already exist')
    }
    const user = await register({ name, email, password, usertype })
    const verifytoken = await verifytokengen(user)
    const data = await verificationmail(verifytoken, email)
    const walletqueue: string = 'user_wallet_queue'
    const wexchangeName: string = 'user_wallet_exchange'
    const wroutekey: string = 'user_wallet_route'
    const walletproducer = await createMQProducer(url, walletqueue, wexchangeName, wroutekey)
    const wmsg = {
      action: 'wallet_create',
      data: {
        userid: user.user_id
      }
    }
    walletproducer(JSON.stringify(wmsg))
    const queueName: string = 'mailqueue'
    const exchangeName: string = 'mail_exchange'
    const routekey: string = 'mail_route'
    const producer = await createMQProducer(url, queueName, exchangeName, routekey)
    const msg = {
      action: 'Verification',
      data
    }
    producer(JSON.stringify(msg))
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
export const Login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
  }
  try {
    const email: string = req.body.email
    const password: string = req.body.password
    const user: User = await getuserbyemail(email)
    if (user === null || user === null) {
      throw new Error('User not found')
    }
    const compare = await comparePassword(password, user.email)
    if (!compare) {
      throw new Error('incorrect credentials')
    }
    if (user.isverified === false) {
      const verifytoken = await verifytokengen(user)
      const data = await verificationmail(verifytoken, email)
      const queueName: string = 'mailqueue'
      const exchangeName: string = 'mail_exchange'
      const routekey: string = 'mail_route'
      const producer = await createMQProducer(url, queueName, exchangeName, routekey)
      const msg = {
        action: 'Verification',
        data
      }
      producer(JSON.stringify(msg))
      res.status(403).json({
        message: 'Your email address is not verified. A verification mail has been sent to your mail.',
        status: 'false',
        token: verifytoken
      })
    } else {
      const [accesstoken, refreshtoken] = await Promise.all([accesstokengen(user), refreshtokengen(user)])
      if ((user.user_id) != null) {
        await storeRefreshToken(accesstoken, user.user_id, refreshtoken)
      }
      res.status(200).json({
        token: accesstoken,
        status: true
      })
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        res.status(404).json({
          message: 'User not found'
        })
      } else if (error.message === 'incorrect credentials') {
        res.status(401).json({
          message: 'Invalid Credentials'
        })
      } else {
        next(error)
      }
    }
  }
}
export const ForgetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: errors.array()
    })
  }
  try {
    const email: string = req.body.email
    const user: User = await getuserbyemail(email)
    if (user != null) {
      const resettoken = await resettokengen(user)
      const data = await Resetpasswordmail(resettoken, email)
      console.log(data)
      const queueName: string = 'mailqueue'
      const exchangeName: string = 'mail_exchange'
      const routekey: string = 'mail_route'
      const producer = await createMQProducer(url, queueName, exchangeName, routekey)
      const msg = {
        action: 'Verification',
        data
      }
      producer(JSON.stringify(msg))
      res.status(200).json({
        message: 'Reset Code has been sent to your mail'
      })
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        res.status(409).json({
          message: 'User does not exist'
        })
      } else if (error.message.includes('mailing failed')) {
        res.status(500).json({
          message: error.message
        })
      } else {
        next(error)
      }
    }
  }
}
export const tokenverify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: errors.array()
    })
  }
  try {
    if (req.user != null) {
      res.status(200).json({
        user: req.user
      })
    } else {
      res.status(401).json({ message: 'Unauthorized: User ID is missing' })
    }
  } catch (error) {
    next(error)
  }
}
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: errors.array()
    })
  }
  const acctoken = req.body.token as string

  try {
    const user = await validateAccessToken(acctoken)
    if (user != null) {
      const checkreftoken = await validateRefreshToken(user, acctoken)
      if (!checkreftoken) {
        res.status(401).json({
          error: 'authentication failed'
        })
      }
      const accesstoken = await accesstokengen(user)
      res.status(200).json({
        token: accesstoken
      })
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication failed') {
        res.status(401).json({
          error: 'Authentication Failed'
        })
      } else if (error.message === 'jwt expired') {
        res.status(401).json({
          error: 'Authentication Failed'
        })
      } else if (error.message === 'invalid token') {
        res.status(401).json({
          error: 'Authentication Failed'
        })
      }
    }
  }
}
export const verifyUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: errors.array()
    })
  }
  const verifytoken = req.body.token as string
  try {
    const user = await validateverifyToken(verifytoken)
    const userId = user.user_id
    if (userId != null) {
      await accountVerify(userId)
      res.status(200).json({
        message: 'Account Verified'
      })
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication failed') {
        res.status(401).json({
          error: 'Authentication Failed'
        })
      } else if (error.message === 'jwt expired') {
        res.status(401).json({
          error: 'Authentication Failed'
        })
      } else if (error.message === 'invalid token') {
        res.status(401).json({
          error: 'Authentication Failed'
        })
      } else {
        next(error)
      }
    }
  }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: errors.array()
    })
  }
  try {
    const password: string = req.body.password
    const verifytoken = req.body.token as string
    const user = await validateresetToken(verifytoken)
    const userId = user.user_id
    if (userId != null) {
      await passwordReset(password, userId)
      res.status(200).json({
        message: 'Password Reset Successful'
      })
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: error.message
      })
    }
  }
}
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if ((req.user) != null) {
      const user = req.user as User
      const token = req.headers.authorization
      const key = `${token}|${user.user_id}`
      await deleteRVToken(key)
      res.status(200).json({
        message: 'Logged out'
      })
    }
  } catch (error) {
    next(error)
  }
}
