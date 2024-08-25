import { type DecodedToken } from '../middleware/jwt'
import * as jwt from 'jsonwebtoken'
import { getuserbyemail } from '../services/userService'
import { type mail, type User } from '../interfaces/Interface'
import { getRefreshToken, getRVToken, storeRVToken } from './redis'
export const validateAccessToken = async (token: string): Promise<User> => {
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

export const validateresetToken = async (token: string): Promise<User> => {
  const secret = process.env.AUTH_RESET_TOKEN_SECRET
  if (secret != null) {
    const decoded = jwt.verify(token, secret, { ignoreExpiration: true }) as DecodedToken
    const type: string = 'Reset'
    const checkexisttoken: boolean = await getRVToken(token, type, decoded._id)
    if (!checkexisttoken) {
      throw new Error('Authentication failed')
    }
    const user = await getuserbyemail(decoded.email)
    if (user == null) {
      throw new Error('Authentication failed')
    } else {
      return user
    }
  } else {
    throw new Error('Authentication failed')
  }
}
export const validateverifyToken = async (token: string): Promise<User> => {
  const secret = process.env.AUTH_RESET_TOKEN_SECRET
  if (secret != null) {
    const decoded = jwt.verify(token, secret, { ignoreExpiration: true }) as DecodedToken
    const type: string = 'Verify'
    const checkexisttoken: boolean = await getRVToken(token, type, decoded._id)
    if (!checkexisttoken) {
      throw new Error('Authentication failed')
    }
    const user = await getuserbyemail(decoded.email)
    if (user == null) {
      throw new Error('Authentication failed')
    } else {
      return user
    }
  } else {
    throw new Error('Authentication failed')
  }
}

export const validateRefreshToken = async (user: User, token: string): Promise<boolean> => {
  const secret = process.env.AUTH_REFRESH_TOKEN_SECRET
  const id = user.user_id
  if (secret != null && id != null) {
    const comparetoken: string = await getRefreshToken(token, id)
    if (comparetoken !== null) {
      const decoded = jwt.verify(comparetoken, secret) as DecodedToken
      const user = await getuserbyemail(decoded.email)
      if (user == null) {
        throw new Error('Authentication failed')
      }
      return true
    }
  }
  throw new Error('Authentication failed')
}

export const verifytokengen = async (data: User): Promise<string> => {
  if (process.env.AUTH_RESET_TOKEN_SECRET != null && data.user_id != null) {
    const verifytoken = jwt.sign({ _id: data.user_id, email: data.email }, process.env.AUTH_RESET_TOKEN_SECRET, { expiresIn: process.env.RESET_PASSWORD_TOKEN_EXPIRY_MINS })
    const tokentype: string = 'Verify'
    await storeRVToken(verifytoken, tokentype, data.user_id)
    return verifytoken
  } else {
    throw new Error('Missing environment variable: AUTH_REFRESH_TOKEN_SECRET')
  }
}
export const resettokengen = async (data: User): Promise<string> => {
  if (process.env.AUTH_RESET_TOKEN_SECRET != null && data.user_id != null) {
    const resettoken = jwt.sign({ _id: data.user_id, email: data.email }, process.env.AUTH_RESET_TOKEN_SECRET, { expiresIn: process.env.RESET_PASSWORD_TOKEN_EXPIRY_MINS })
    const tokentype: string = 'Reset'
    await storeRVToken(resettoken, tokentype, data.user_id)
    return resettoken
  } else {
    throw new Error('Missing environment variable: AUTH_REFRESH_TOKEN_SECRET')
  }
}

export const accesstokengen = async (data: User): Promise<string> => {
  if (process.env.AUTH_ACCESS_TOKEN_SECRET != null) {
    const accesstoken = jwt.sign({ _id: data.user_id, email: data.email }, process.env.AUTH_ACCESS_TOKEN_SECRET, { expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY })
    return accesstoken
  } else {
    throw new Error('Missing environment variable: AUTH_REFRESH_TOKEN_SECRET')
  }
}
export const refreshtokengen = async (data: User): Promise<string> => {
  if (process.env.AUTH_REFRESH_TOKEN_SECRET != null && data.user_id != null) {
    const refreshtoken = jwt.sign({ _id: data.user_id, email: data.email }, process.env.AUTH_REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRY
    })
    return refreshtoken
  } else {
    throw new Error('Missing environment variable: AUTH_REFRESH_TOKEN_SECRET')
  }
}
export const Resetpasswordmail = async (resettoken: string, email: string): Promise<mail> => {
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
  const from = process.env.FROM ?? 'no-reply@yourcompany.com'
  const data: mail = {
    to: email,
    content,
    subject,
    from
  }
  return data
}
export const verificationmail = async (verifytoken: string, email: string): Promise<mail> => {
  const url: string = `${process.env.FRONTEND_URL}/auth/token=${verifytoken}`
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
  const subject: string = 'ACCOUNT VERIFICATION'
  const from = process.env.FROM ?? 'no-reply@yourcompany.com'
  const data: mail = {
    to: email,
    content,
    subject,
    from
  }
  return data
}
