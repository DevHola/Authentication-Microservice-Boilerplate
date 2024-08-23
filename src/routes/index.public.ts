/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { Register, Login, ForgetPassword, refreshAccessToken, resetPassword, verifyUser } from '../controllers/user'
import { registerValidation, loginValidation, forgetValidation } from '../validations/user.validation'
const publicrouter = Router()

publicrouter.post('/register', registerValidation, Register)
publicrouter.post('/login', loginValidation, Login)
publicrouter.post('/forget', forgetValidation, ForgetPassword)
publicrouter.post('/password/reset', resetPassword)
publicrouter.post('/refresh', refreshAccessToken)
publicrouter.post('/verification', verifyUser)
export default publicrouter
