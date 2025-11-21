import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Brain, BarChart3, Star, Users, Zap, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      title: '智能算法市场',
      description: '发现和订阅高质量的AI算法，涵盖机器学习、深度学习、计算机视觉等领域',
    },
    {
      icon: <Code className="w-8 h-8 text-green-600" />,
      title: '在线开发环境',
      description: '提供完整的在线算法开发和调试环境，支持多种编程语言',
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      title: '结果可视化',
      description: '强大的数据可视化工具，帮助您理解和分析算法执行结果',
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: '分布式执行',
      description: '弹性伸缩的任务调度系统，支持大规模分布式算法执行',
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: '多租户安全',
      description: '企业级多租户架构，确保数据隔离和安全访问控制',
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: '社区协作',
      description: '活跃的开发者社区，分享算法、交流经验、共同创新',
    },
  ];

  const stats = [
    { label: '算法数量', value: '1000+' },
    { label: '开发者', value: '5000+' },
    { label: '执行任务', value: '10000+' },
    { label: '企业客户', value: '100+' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              智能算法
              <span className="text-blue-600 dark:text-blue-400">平台</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              发现、开发和部署AI算法的完整解决方案。为企业和开发者提供强大的算法市场、
              在线开发环境和分布式执行能力。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/algorithms"
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                浏览算法市场
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/algorithms"
                className="inline-flex items-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                开始免费试用
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              平台特色功能
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              一站式AI算法开发和服务平台，为您提供完整的算法生命周期管理
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            准备开始您的AI之旅？
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            立即加入我们的平台，探索数千个高质量算法，或上传您自己的算法与社区分享
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/algorithms"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              免费注册
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
              了解更多
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}