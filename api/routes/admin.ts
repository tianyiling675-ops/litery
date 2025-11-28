import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { body, query, validationResult } from 'express-validator'
import { 
  authenticateToken, 
  requireRole,
  tenantIsolation,
  AuthRequest 
} from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// 获取用户列表（管理员功能）
router.get('/users', [
  authenticateToken,
  requireRole(['ADMIN']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['USER', 'PREMIUM', 'ENTERPRISE', 'ADMIN']),
  query('search').optional().isString()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入参数验证失败',
        errors: errors.array()
      })
    }

    const {
      page = 1,
      limit = 20,
      role,
      search
    } = req.query

    const skip = (Number(page) - 1) * Number(limit)
    const tenantId = req.user!.tenantId

    // 构建查询条件
    const where: any = {
      tenantId
    }

    if (role) {
      where.role = role
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    // 获取用户列表
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatarUrl: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: {
              algorithms: true,
              tasks: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 更新用户状态（管理员功能）
router.put('/users/:id/status', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('isActive').isBoolean()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入参数验证失败',
        errors: errors.array()
      })
    }

    const { id } = req.params
    const { isActive } = req.body
    const tenantId = req.user!.tenantId

    // 验证用户是否存在且属于当前租户
    const user = await prisma.user.findFirst({
      where: {
        id,
        tenantId
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    // 不能禁用自己
    if (id === req.user!.id) {
      return res.status(400).json({
        success: false,
        message: '不能修改自己的状态'
      })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    })

    res.json({
      success: true,
      message: '用户状态更新成功',
      data: updatedUser
    })
  } catch (error) {
    console.error('更新用户状态失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 获取算法列表（管理员功能）
router.get('/algorithms', [
  authenticateToken,
  requireRole(['ADMIN']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']),
  query('userId').optional().isString(),
  query('search').optional().isString()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入参数验证失败',
        errors: errors.array()
      })
    }

    const {
      page = 1,
      limit = 20,
      status,
      userId,
      search
    } = req.query

    const skip = (Number(page) - 1) * Number(limit)
    const tenantId = req.user!.tenantId

    // 构建查询条件
    const where: any = {
      tenantId
    }

    if (status) {
      where.status = status
    }

    if (userId) {
      where.userId = userId
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    // 获取算法列表
    const [algorithms, total] = await Promise.all([
      prisma.algorithm.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          _count: {
            select: {
              tasks: true,
              reviews: true
            }
          }
        }
      }),
      prisma.algorithm.count({ where })
    ])

    res.json({
      success: true,
      data: {
        algorithms,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    })
  } catch (error) {
    console.error('获取算法列表失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 审核算法（管理员功能）
router.put('/algorithms/:id/approve', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('status').isIn(['APPROVED', 'REJECTED']),
  body('reason').optional().isString().isLength({ max: 500 })
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入参数验证失败',
        errors: errors.array()
      })
    }

    const { id } = req.params
    const { status, reason } = req.body
    const tenantId = req.user!.tenantId

    // 验证算法是否存在且属于当前租户
    const algorithm = await prisma.algorithm.findFirst({
      where: {
        id,
        tenantId
      }
    })

    if (!algorithm) {
      return res.status(404).json({
        success: false,
        message: '算法不存在'
      })
    }

    // 更新算法状态
    const updatedAlgorithm = await prisma.algorithm.update({
      where: { id },
      data: {
        status,
        publishedAt: status === 'APPROVED' ? new Date() : null
      },
      select: {
        id: true,
        name: true,
        status: true,
        publishedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    // TODO: 发送通知邮件给用户

    res.json({
      success: true,
      message: `算法已${status === 'APPROVED' ? '通过' : '拒绝'}审核`,
      data: updatedAlgorithm
    })
  } catch (error) {
    console.error('审核算法失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 获取系统统计信息（管理员功能）
router.get('/stats', [
  authenticateToken,
  requireRole(['ADMIN'])
], async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId

    // 获取系统统计信息
    const [
      totalUsers,
      totalAlgorithms,
      totalTasks,
      totalFiles,
      recentUsers,
      recentTasks,
      algorithmStats,
      taskStats
    ] = await Promise.all([
      // 总用户数
      prisma.user.count({ where: { tenantId } }),
      
      // 总算法数
      prisma.algorithm.count({ where: { tenantId } }),
      
      // 总任务数
      prisma.task.count({ where: { tenantId } }),
      
      // 总文件数
      prisma.file.count({ where: { tenantId } }),
      
      // 最近注册用户
      prisma.user.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      }),
      
      // 最近任务
      prisma.task.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          algorithm: {
            select: {
              id: true,
              name: true,
              category: true
            }
          }
        }
      }),
      
      // 算法分类统计
      prisma.algorithm.groupBy({
        by: ['category'],
        where: { tenantId, status: 'APPROVED' },
        _count: {
          id: true
        }
      }),
      
      // 任务状态统计
      prisma.task.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: {
          id: true
        }
      })
    ])

    // 计算今日新增用户
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayUsers = await prisma.user.count({
      where: {
        tenantId,
        createdAt: {
          gte: today
        }
      }
    })

    // 计算今日新增任务
    const todayTasks = await prisma.task.count({
      where: {
        tenantId,
        createdAt: {
          gte: today
        }
      }
    })

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalAlgorithms,
          totalTasks,
          totalFiles,
          todayUsers,
          todayTasks
        },
        recentUsers,
        recentTasks,
        algorithmStats,
        taskStats
      }
    })
  } catch (error) {
    console.error('获取系统统计信息失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 获取系统配置
router.get('/configs', [
  authenticateToken,
  requireRole(['ADMIN'])
], async (req: AuthRequest, res) => {
  try {
    const configs = await prisma.$queryRaw`
      SELECT key, value, category, description, is_encrypted, created_at, updated_at
      FROM system_configs
      ORDER BY category, key
    `

    res.json({
      success: true,
      data: configs
    })
  } catch (error) {
    console.error('获取系统配置失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 更新系统配置
router.put('/configs/:key', [
  authenticateToken,
  requireRole(['ADMIN']),
  body('value').isString(),
  body('description').optional().isString()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入参数验证失败',
        errors: errors.array()
      })
    }

    const { key } = req.params
    const { value, description } = req.body

    // 这里应该使用系统配置表，暂时使用原始查询
    await prisma.$executeRaw`
      INSERT INTO system_configs (key, value, category, description)
      VALUES (${key}, ${value}, 'admin', ${description || ''})
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        description = EXCLUDED.description,
        updated_at = NOW()
    `

    res.json({
      success: true,
      message: '系统配置更新成功'
    })
  } catch (error) {
    console.error('更新系统配置失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

export default router