import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { config } from '../config'

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.refreshToken) {
    token = req.cookies.refreshToken
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }
  
  try {
    const decoded: any = jwt.verify(token, config.jwtSecret)
    req.user = await User.findById(decoded.id).select('-password -refreshToken')
    next()
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' })
  }
}

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route`
      })
    }
    next()
  }
}
