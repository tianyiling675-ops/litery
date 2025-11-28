import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { body, query, validationResult } from 'express-validator'
import { 
  authenticateToken, 
  tenantIsolation,
  AuthRequest 
} from '../middleware/auth.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import crypto from 'crypto'

// 扩展AuthRequest类型以支持Multer文件上传
interface AuthRequestWithFile extends AuthRequest {
  file?: Express.Multer.File
}

const router = Router()
const prisma = new PrismaClient()

// 配置文件上传
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = 'uploads/files/'
    await fs.mkdir(uploadPath, { recursive: true })
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${ext}`)
  }
})

const upload = multer({ 
  storage,
  limits: { 
    fileSize: parseInt(process.env.FILE_UPLOAD_MAX_SIZE || '104857600') // 100MB
  },
  fileFilter: (req, file, cb) => {
    // 允许所有文件类型，可以在前端进行限制
    cb(null, true)
  }
})

// 上传文件
router.post('/upload', [
  authenticateToken,
  upload.single('file')
], async (req: AuthRequestWithFile, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '未选择文件'
      })
    }

    const userId = req.user!.id
    const tenantId = req.user!.tenantId

    // 计算文件校验和
    const fileBuffer = await fs.readFile(req.file.path)
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex')

    // 创建文件记录
    const file = await prisma.file.create({
      data: {
        userId,
        tenantId,
        originalName: req.file.originalname,
        fileName: req.file.filename,
        fileType: path.extname(req.file.originalname).toLowerCase(),
        fileSize: req.file.size,
        filePath: req.file.path,
        storageType: 'LOCAL',
        mimeType: req.file.mimetype,
        checksum,
        metadata: {
          originalPath: req.file.path,
          uploadIp: req.ip,
          userAgent: req.get('User-Agent')
        }
      },
      select: {
        id: true,
        originalName: true,
        fileType: true,
        fileSize: true,
        mimeType: true,
        createdAt: true
      }
    })

    res.json({
      success: true,
      message: '文件上传成功',
      data: file
    })
  } catch (error) {
    console.error('文件上传失败:', error)
    
    // 清理上传失败的文件
    if (req.file) {
      try {
        await fs.unlink(req.file.path)
      } catch (unlinkError) {
        console.error('清理失败文件出错:', unlinkError)
      }
    }

    res.status(500).json({
      success: false,
      message: '文件上传失败'
    })
  }
})

// 获取文件列表
router.get('/', [
  authenticateToken,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('fileType').optional().isString()
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
      fileType
    } = req.query

    const skip = (Number(page) - 1) * Number(limit)
    const userId = req.user!.id
    const tenantId = req.user!.tenantId

    // 构建查询条件
    const where: any = {
      userId,
      tenantId
    }

    if (fileType) {
      where.fileType = fileType
    }

    // 获取文件列表
    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          originalName: true,
          fileType: true,
          fileSize: true,
          mimeType: true,
          isPublic: true,
          downloadCount: true,
          createdAt: true,
          expiresAt: true
        }
      }),
      prisma.file.count({ where })
    ])

    res.json({
      success: true,
      data: {
        files,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    })
  } catch (error) {
    console.error('获取文件列表失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 获取文件详情
router.get('/:id', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const tenantId = req.user!.tenantId

    const file = await prisma.file.findFirst({
      where: {
        id,
        userId,
        tenantId
      },
      select: {
        id: true,
        originalName: true,
        fileType: true,
        fileSize: true,
        mimeType: true,
        isPublic: true,
        downloadCount: true,
        checksum: true,
        metadata: true,
        createdAt: true,
        expiresAt: true
      }
    })

    if (!file) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      })
    }

    res.json({
      success: true,
      data: file
    })
  } catch (error) {
    console.error('获取文件详情失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 下载文件
router.get('/:id/download', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const tenantId = req.user!.tenantId

    const file = await prisma.file.findFirst({
      where: {
        id,
        userId,
        tenantId
      }
    })

    if (!file) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      })
    }

    // 检查文件是否过期
    if (file.expiresAt && new Date() > file.expiresAt) {
      return res.status(410).json({
        success: false,
        message: '文件已过期'
      })
    }

    // 检查文件是否存在
    try {
      await fs.access(file.filePath)
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: '文件不存在或已被删除'
      })
    }

    // 更新下载次数
    await prisma.file.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    })

    // 设置下载头
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`)
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream')
    res.setHeader('Content-Length', file.fileSize.toString())

    // 发送文件
    res.sendFile(path.resolve(file.filePath))
  } catch (error) {
    console.error('文件下载失败:', error)
    res.status(500).json({
      success: false,
      message: '文件下载失败'
    })
  }
})

