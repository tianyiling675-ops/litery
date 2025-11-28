import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    tenantId: string
  }
}

// JWT 工具函数
export const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      tenantId: user.tenantId 
    },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  )

  const refreshToken = jwt.sign(
    { userId: user.id, tenantId: user.tenantId },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

// 验证JWT中间件
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: '访问令牌缺失' 
    })
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: '访问令牌无效或已过期' 
      })
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId
    }

    next()
  })
}

// 刷新令牌
export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(401).json({ 
      success: false, 
      message: '刷新令牌缺失' 
    })
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || !user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: '用户不存在或已被禁用' 
      })
    }

    const tokens = generateTokens(user)
    
    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    })
  } catch (error) {
    res.status(403).json({ 
      success: false, 
      message: '刷新令牌无效' 
    })
  }
}

// 角色权限检查中间件
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: '用户未认证' 
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: '权限不足' 
      })
    }

    next()
  }
}

// 租户隔离中间件
export const tenantIsolation = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: '用户未认证' 
    })
  }

  // 为后续查询添加租户过滤
  req.query.tenantId = req.user.tenantId
  next()
}

// API密钥认证中间件
export const authenticateApiKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string

  if (!apiKey) {
    return res.status(401).json({ 
      success: false, 
      message: 'API密钥缺失' 
    })
  }

  try {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    })

    if (!keyRecord || !keyRecord.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'API密钥无效' 
      })
    }

    if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
      return res.status(401).json({ 
        success: false, 
        message: 'API密钥已过期' 
      })
    }

    // 更新最后使用时间
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() }
    })

    req.user = {
      id: keyRecord.user.id,
      email: keyRecord.user.email,
      role: keyRecord.user.role,
      tenantId: keyRecord.user.tenantId
    }

    next()
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'API密钥验证失败' 
    })
  }
}

// 速率限制中间件
export const rateLimit = (windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) => {
  const requests = new Map()

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next()
    }

    const now = Date.now()
    const userId = req.user.id
    const userRequests = requests.get(userId) || []

    // 清理过期请求
    const validRequests = userRequests.filter((time: number) => now - time < windowMs)

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({ 
        success: false, 
        message: '请求过于频繁，请稍后再试' 
      })
    }

    // 添加当前请求
    validRequests.push(now)
    requests.set(userId, validRequests)

    next()
  }
}

// 多因素认证验证
export const verifyTwoFactor = async (userId: string, token: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profile: true }
    })

    if (!user || !user.profile || typeof user.profile !== 'object' || !(user.profile as any).twoFactorSecret) {
      return false
    }

    // 这里应该集成实际的2FA验证库，如 speakeasy
    // const verified = speakeasy.totp.verify({
    //   secret: user.profile.twoFactorSecret,
    //   encoding: 'base32',
    //   token: token,
    //   window: 2
    // })

    // return verified
    return true // 临时返回true，实际使用时需要集成2FA库
  } catch (error) {
    return false
  }
}

// OAuth2.0 授权码生成
export const generateAuthorizationCode = (clientId: string, userId: string, redirectUri: string) => {
  const code = jwt.sign(
    { clientId, userId, redirectUri },
    process.env.JWT_SECRET!,
    { expiresIn: '10m' }
  )

  return code
}

// OAuth2.0 令牌生成
export const generateOAuthToken = (clientId: string, userId: string) => {
  const accessToken = jwt.sign(
    { clientId, userId, type: 'access' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  )

  const refreshToken = jwt.sign(
    { clientId, userId, type: 'refresh' },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  )

  return { accessToken, refreshToken }
}