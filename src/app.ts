/* eslint-disable import/first */
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(__dirname, '.env') })
import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction
} from 'express'
import cors from 'cors'
import morgan from 'morgan'
import hemlet from 'helmet'
import cookieparser from 'cookie-parser'
import router from './routes/index.private'
import publicrouter from './routes/index.public'
import utrouter from './routes/usertypes'
import passport = require('passport')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// "express-validator": "^5.1.0",
import JWTStrategy from './middleware/passportjwt'

const app: Application = express()
app.use(cors())
app.use(cookieparser())
app.use(morgan('combined'))
app.use(hemlet())
app.use(passport.initialize())
passport.use(JWTStrategy)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    message: error.message
  })
})
app.use('/api/v1/auth/protected', router)
app.use('/api/v1/auth/types', utrouter)
app.use('/api/v1/auth/public', publicrouter)

export default app
