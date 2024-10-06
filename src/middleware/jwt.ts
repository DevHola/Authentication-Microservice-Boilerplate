import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { getuserbyemail } from '../services/userService'
export interface DecodedToken {
  user_id: string
  email: string
  name: string
}

export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const headers = req.headers.authorization
  if (headers != null && process.env.AUTH_ACCESS_TOKEN_PUBLIC_SECRET != null) {
    const [header, token] = headers.split(' ')
    if (header !== 'Bearer' || (token.length === 0)) {
      res.status(401).json({ message: 'Invalid Access Token' })
    }
    try {
      const decoded = jwt.verify(token, process.env.AUTH_ACCESS_TOKEN_PUBLIC_SECRET, { algorithms: ['RS256'] }) as DecodedToken
      const user = await getuserbyemail(decoded.email)
      if (user == null) {
        res.status(401).json({ message: 'Authentication failed' })
      }
      req.user = user
      next()
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'jwt expired') {
          res.status(401).json({
            error: 'Authentication Failed'
          })
        } else if (error.message === 'invalid token') {
          res.status(401).json({
            error: 'Authentication Failed'
          })
        } else {
          res.status(500).json({
            error: error.message
          })
        }
      }
    }
  } else {
    res.status(401).json({ message: 'Missing Access Credentials' })
  }
}
