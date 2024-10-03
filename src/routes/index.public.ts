/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { Register, Login, ForgetPassword, refreshAccessToken, resetPassword, verifyUser } from '../controllers/user'
import { registerValidation, loginValidation, forgetValidation, resetPasswordValidation, refreshAccessTokenValidation, userVerifyTokenValidation } from '../middleware/user.validation'
const publicrouter = Router()

publicrouter.post('/register', registerValidation, Register)
publicrouter.post('/login', loginValidation, Login)
publicrouter.post('/forget', forgetValidation, ForgetPassword)
publicrouter.post('/password/reset', resetPasswordValidation, resetPassword)
publicrouter.post('/refresh', refreshAccessTokenValidation, refreshAccessToken)
publicrouter.post('/verification', userVerifyTokenValidation, verifyUser)
export default publicrouter
