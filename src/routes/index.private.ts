/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import passport from 'passport'
import { logout, tokenverify } from '../controllers/user'
const router = Router()
router.post('/token', passport.authenticate('jwt', { session: false }), tokenverify)
router.post('/logout', passport.authenticate('jwt', { session: false }), logout)

export default router
