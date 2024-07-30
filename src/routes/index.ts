/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { userTypeCreation, getUType, AllUserType, deleteUType, userTypeUpdate } from '../controllers/usertype'
import { Register, Login } from '../controllers/user'
const router = Router()
router.post('/usertype', userTypeCreation)
router.get('/usertype/:id', getUType)
router.get('/usertypes', AllUserType)
router.delete('/usertype', deleteUType)
router.put('/usertype/:id', userTypeUpdate)
router.post('/register', Register)
router.post('/login', Login)
export default router
