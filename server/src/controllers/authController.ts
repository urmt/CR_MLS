import { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { config } from '../config'

// @desc    Authenticate user & get tokens
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user || !(await user.comparePassword(password))) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  user.refreshToken = refreshToken
  await user.save()

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    accessToken
  })
})

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken

  if (!refreshToken) {
    res.status(401)
    throw new Error('Refresh token is required')
  }

  const user = await User.findOne({ refreshToken })
  if (!user) {
    res.status(403)
    throw new Error('Invalid refresh token')
  }

  try {
    jwt.verify(refreshToken, config.jwtSecret)
    const accessToken = generateAccessToken(user)
    res.json({ accessToken })
  } catch (error) {
    res.status(403)
    throw new Error('Invalid refresh token')
  }
})

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user.id)
  if (user) {
    user.refreshToken = undefined
    await user.save()
  }
  
  res.clearCookie('refreshToken')
  res.status(204).end()
})

const generateAccessToken = (user: any) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: '15m' }
  )
}

const generateRefreshToken = (user: any) => {
  return jwt.sign(
    { id: user._id },
    config.jwtSecret,
    { expiresIn: '7d' }
  )
}
