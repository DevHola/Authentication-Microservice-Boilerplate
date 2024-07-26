/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { userTypeCreation } from '../controllers/usertype'
const router = Router()
router.post('/register', userTypeCreation)
export default router
