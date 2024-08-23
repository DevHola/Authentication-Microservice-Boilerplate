/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import passport from 'passport'
import { AllUserType, userTypeCreation, getUType, deleteUType, userTypeUpdate } from '../controllers/usertype'
import { tokenverify } from '../controllers/user'
// import { verifyUser, logout, Masterlogout, tokenverify, } from '../controllers/user'
// import { verifyAccessToken } from '../middleware/jwt'
// import { resetPasswordValidation } from '../validations/user.validation'
const router = Router()
router.post('/usertype', passport.authenticate('jwt', { session: false }), userTypeCreation)
router.get('/usertype/:id', passport.authenticate('jwt', { session: false }), getUType)
router.get('/usertypes', passport.authenticate('jwt', { session: false }), AllUserType)
router.delete('/usertype', passport.authenticate('jwt', { session: false }), deleteUType)
router.put('/usertype/:id', passport.authenticate('jwt', { session: false }), userTypeUpdate)
router.post('/token', passport.authenticate('jwt', { session: false }), tokenverify)
// router.post('/logout', passport.authenticate('jwt', { session: false }), logout)

export default router
