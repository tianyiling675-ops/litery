import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { body, validationResult } from 'express-validator'
import { 
  generateTokens, 
  authenticateToken, 
  requireRole, 
  refreshAccessToken,
  generateAuthorizationCode,
  generateOAuthToken,
  AuthRequest
} from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// 用户注册
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('密码长度至少为8位'),
  body('name').trim().isLength({ min: 2, max: 50 }),
  body('role').optional().isIn(['USER', 'PREMIUM', 'ENTERPRISE'])
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入参数验证失败',
        errors: errors.array()
      })
    }

    const { email, password, name, role = 'USER', organizationId } = req.body

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '该邮箱已被注册'
      })
    }

    // 密码加密
    const passwordHash = await bcrypt.hash(password, 12)

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        tenantId: 'default', // 默认租户
        organizationId,
        profile: {
          phone: '',
          department: '',
          position: ''
        },
        usageStats: {
          algorithmsCreated: 0,
          tasksSubmitted: 0,
          storageUsed: 0,
          apiCalls: 0
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        createdAt: true
      }
    })

    // 生成令牌
    const tokens = generateTokens(user)

    res.status(201).json({
      success: true,
      message: '用户注册成功',
      data: {
        user,
        tokens
      }
    })
  } catch (error) {
    console.error('用户注册失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 用户登录
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入参数验证失败',
        errors: errors.array()
      })
    }

    const { email, password, rememberMe = false } = req.body

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      })
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      })
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // 生成令牌
    const tokens = generateTokens(user)

    // 设置刷新令牌的HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 30天或7天
    })

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
          tenantId: user.tenantId
        },
        accessToken: tokens.accessToken
      }
    })
  } catch (error) {
    console.error('用户登录失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 刷新访问令牌
router.post('/refresh', refreshAccessToken)

// 用户登出
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // 清除刷新令牌cookie
    res.clearCookie('refreshToken')
    
    res.json({
      success: true,
      message: '登出成功'
    })
  } catch (error) {
    console.error('用户登出失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 获取当前用户信息
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        profile: true,
        usageStats: true,
        createdAt: true,
        tenantId: true
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 更新用户信息
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().isMobilePhone('any'),
  body('department').optional().trim().isLength({ max: 100 }),
  body('position').optional().trim().isLength({ max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入参数验证失败',
        errors: errors.array()
      })
    }

    const { name, phone, department, position } = req.body

    // 获取现有用户资料
    const existingUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { profile: true }
    })
    
    const existingProfile = existingUser?.profile || {}
    const profileData = typeof existingProfile === 'object' && existingProfile !== null 
      ? { ...existingProfile, phone, department, position }
      : { phone, department, position }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        name,
        profile: profileData
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        profile: true,
        tenantId: true
      }
    })

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: updatedUser
    })
  } catch (error) {
    console.error('更新用户信息失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 修改密码
router.put('/password', authenticateToken, [
  body('currentPassword').isLength({ min: 1 }),
  body('newPassword').isLength({ min: 8 }).withMessage('新密码长度至少为8位')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入参数验证失败',
        errors: errors.array()
      })
    }

    const { currentPassword, newPassword } = req.body

    // 验证当前密码
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '当前密码错误'
      })
    }

    // 加密新密码
    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    // 更新密码
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { passwordHash: newPasswordHash }
    })

    res.json({
      success: true,
      message: '密码修改成功'
    })
  } catch (error) {
    console.error('修改密码失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// OAuth2.0 授权端点
router.get('/oauth/authorize', authenticateToken, async (req: any, res) => {
  try {
    const { client_id, redirect_uri, response_type, scope, state } = req.query

    if (!client_id || !redirect_uri || !response_type) {
      return res.status(400).json({
        success: false,
        message: '缺少必要的OAuth参数'
      })
    }

    if (response_type !== 'code') {
      return res.status(400).json({
        success: false,
        message: '不支持的响应类型'
      })
    }

    // 生成授权码
    const authorizationCode = generateAuthorizationCode(
      client_id,
      req.user.id,
      redirect_uri
    )

    // 重定向回客户端
    const redirectUrl = new URL(redirect_uri)
    redirectUrl.searchParams.set('code', authorizationCode)
    if (state) {
      redirectUrl.searchParams.set('state', state)
    }

    res.redirect(redirectUrl.toString())
  } catch (error) {
    console.error('OAuth授权失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// OAuth2.0 令牌端点
router.post('/oauth/token', async (req, res) => {
  try {
    const { grant_type, code, client_id, client_secret, redirect_uri } = req.body

    if (grant_type !== 'authorization_code') {
      return res.status(400).json({
        success: false,
        message: '不支持的授权类型'
      })
    }

    if (!code || !client_id || !client_secret || !redirect_uri) {
      return res.status(400).json({
        success: false,
        message: '缺少必要的OAuth参数'
      })
    }

    // 验证客户端密钥（这里应该查询数据库验证）
    if (client_secret !== process.env.OAUTH_CLIENT_SECRET) {
      return res.status(401).json({
        success: false,
        message: '客户端密钥无效'
      })
    }

    // 验证授权码
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(code, process.env.JWT_SECRET!) as any

    if (decoded.clientId !== client_id || decoded.redirectUri !== redirect_uri) {
      return res.status(401).json({
        success: false,
        message: '授权码无效'
      })
    }

    // 生成访问令牌
    const tokens = generateOAuthToken(client_id, decoded.userId)

    res.json({
      success: true,
      data: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_type: 'Bearer',
        expires_in: 3600
      }
    })
  } catch (error) {
    console.error('OAuth令牌生成失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

export default router
