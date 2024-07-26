import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import path from 'path'
import hemlet from 'helmet'
import router from './routes'
dotenv.config({ path: path.join(__dirname, '.env') })
const app = express()
app.use(cors())
app.use(morgan('combined'))
app.use(hemlet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    message: error.stack
  })
})
app.use('/api', router)
const port = process.env.PORTDEV

app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`)
})
