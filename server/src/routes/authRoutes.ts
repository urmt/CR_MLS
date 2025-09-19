import express from 'express'
import { login, refresh, logout } from '../controllers/authController'
import { validateLogin } from '../validators/authValidator'

const router = express.Router()

router.post('/login', validateLogin, login)
router.post('/refresh', refresh)
router.post('/logout', logout)

export default router
