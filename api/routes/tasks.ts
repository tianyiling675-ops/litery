import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { body, query, validationResult } from 'express-validator'
import { 
  authenticateToken, 
  tenantIsolation,
  AuthRequest 
} from '../middleware/auth.js'
import Docker from 'dockerode'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs/promises'

const router = Router()
const prisma = new PrismaClient()
const docker = new Docker()

// 任务状态定义
const TaskStatus = {
  PENDING: 'PENDING',
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
} as const

// 获取任务列表
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(Object.values(TaskStatus)),
  query('algorithmId').optional().isString()
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
      status,
      algorithmId
    } = req.query

    const skip = (Number(page) - 1) * Number(limit)
    const userId = req.user!.id
    const tenantId = req.user!.tenantId

    // 构建查询条件
    const where: any = {
      userId,
      tenantId
    }

    if (status) {
      where.status = status
    }

    if (algorithmId) {
      where.algorithmId = algorithmId
    }

    // 获取任务列表
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          algorithm: {
            select: {
              id: true,
              name: true,
              category: true,
              price: true
            }
          }
        }
      }),
      prisma.task.count({ where })
    ])

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    })
  } catch (error) {
    console.error('获取任务列表失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 获取任务详情
router.get('/:id', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const tenantId = req.user!.tenantId

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId,
        tenantId
      },
      include: {
        algorithm: {
          select: {
            id: true,
            name: true,
            category: true,
            version: true,
            requirements: true
          }
        },
        taskLogs: {
          orderBy: { createdAt: 'asc' },
          select: {
            logLevel: true,
            message: true,
            context: true,
            createdAt: true
          }
        },
        resultFiles: {
          include: {
            file: {
              select: {
                id: true,
                originalName: true,
                fileType: true,
                fileSize: true,
                createdAt: true
              }
            }
          }
        }
      }
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      })
    }

    res.json({
      success: true,
      data: task
    })
  } catch (error) {
    console.error('获取任务详情失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 创建任务
router.post('/', [
  body('algorithmId').isString(),
  body('name').trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('parameters').optional().isObject(),
  body('inputFiles').optional().isArray(),
  body('priority').optional().isInt({ min: 1, max: 10 }),
  body('scheduleConfig').optional().isObject()
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
      algorithmId,
      name,
      description,
      parameters = {},
      inputFiles = [],
      priority = 5,
      scheduleConfig = {}
    } = req.body

    const userId = req.user!.id
    const tenantId = req.user!.tenantId

    // 验证算法是否存在且可用
    const algorithm = await prisma.algorithm.findFirst({
      where: {
        id: algorithmId,
        tenantId,
        status: 'APPROVED',
        OR: [
          { visibility: 'PUBLIC' },
          { userId }
        ]
      }
    })

    if (!algorithm) {
      return res.status(404).json({
        success: false,
        message: '算法不存在或不可用'
      })
    }

    // 验证用户权限（付费算法）
    if (Number(algorithm.price) > 0) {
      const hasPurchased = await prisma.orderItem.findFirst({
        where: {
          algorithmId,
          order: {
            userId,
            status: 'PAID'
          },
          expiresAt: {
            gt: new Date()
          }
        }
      })

      if (!hasPurchased) {
        return res.status(403).json({
          success: false,
          message: '您尚未购买此算法'
        })
      }
    }

    // 创建任务
    const task = await prisma.task.create({
      data: {
        algorithmId,
        userId,
        name,
        description,
        parameters,
        inputFiles,
        priority,
        scheduleConfig,
        tenantId,
        status: 'PENDING'
      },
      include: {
        algorithm: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    })

    // 记录任务创建日志
    await prisma.taskLog.create({
      data: {
        taskId: task.id,
        logLevel: 'INFO',
        message: '任务创建成功',
        context: {
          algorithmId,
          userId,
          parameters
        }
      }
    })

    // 异步执行任务
    process.nextTick(() => {
      executeTask(task.id)
    })

    res.status(201).json({
      success: true,
      message: '任务创建成功',
      data: task
    })
  } catch (error) {
    console.error('创建任务失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 取消任务
router.put('/:id/cancel', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const tenantId = req.user!.tenantId

    // 查找任务
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId,
        tenantId
      }
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      })
    }

    // 检查任务状态
    if (task.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: '任务已完成，无法取消'
      })
    }

    if (task.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: '任务已取消'
      })
    }

    // 更新任务状态
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        endTime: new Date()
      }
    })

    // 记录取消日志
    await prisma.taskLog.create({
      data: {
        taskId: id,
        logLevel: 'INFO',
        message: '任务已取消',
        context: {
          cancelledBy: userId,
          cancelledAt: new Date()
        }
      }
    })

    res.json({
      success: true,
      message: '任务取消成功',
      data: updatedTask
    })
  } catch (error) {
    console.error('取消任务失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 获取任务状态
router.get('/:id/status', authenticateToken, tenantIsolation, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const tenantId = req.user!.tenantId

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId,
        tenantId
      },
      select: {
        id: true,
        status: true,
        progress: true,
        startTime: true,
        endTime: true,
        estimatedDuration: true,
        actualDuration: true,
        resourceUsage: true,
        errorMessage: true,
        cost: true
      }
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: '任务不存在'
      })
    }

    res.json({
      success: true,
      data: task
    })
  } catch (error) {
    console.error('获取任务状态失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 任务执行函数
async function executeTask(taskId: string) {
  try {
    // 获取任务详情
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        algorithm: true,
        user: true
      }
    })

    if (!task) {
      console.error(`任务 ${taskId} 不存在`)
      return
    }

    // 检查任务状态
    if (task.status !== 'PENDING') {
      console.error(`任务 ${taskId} 状态不是PENDING`)
      return
    }

    console.log(`开始执行任务 ${taskId}`)

    // 更新任务状态为运行中
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'RUNNING',
        startTime: new Date(),
        progress: 0
      }
    })

    // 记录开始日志
    await prisma.taskLog.create({
      data: {
        taskId,
        logLevel: 'INFO',
        message: '任务开始执行',
        context: {
          algorithmId: task.algorithmId,
          parameters: task.parameters
        }
      }
    })

    try {
      // 创建Docker容器执行算法
      const container = await docker.createContainer({
        Image: 'python:3.9-slim',
        Cmd: ['python', '-c', `
import json
import time
import sys

# 模拟算法执行
print("算法执行开始")
for i in range(10):
    time.sleep(1)
    print(f"进度: {i+1}/10")

# 生成结果
result = {
    "status": "success",
    "accuracy": 0.95,
    "execution_time": 10,
    "output_files": ["result.json", "model.pkl"]
}

with open('/tmp/result.json', 'w') as f:
    json.dump(result, f)

print("算法执行完成")
        `],
        WorkingDir: '/tmp',
        HostConfig: {
          Memory: 512 * 1024 * 1024, // 512MB
          CpuShares: 512,
          AutoRemove: true
        }
      })

      // 启动容器
      await container.start()

      // 等待容器完成
      const stream = await container.attach({
        stream: true,
        stdout: true,
        stderr: true
      })

      // 处理容器输出
      stream.on('data', async (chunk) => {
        const output = chunk.toString()
        console.log(`任务 ${taskId} 输出:`, output)

        // 解析进度信息
        const progressMatch = output.match(/进度: (\d+)\/(\d+)/)
        if (progressMatch) {
          const current = parseInt(progressMatch[1])
          const total = parseInt(progressMatch[2])
          const progress = Math.round((current / total) * 100)

          await prisma.task.update({
            where: { id: taskId },
            data: { progress }
          })
        }

        // 记录执行日志
        await prisma.taskLog.create({
          data: {
            taskId,
            logLevel: 'INFO',
            message: output.trim(),
            context: {
              source: 'container'
            }
          }
        })
      })

      // 等待容器退出
      const result = await container.wait()
      const exitCode = result.StatusCode

      if (exitCode === 0) {
        // 任务成功完成
        const endTime = new Date()
        const actualDuration = Math.round((endTime.getTime() - task.startTime!.getTime()) / 1000)

        await prisma.task.update({
          where: { id: taskId },
          data: {
            status: 'COMPLETED',
            endTime,
            actualDuration,
            progress: 100
          }
        })

        // 记录完成日志
        await prisma.taskLog.create({
          data: {
            taskId,
            logLevel: 'INFO',
            message: '任务执行成功',
            context: {
              duration: actualDuration,
              exitCode
            }
          }
        })

        console.log(`任务 ${taskId} 执行成功`)
      } else {
        // 任务执行失败
        await prisma.task.update({
          where: { id: taskId },
          data: {
            status: 'FAILED',
            endTime: new Date(),
            errorMessage: `容器退出码: ${exitCode}`
          }
        })

        // 记录失败日志
        await prisma.taskLog.create({
          data: {
            taskId,
            logLevel: 'ERROR',
            message: '任务执行失败',
            context: {
              exitCode,
              error: '容器执行异常'
            }
          }
        })

        console.error(`任务 ${taskId} 执行失败，退出码: ${exitCode}`)
      }
    } catch (error) {
      console.error(`任务 ${taskId} 执行异常:`, error)

      // 更新任务状态为失败
      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'FAILED',
          endTime: new Date(),
          errorMessage: error instanceof Error ? error.message : '未知错误'
        }
      })

      // 记录错误日志
      await prisma.taskLog.create({
        data: {
          taskId,
          logLevel: 'ERROR',
          message: '任务执行异常',
          context: {
            error: error instanceof Error ? error.message : '未知错误',
            stack: error instanceof Error ? error.stack : undefined
          }
        }
      })
    }
  } catch (error) {
    console.error(`任务 ${taskId} 处理失败:`, error)
  }
}

// 任务队列管理
class TaskQueue {
  private queue: string[] = []
  private processing = false
  private maxConcurrent = 5
  private runningTasks = new Set<string>()

  add(taskId: string) {
    this.queue.push(taskId)
    this.process()
  }

  async process() {
    if (this.processing || this.runningTasks.size >= this.maxConcurrent) {
      return
    }

    this.processing = true

    while (this.queue.length > 0 && this.runningTasks.size < this.maxConcurrent) {
      const taskId = this.queue.shift()!
      this.runningTasks.add(taskId)

      // 异步执行任务
      executeTask(taskId).finally(() => {
        this.runningTasks.delete(taskId)
        this.processing = false
        this.process()
      })
    }
  }
}

const taskQueue = new TaskQueue()

export default router