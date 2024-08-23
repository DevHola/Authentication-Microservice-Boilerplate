import { type DecodedToken } from '../middleware/jwt'
import * as jwt from 'jsonwebtoken'
import { getuserbyemail } from '../services/userService'
import { type User } from '../interfaces/Interface'
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
