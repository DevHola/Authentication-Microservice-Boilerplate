import { type Request, type Response, type NextFunction } from 'express'
import { type mail, type User } from '../interfaces/Interface'
import { register, comparePassword, getuserbyemail, accountVerify, passwordReset, checkemailexist } from '../services/userService'
import { reusableMail } from '../config/config'
import { type CustomRequest } from '../middleware/jwt'
import { validationResult } from 'express-validator/check'
import { StatusCodes } from 'http-status-codes'
import { deleteRVToken, storeRefreshToken } from '../config/redis'
import { accesstokengen, refreshtokengen, resettokengen, validateAccessToken, validateRefreshToken, validateresetToken, validateverifyToken, verifytokengen } from '../config/reuseables'

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
      console.log(verifytoken)
      // create separate endpoint to send the mail maybe it times to use those message queues
      // const data = await verificationmail(verifytoken)
      // await reusableMail(data.subject, data.content, email, data.from)
      res.status(403).json({
        message: 'Your email address is not verified. A verification mail has been sent to your mail.',
        status: 'false',
        token: verifytoken
      })
    } else {
      const [accesstoken, refreshtoken] = await Promise.all([accesstokengen(user), refreshtokengen(user)])

      console.log(refreshtoken)
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
      console.log(resettoken)
      const url: string = `${process.env.FRONTEND_URL}/auth/token=${resettoken}`
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
    console.log(user)
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
// USER LOGOUT: COMPLETED
export const logout = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if ((req.user?.user_id) != null && req.headers.authorization != null) {
      const token = req.headers.authorization
      const key = `${token}|${req.user.user_id}`
      await deleteRVToken(key)
      res.status(200).json({
        message: 'Logged out'
      })
    }
  } catch (error) {
    next(error)
  }
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
