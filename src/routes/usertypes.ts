/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import passport from 'passport'
import { AllUserType, userTypeCreation, getUType, deleteUType, userTypeUpdate } from '../controllers/usertype'
const utrouter = Router()
utrouter.post('/usertype', passport.authenticate('jwt', { session: false }), userTypeCreation)
utrouter.get('/usertype/:id', passport.authenticate('jwt', { session: false }), getUType)
utrouter.get('/usertypes', passport.authenticate('jwt', { session: false }), AllUserType)
utrouter.delete('/usertype', passport.authenticate('jwt', { session: false }), deleteUType)
utrouter.put('/usertype/:id', passport.authenticate('jwt', { session: false }), userTypeUpdate)
export default utrouter
