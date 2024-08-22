import { type Request, type Response, type NextFunction } from 'express'
import { type User } from '../interfaces/Interface'
import { register, comparePassword, getuserbyemail, accountVerify, passwordReset, checkemailexist } from '../services/userService'
import { reusableMail } from '../config/config'
import * as jwt from 'jsonwebtoken'
import { type DecodedToken, type CustomRequest } from '../config/jwt'
import { validationResult } from 'express-validator/check'
import { StatusCodes } from 'http-status-codes'
import { MasterAccountLogout, storetoken, accountLogout, compareRefreshtokens } from '../services/tokenService'
const refresh = {
  secret: process.env.AUTH_REFRESH_TOKEN_SECRET,
  cookie: {
    name: 'refreshTnk'
  }
}

// CREATE USER: Completed
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
    const data = await verificationmail(verifytoken)
    await reusableMail(data.subject, data.content, email, data.from)
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

// USER LOGIN: Completed
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
      // create separate endpoint to send the mail maybe it times to use those message queues
      // const data = await verificationmail(verifytoken)
      // await reusableMail(data.subject, data.content, email, data.from)
      res.status(403).json({
        message: 'Your email address is not verified. A verification mail has been sent to your mail.',
        status: 'false',
        token: verifytoken
      })
    } else {
      const accesstoken = await accesstokengen(user)
      const refreshtoken = await refreshtokengen(user)
      console.log(refreshtoken)
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

// USER FORGET PASSWORD: Completed
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
      const accesstoken = await resettokengen(user)
      console.log(accesstoken)
      const url: string = `${process.env.FRONTEND_URL}/auth/token=${accesstoken}`
      const content: string = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding: 10px 0;
                    background-color: #007bff;
                    color: #ffffff;
                }
                .content {
                    padding: 20px;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    color: #ffffff;
                    background-color: #007bff;
                    text-decoration: none;
                    border-radius: 4px;
                    text-align: center;
                }
                .footer {
                    text-align: center;
                    padding: 10px 0;
                    background-color: #f4f4f4;
                    color: #777777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>We received a request to reset your password. Click the button below to reset your password:</p>
                    <p>
                        <a href="${url}" class="button">Reset Password</a>
                    </p>
                    <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
                    <p>Thank you,<br>The Team</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 Your Company. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>`
      const subject: string = 'ACCOUNT PASSWORD RESET'
      const from = process.env.FROM
      if (from != null) {
        await reusableMail(subject, content, email, from)
        res.status(200).json({
          message: 'Reset Code has been sent to your mail'
        })
      }
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

export const tokenverify = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: errors.array()
    })
  }
  try {
    if (req.user?.user_id != null) {
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
  const reftoken = req.body.rtoken as string
  try {
    const user = await validateAccessToken(acctoken)
    const id = user.user_id
    if (id != null) {
      const checkreftoken = await validateRefreshToken(id, reftoken)
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

// USER VERIFICATION:1
export const verifyUser = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: errors.array()
    })
  }
  try {
    const verifytoken = req.body.token as string
    const user = await validateVerifyresetToken(verifytoken)
    const userId = user.user_id
    if (userId != null) {
      await accountVerify(userId)
      await MasterAccountLogout(userId)
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

// USER RESET PASSWORD: 1
export const resetPassword = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: errors.array()
    })
  }
  try {
    const password: string = req.body.password
    const verifytoken = req.body.token as string
    const user = await validateVerifyresetToken(verifytoken)
    const userId = user.user_id
    if (userId != null) {
      await passwordReset(password, userId)
      await MasterAccountLogout(userId)
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
// USER LOGOUT: COMPLETED
export const logout = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if ((req.user?.user_id) != null && req.cookies.refreshTnk != null) {
      const userId: string = req.user.user_id
      const cookies: string = req.cookies.refreshTnk
      await accountLogout(userId, cookies)
      res.clearCookie('refreshTnk', {
        httpOnly: true,
        secure: false,
        sameSite: 'none'
      })
      res.status(200).json({
        message: 'Logged out'
      })
    }
  } catch (error) {
    next(error)
  }
}
// COMPLETED
export const Masterlogout = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if ((req.user?.user_id) != null && req.cookies.refreshTnk != null) {
      const userId: string = req.user.user_id
      await MasterAccountLogout(userId)
      res.clearCookie('refreshTnk', {
        httpOnly: true,
        secure: false,
        sameSite: 'none'
      })
      res.status(200).json({
        message: 'Garbage collected'
      })
    }
  } catch (error) {
    next(error)
  }
}

const validateAccessToken = async (token: string): Promise<User> => {
  const secret = process.env.AUTH_ACCESS_TOKEN_SECRET
  if (secret != null) {
    const decoded = jwt.verify(token, secret, { ignoreExpiration: true }) as DecodedToken
    const user = await getuserbyemail(decoded.email)
    if (user == null) {
      throw new Error('Authentication failed')
    }
    return user
  } else {
    throw new Error('Authentication failed')
  }
}

const validateVerifyresetToken = async (token: string): Promise<User> => {
  const secret = process.env.AUTH_RESET_TOKEN_SECRET
  if (secret != null) {
    const decoded = jwt.verify(token, secret, { ignoreExpiration: true }) as DecodedToken
    const user = await getuserbyemail(decoded.email)
    if (user == null) {
      throw new Error('Authentication failed')
    }
    return user
  } else {
    throw new Error('Authentication failed')
  }
}
const validateRefreshToken = async (id: string, token: string): Promise<boolean> => {
  const secret = process.env.AUTH_REFRESH_TOKEN_SECRET
  if (secret != null) {
    const comparetoken = await compareRefreshtokens(id, token)
    if (!comparetoken) {
      throw new Error('authentication failed')
    }
    const decoded = jwt.verify(token, secret) as DecodedToken
    const user = await getuserbyemail(decoded.email)
    if (user == null) {
      throw new Error('Authentication failed')
    }
    return true
  }
  throw new Error('Authentication failed')
}

const accesstokengen = async (data: User): Promise<string> => {
  if (process.env.AUTH_ACCESS_TOKEN_SECRET != null) {
    const accesstoken = jwt.sign({ id: data.user_id, email: data.email }, process.env.AUTH_ACCESS_TOKEN_SECRET, { expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY })
    return accesstoken
  } else {
    throw new Error('Missing environment variable: AUTH_REFRESH_TOKEN_SECRET')
  }
}

const verifytokengen = async (data: User): Promise<string> => {
  if (process.env.AUTH_RESET_TOKEN_SECRET != null && data.user_id != null) {
    const verifytoken = jwt.sign({ id: data.user_id, email: data.email }, process.env.AUTH_RESET_TOKEN_SECRET, { expiresIn: process.env.RESET_PASSWORD_TOKEN_EXPIRY_MINS })
    const tokenID: number = 3
    await storetoken(verifytoken, tokenID, data.user_id)
    return verifytoken
  } else {
    throw new Error('Missing environment variable: AUTH_REFRESH_TOKEN_SECRET')
  }
}
const resettokengen = async (data: User): Promise<string> => {
  if (process.env.AUTH_RESET_TOKEN_SECRET != null && data.user_id != null) {
    const resettoken = jwt.sign({ id: data.user_id, email: data.email }, process.env.AUTH_RESET_TOKEN_SECRET, { expiresIn: process.env.RESET_PASSWORD_TOKEN_EXPIRY_MINS })
    const tokenID: number = 2
    await storetoken(resettoken, tokenID, data.user_id)
    return resettoken
  } else {
    throw new Error('Missing environment variable: AUTH_REFRESH_TOKEN_SECRET')
  }
}

// REFRESH TOKEN: Completed
const refreshtokengen = async (data: User): Promise<string> => {
  if (process.env.AUTH_REFRESH_TOKEN_SECRET != null && data.user_id != null) {
    const refreshtoken = jwt.sign({ id: data.user_id, email: data.email }, process.env.AUTH_REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRY
    })
    const tokenID: number = 1
    await storetoken(refreshtoken, tokenID, data.user_id)
    return refreshtoken
  } else {
    throw new Error('Missing environment variable: AUTH_REFRESH_TOKEN_SECRET')
  }
}

interface mail {
  url: string
  content: string
  subject: string
  from: string
}

const verificationmail = async (accesstoken: string): Promise<mail> => {
  const url: string = `${process.env.FRONTEND_URL}/auth/token=${accesstoken}`
  const content: string = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              padding: 10px 0;
              background-color: #007bff;
              color: #ffffff;
          }
          .content {
              padding: 20px;
          }
          .button {
              display: inline-block;
              padding: 10px 20px;
              color: #ffffff;
              background-color: #007bff;
              text-decoration: none;
              border-radius: 4px;
              text-align: center;
          }
          .footer {
              text-align: center;
              padding: 10px 0;
              background-color: #f4f4f4;
              color: #777777;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Email Verification</h1>
          </div>
          <div class="content">
              <p>Hello,</p>
              <p>Thank you for registering with us. Please click the button below to verify your email address:</p>
              <p>
                  <a href="${url}" class="button">Verify Email</a>
              </p>
              <p>If you did not sign up for this account, please ignore this email or contact support if you have questions.</p>
              <p>Thank you,<br>The Team</p>
          </div>
          <div class="footer">
              <p>&copy; 2024 Your Company. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`
  const subject: string = 'ACCOUNT PASSWORD RESET'
  const from = process.env.FROM ?? 'no-reply@yourcompany.com'
  const data: mail = {
    url,
    content,
    subject,
    from
  }
  return data
}
