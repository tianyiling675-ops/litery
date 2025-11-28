import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { body, query, validationResult } from 'express-validator'
import { 
  authenticateToken, 
  requireRole, 
  tenantIsolation,
  AuthRequest 
} from '../middleware/auth.js'
import multer from 'multer'
import path from 'path'

// 扩展AuthRequest类型以支持Multer文件上传
interface AuthRequestWithFile extends AuthRequest {
  file?: Express.Multer.File
}

const router = Router()
const prisma = new PrismaClient()

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/algorithms/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`)
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.py', '.js', '.ts', '.json', '.yaml', '.yml', '.txt', '.md']
    const ext = path.extname(file.originalname).toLowerCase()
    
    if (allowedTypes.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件类型') as any, false)
    }
  }
})

// 获取算法列表
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('sort').optional().isIn(['price', 'rating', 'createdAt', 'downloadCount']),
  query('order').optional().isIn(['asc', 'desc'])
], authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
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
      category,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query

    const skip = (Number(page) - 1) * Number(limit)
    const tenantId = req.user!.tenantId

    // 构建查询条件
    const where: any = {
      tenantId,
      status: 'APPROVED',
      visibility: 'PUBLIC'
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { tags: { hasSome: [search as string] } }
      ]
    }

    // 获取算法列表
    const [algorithms, total] = await Promise.all([
      prisma.algorithm.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sort as string]: order },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          subcategory: true,
          price: true,
          currency: true,
          tags: true,
          downloadCount: true,
          rating: true,
          reviewCount: true,
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          },
          createdAt: true,
          updatedAt: true
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

// 获取算法详情
router.get('/:id', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const tenantId = req.user!.tenantId

    const algorithm = await prisma.algorithm.findFirst({
      where: {
        id,
        tenantId,
        OR: [
          { visibility: 'PUBLIC' },
          { userId: req.user!.id }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        subcategory: true,
        parameters: true,
        price: true,
        currency: true,
        tags: true,
        downloadCount: true,
        rating: true,
        reviewCount: true,
        version: true,
        requirements: true,
        documentationUrl: true,
        demoDataUrl: true,
        status: true,
        visibility: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            isVerified: true,
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            },
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        createdAt: true,
        updatedAt: true
      }
    })

    if (!algorithm) {
      return res.status(404).json({
        success: false,
        message: '算法不存在'
      })
    }

    res.json({
      success: true,
      data: algorithm
    })
  } catch (error) {
    console.error('获取算法详情失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 创建算法
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 200 }),
  body('description').trim().isLength({ min: 10, max: 2000 }),
  body('category').isString().isLength({ min: 1, max: 50 }),
  body('price').isFloat({ min: 0 }),
  body('parameters').optional().isObject(),
  body('tags').optional().isArray()
], authenticateToken, requireRole(['PREMIUM', 'ENTERPRISE', 'ADMIN']), async (req: AuthRequest, res) => {
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
      name,
      description,
      category,
      subcategory,
      parameters = {},
      price,
      tags = [],
      requirements = {},
      visibility = 'PRIVATE'
    } = req.body

    const algorithm = await prisma.algorithm.create({
      data: {
        name,
        description,
        category,
        subcategory,
        parameters,
        price: Number(price),
        tags,
        requirements,
        visibility,
        userId: req.user!.id,
        tenantId: req.user!.tenantId,
        status: 'DRAFT'
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        status: true,
        visibility: true,
        createdAt: true
      }
    })

    res.status(201).json({
      success: true,
      message: '算法创建成功',
      data: algorithm
    })
  } catch (error) {
    console.error('创建算法失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 上传算法文件
router.post('/:id/upload', authenticateToken, requireRole(['PREMIUM', 'ENTERPRISE', 'ADMIN']), upload.single('file'), async (req: AuthRequestWithFile, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '未上传文件'
      })
    }

    // 验证算法所有权
    const algorithm = await prisma.algorithm.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!algorithm) {
      return res.status(404).json({
        success: false,
        message: '算法不存在或无权限'
      })
    }

    // 更新算法文件路径
    const updatedAlgorithm = await prisma.algorithm.update({
      where: { id },
      data: {
        codeFilePath: req.file.path
      }
    })

    res.json({
      success: true,
      message: '文件上传成功',
      data: {
        filePath: req.file.path,
        fileName: req.file.filename,
        fileSize: req.file.size
      }
    })
  } catch (error) {
    console.error('上传算法文件失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 更新算法
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }),
  body('price').optional().isFloat({ min: 0 }),
  body('parameters').optional().isObject(),
  body('tags').optional().isArray()
], authenticateToken, requireRole(['PREMIUM', 'ENTERPRISE', 'ADMIN']), async (req: AuthRequest, res) => {
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
    const userId = req.user!.id

    // 验证算法所有权
    const existingAlgorithm = await prisma.algorithm.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existingAlgorithm) {
      return res.status(404).json({
        success: false,
        message: '算法不存在或无权限'
      })
    }

    const {
      name,
      description,
      category,
      subcategory,
      parameters,
      price,
      tags,
      requirements,
      visibility
    } = req.body

    const updatedAlgorithm = await prisma.algorithm.update({
      where: { id },
      data: {
        name,
        description,
        category,
        subcategory,
        parameters,
        price: price ? Number(price) : undefined,
        tags,
        requirements,
        visibility
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        status: true,
        visibility: true,
        updatedAt: true
      }
    })

    res.json({
      success: true,
      message: '算法更新成功',
      data: updatedAlgorithm
    })
  } catch (error) {
    console.error('更新算法失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 删除算法
router.delete('/:id', authenticateToken, requireRole(['PREMIUM', 'ENTERPRISE', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    // 验证算法所有权
    const algorithm = await prisma.algorithm.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!algorithm) {
      return res.status(404).json({
        success: false,
        message: '算法不存在或无权限'
      })
    }

    // 检查是否有相关任务
    const taskCount = await prisma.task.count({
      where: { algorithmId: id }
    })

    if (taskCount > 0) {
      return res.status(400).json({
        success: false,
        message: '该算法已有相关任务，无法删除'
      })
    }

    await prisma.algorithm.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '算法删除成功'
    })
  } catch (error) {
    console.error('删除算法失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 获取算法分类
router.get('/categories/list', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const categories = await prisma.$queryRaw`
      SELECT 
        category,
        COUNT(*) as count
      FROM algorithms 
      WHERE tenant_id = ${req.user!.tenantId} 
        AND status = 'APPROVED' 
        AND visibility = 'PUBLIC'
      GROUP BY category
      ORDER BY count DESC
    `

    res.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('获取算法分类失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 获取热门算法
router.get('/popular/list', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
  try {
    const { limit = 10 } = req.query
    const tenantId = req.user!.tenantId

    const algorithms = await prisma.algorithm.findMany({
      where: {
        tenantId,
        status: 'APPROVED',
        visibility: 'PUBLIC'
      },
      orderBy: [
        { downloadCount: 'desc' },
        { rating: 'desc' }
      ],
      take: Number(limit),
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        currency: true,
        tags: true,
        downloadCount: true,
        rating: true,
        reviewCount: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        createdAt: true
      }
    })

    res.json({
      success: true,
      data: algorithms
    })
  } catch (error) {
    console.error('获取热门算法失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 获取推荐算法
router.get('/recommendations/list', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
  try {
    const { limit = 10 } = req.query
    const userId = req.user!.id
    const tenantId = req.user!.tenantId

    // 获取用户历史任务记录
    const userTasks = await prisma.task.findMany({
      where: { userId },
      select: { algorithmId: true },
      distinct: ['algorithmId']
    })

    const usedAlgorithmIds = userTasks.map(task => task.algorithmId)

    // 基于用户历史行为推荐相似算法
    let recommendations = await prisma.algorithm.findMany({
      where: {
        tenantId,
        status: 'APPROVED',
        visibility: 'PUBLIC',
        NOT: {
          id: { in: usedAlgorithmIds }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { downloadCount: 'desc' }
      ],
      take: Number(limit),
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        currency: true,
        tags: true,
        downloadCount: true,
        rating: true,
        reviewCount: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        createdAt: true
      }
    })

    // 如果推荐数量不足，补充最新算法
    if (recommendations.length < Number(limit)) {
      const additionalAlgorithms = await prisma.algorithm.findMany({
        where: {
          tenantId,
          status: 'APPROVED',
          visibility: 'PUBLIC',
          NOT: {
            id: { in: [...usedAlgorithmIds, ...recommendations.map(a => a.id)] }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit) - recommendations.length,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          price: true,
          currency: true,
          tags: true,
          downloadCount: true,
          rating: true,
          reviewCount: true,
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          },
          createdAt: true
        }
      })
      recommendations = [...recommendations, ...additionalAlgorithms]
    }

    res.json({
      success: true,
      data: recommendations
    })
  } catch (error) {
    console.error('获取推荐算法失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

export default router