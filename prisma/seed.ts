import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 开始创建初始数据...')

  // 创建系统管理员用户
  const adminPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      name: '系统管理员',
      role: 'ADMIN',
      tenantId: 'default',
      profile: {
        phone: '+86-138-0000-0000',
        department: '技术部',
        position: '系统管理员'
      },
      usageStats: {
        algorithmsCreated: 0,
        tasksSubmitted: 0,
        storageUsed: 0,
        apiCalls: 0
      }
    }
  })

  // 创建演示用户
  const demoPassword = await bcrypt.hash('demo123', 10)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash: demoPassword,
      name: '演示用户',
      role: 'PREMIUM',
      tenantId: 'default',
      profile: {
        phone: '+86-138-0000-0001',
        department: '数据科学部',
        position: '高级数据科学家'
      },
      usageStats: {
        algorithmsCreated: 0,
        tasksSubmitted: 0,
        storageUsed: 0,
        apiCalls: 0
      }
    }
  })

  // 创建示例算法
  const sampleAlgorithms = [
    {
      userId: adminUser.id,
      name: '线性回归算法',
      description: '经典的线性回归算法，适用于连续值预测问题。支持单变量和多变量回归分析，提供详细的统计指标和可视化结果。',
      category: 'machine-learning',
      subcategory: 'regression',
      price: 0,
      status: 'APPROVED',
      tags: ['回归', '预测', '基础', '统计'],
      parameters: {
        fit_intercept: {
          type: 'boolean',
          default: true,
          description: '是否计算截距项'
        },
        normalize: {
          type: 'boolean',
          default: false,
          description: '是否标准化特征'
        }
      },
      requirements: {
        python: '>=3.8',
        packages: ['numpy', 'pandas', 'scikit-learn', 'matplotlib']
      },
      tenantId: 'default',
      visibility: 'PUBLIC'
    },
    {
      userId: adminUser.id,
      name: 'K-means聚类算法',
      description: '无监督学习聚类算法，用于数据分组和模式发现。支持K值自动选择和多种距离度量方式。',
      category: 'machine-learning',
      subcategory: 'clustering',
      price: 0,
      status: 'APPROVED',
      tags: ['聚类', '无监督学习', '分类', '模式识别'],
      parameters: {
        n_clusters: {
          type: 'integer',
          default: 3,
          min: 2,
          max: 100,
          description: '聚类中心数量'
        },
        max_iter: {
          type: 'integer',
          default: 300,
          description: '最大迭代次数'
        }
      },
      requirements: {
        python: '>=3.8',
        packages: ['numpy', 'pandas', 'scikit-learn', 'matplotlib', 'seaborn']
      },
      tenantId: 'default',
      visibility: 'PUBLIC'
    },
    {
      userId: demoUser.id,
      name: '图像识别CNN',
      description: '基于卷积神经网络的图像识别算法，支持多种预训练模型，适用于图像分类和目标检测任务。',
      category: 'deep-learning',
      subcategory: 'computer-vision',
      price: 99,
      status: 'APPROVED',
      tags: ['CNN', '图像识别', '深度学习', '神经网络'],
      parameters: {
        model_name: {
          type: 'string',
          default: 'resnet50',
          options: ['resnet50', 'vgg16', 'inception_v3'],
          description: '预训练模型选择'
        },
        input_size: {
          type: 'integer',
          default: 224,
          description: '输入图像尺寸'
        }
      },
      requirements: {
        python: '>=3.8',
        packages: ['torch', 'torchvision', 'numpy', 'pillow', 'opencv-python'],
        gpu: true
      },
      tenantId: 'default',
      visibility: 'PUBLIC'
    }
  ]

  for (const algorithm of sampleAlgorithms) {
    await prisma.algorithm.create({
      data: algorithm
    })
  }

  console.log('✅ 初始数据创建完成！')
  console.log('📧 管理员账号: admin@example.com / admin123')
  console.log('👤 演示账号: demo@example.com / demo123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ 数据创建失败:', e)
    await prisma.$disconnect()
    process.exit(1)
  })