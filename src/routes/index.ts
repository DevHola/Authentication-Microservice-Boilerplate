/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { userTypeCreation, getUType, AllUserType, deleteUType, userTypeUpdate } from '../controllers/usertype'
import { Register, Login, ForgetPassword, verifyUser, resetPassword, logout, Masterlogout } from '../controllers/user'
import { verifyAccessToken } from '../config/jwt'
import { registerValidation, loginValidation, forgetValidation, resetPasswordValidation } from '../validations/user.validation'
const router = Router()
router.post('/usertype', userTypeCreation)
router.get('/usertype/:id', getUType)
router.get('/usertypes', AllUserType)
router.delete('/usertype', deleteUType)
router.put('/usertype/:id', userTypeUpdate)
router.post('/register', registerValidation, Register)
router.post('/login', loginValidation, Login)
router.post('/forget', forgetValidation, ForgetPassword)
router.post('/verification', verifyAccessToken, verifyUser)
router.post('/password/reset', resetPasswordValidation, verifyAccessToken, resetPassword)
router.post('/logout', verifyAccessToken, logout)
router.post('/logout/master', verifyAccessToken, Masterlogout)

export default router