// 删除文件
router.delete('/:id', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const tenantId = req.user!.tenantId

    const file = await prisma.file.findFirst({
      where: {
        id,
        userId,
        tenantId
      }
    })

    if (!file) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      })
    }

    // 检查文件是否被任务使用
    const isUsedInTask = await prisma.resultFile.findFirst({
      where: { fileId: id }
    })

    if (isUsedInTask) {
      return res.status(400).json({
        success: false,
        message: '文件正在被任务使用，无法删除'
      })
    }

    // 删除物理文件
    try {
      await fs.unlink(file.filePath)
    } catch (unlinkError) {
      console.error('删除物理文件失败:', unlinkError)
    }

    // 删除数据库记录
    await prisma.file.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '文件删除成功'
    })
  } catch (error) {
    console.error('文件删除失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 批量删除文件
router.delete('/batch/delete', [
  authenticateToken,
  body('fileIds').isArray().withMessage('fileIds必须是数组'),
  body('fileIds.*').isString().withMessage('fileId必须是字符串')
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

    const { fileIds } = req.body
    const userId = req.user!.id
    const tenantId = req.user!.tenantId

    // 验证文件所有权
    const files = await prisma.file.findMany({
      where: {
        id: { in: fileIds },
        userId,
        tenantId
      }
    })

    if (files.length !== fileIds.length) {
      return res.status(403).json({
        success: false,
        message: '部分文件无权删除'
      })
    }

    // 检查文件是否被使用
    const usedFiles = await prisma.resultFile.findMany({
      where: { fileId: { in: fileIds } }
    })

    if (usedFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: '部分文件正在被使用，无法删除'
      })
    }

    // 删除物理文件
    for (const file of files) {
      try {
        await fs.unlink(file.filePath)
      } catch (unlinkError) {
        console.error(`删除文件 ${file.id} 失败:`, unlinkError)
      }
    }

    // 批量删除数据库记录
    const deletedCount = await prisma.file.deleteMany({
      where: {
        id: { in: fileIds }
      }
    })

    res.json({
      success: true,
      message: `成功删除 ${deletedCount.count} 个文件`,
      data: {
        deletedCount: deletedCount.count
      }
    })
  } catch (error) {
    console.error('批量删除文件失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 生成文件分享链接
router.post('/:id/share', [
  authenticateToken,
  body('expiresIn').optional().isInt({ min: 1, max: 365 })
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
    const { expiresIn = 7 } = req.body // 默认7天
    const userId = req.user!.id
    const tenantId = req.user!.tenantId

    const file = await prisma.file.findFirst({
      where: {
        id,
        userId,
        tenantId
      }
    })

    if (!file) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      })
    }

    // 生成分享token
    const shareToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)

    // 更新文件记录
    const existingMetadata = file.metadata || {}
    const metadataData = typeof existingMetadata === 'object' && existingMetadata !== null
      ? { ...existingMetadata, shareToken, sharedBy: userId, sharedAt: new Date(), expiresIn }
      : { shareToken, sharedBy: userId, sharedAt: new Date(), expiresIn }

    const updatedFile = await prisma.file.update({
      where: { id },
      data: {
        metadata: metadataData
      }
    })

    // 生成分享链接
    const shareUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/files/${id}/shared/${shareToken}`

    res.json({
      success: true,
      message: '分享链接生成成功',
      data: {
        shareUrl,
        expiresAt,
        expiresInDays: expiresIn
      }
    })
  } catch (error) {
    console.error('生成分享链接失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 通过分享链接下载文件（无需认证）
router.get('/:id/shared/:token', async (req, res) => {
  try {
    const { id, token } = req.params

    const file = await prisma.file.findUnique({
      where: { id }
    })

    if (!file) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      })
    }

    // 验证分享token
    const metadata = file.metadata as any
    if (!metadata.shareToken || metadata.shareToken !== token) {
      return res.status(403).json({
        success: false,
        message: '分享链接无效'
      })
    }

    // 检查分享链接是否过期
    if (file.expiresAt && new Date() > file.expiresAt) {
      return res.status(410).json({
        success: false,
        message: '分享链接已过期'
      })
    }

    // 检查文件是否存在
    try {
      await fs.access(file.filePath)
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: '文件不存在或已被删除'
      })
    }

    // 更新下载次数
    await prisma.file.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    })

    // 设置下载头
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`)
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream')
    res.setHeader('Content-Length', file.fileSize.toString())

    // 发送文件
    res.sendFile(path.resolve(file.filePath))
  } catch (error) {
    console.error('分享文件下载失败:', error)
    res.status(500).json({
      success: false,
      message: '文件下载失败'
    })
  }
})

export default router