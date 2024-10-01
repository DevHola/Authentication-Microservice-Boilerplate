/* eslint-disable @typescript-eslint/no-misused-promises */
import { Strategy as JWTStrategy } from 'passport-jwt'
import { type Request } from 'express'
import { getuserbyemail } from '../services/userService'
import { type DecodedToken } from './jwt'
import { type User } from '../interfaces/Interface'

const authorizationExtractor = function (req: Request): string | null {
  if ((req.headers.authorization != null) && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1]
  }
  return null
}
const secret = process.env.AUTH_ACCESS_TOKEN_PUBLIC_SECRET
if (secret == null) {
  throw new Error('AUTH_ACCESS_TOKEN_SECRET is not defined')
}
export default new JWTStrategy(
  {
    jwtFromRequest: authorizationExtractor,
    secretOrKey: secret,
    algorithms: ['RS256']
  }, async (payload: DecodedToken, done): Promise<void> => {
    try {
      const user: User = await getuserbyemail(payload.email)
      if (user !== null) {
        done(null, user)
      } else {
        done(null, false)
      }
    } catch (error) {
      done(error, false)
    }
  }
)
