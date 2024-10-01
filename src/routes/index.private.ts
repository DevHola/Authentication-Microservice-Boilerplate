/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import passport from 'passport'
import { logout, tokenverify } from '../controllers/user'
import { authuservalidation } from '../validations/user.validation'
const router = Router()
router.post('/token', passport.authenticate('jwt', { session: false }), authuservalidation, tokenverify)
router.post('/logout', passport.authenticate('jwt', { session: false }), authuservalidation, logout)

export default router
