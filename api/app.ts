import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { PrismaClient } from '@prisma/client'

// 导入路由
import authRoutes from './routes/auth.js'
import algorithmRoutes from './routes/algorithms.js'
import taskRoutes from './routes/tasks.js'
import fileRoutes from './routes/files.js'
import adminRoutes from './routes/admin.js'

const app = express()
const prisma = new PrismaClient()

// 基础中间件
app.use(helmet())
app.use(compression())
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}))

// 日志记录
app.use(morgan('combined'))

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 限制每个IP 15分钟内最多1000次请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// Swagger API文档配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SaaS智能算法平台 API',
      version: '1.0.0',
      description: 'SaaS智能算法平台的RESTful API文档',
      contact: {
        name: '技术支持',
        email: 'support@algorithm-platform.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000/api',
        description: '开发服务器'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      }
    }
  },
  apis: ['./api/routes/*.ts', './api/routes/*.js']
}

const swaggerSpec = swaggerJSDoc(swaggerOptions)

// API文档路由
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API路由
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/algorithms', algorithmRoutes)
app.use('/api/v1/tasks', taskRoutes)
app.use('/api/v1/files', fileRoutes)
app.use('/api/v1/admin', adminRoutes)

// 全局错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('全局错误处理:', err)

  // 文件上传错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: '文件大小超出限制'
    })
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(413).json({
      success: false,
      message: '文件数量超出限制'
    })
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: '意外的文件字段'
    })
  }

  // 数据库错误
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: '数据已存在'
    })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: '记录不存在'
    })
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '无效的访问令牌'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: '访问令牌已过期'
    })
  }

  // 默认错误响应
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : err.message || '未知错误',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  })
})

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的接口不存在'
  })
})

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('收到SIGTERM信号，开始优雅关闭...')
  
  // 关闭数据库连接
  await prisma.$disconnect()
  
  // 关闭HTTP服务器
  server.close(() => {
    console.log('服务器已关闭')
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('收到SIGINT信号，开始优雅关闭...')
  
  // 关闭数据库连接
  await prisma.$disconnect()
  
  // 关闭HTTP服务器
  server.close(() => {
    console.log('服务器已关闭')
    process.exit(0)
  })
})

const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`)
  console.log(`📚 API文档: http://localhost:${PORT}/api-docs`)
  console.log(`🔍 健康检查: http://localhost:${PORT}/health`)
})

export default app
