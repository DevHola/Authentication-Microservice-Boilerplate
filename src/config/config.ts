import nodemailer from 'nodemailer'
import { type Request, type Response, type NextFunction } from 'express'
import jwt, { type JwtPayload } from 'jsonwebtoken'

export const reusableMail = async (subject: string, content: string, to: string, from: string): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '364d1386674e15',
        pass: 'a472a01d707e65'
      }
    })
    await transporter.sendMail({
      from,
      to,
      subject,
      html: content
    })
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`mailing failed - ${error.message}`)
    }
  }
}

export interface CustomRequest extends Request {
  user: JwtPayload | null
}

export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const headers = req.headers.authorization
  if (headers != null && process.env.AUTH_ACCESS_TOKEN_SECRET != null) {
    const [header, token] = headers.split(' ')
    if (header !== 'Bearer' || (token.length === 0)) {
      res.status(401).json({ message: 'Invalid Access Token' })
    }
    try {
      const decoded = jwt.verify(token, process.env.AUTH_ACCESS_TOKEN_SECRET) as JwtPayload
      (req as CustomRequest).user = decoded
      next()
    } catch (error) {
      next(error)
    }
  } else {
    throw new Error('Missing Access Credentials')
  }
}
