import React from 'react';
import { Sparkles, Mail, Github, Twitter, Instagram, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: '功能介绍', href: '#features' },
      { name: '使用教程', href: '#tutorial' },
      { name: '定价方案', href: '#pricing' },
      { name: '更新日志', href: '#changelog' }
    ],
    support: [
      { name: '帮助中心', href: '#help' },
      { name: '联系我们', href: '#contact' },
      { name: '用户反馈', href: '#feedback' },
      { name: '常见问题', href: '#faq' }
    ],
    company: [
      { name: '关于我们', href: '#about' },
      { name: '隐私政策', href: '#privacy' },
      { name: '服务条款', href: '#terms' },
      { name: '开发者API', href: '#api' }
    ],
    social: [
      { name: 'Twitter', icon: Twitter, href: '#twitter' },
      { name: 'Instagram', icon: Instagram, href: '#instagram' },
      { name: 'Facebook', icon: Facebook, href: '#facebook' },
      { name: 'GitHub', icon: Github, href: '#github' }
    ]
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* 品牌信息 */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI数字分身
              </span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              创造属于你的AI数字分身，让个性在虚拟世界中绽放光彩。每个人都是独一无二的存在。
            </p>
            <div className="flex space-x-4">
              {footerLinks.social.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* 产品链接 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">产品</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:underline"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 支持链接 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-purple-400">支持</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:underline"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 公司信息 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-indigo-400">公司</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:underline"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            
            {/* 邮件订阅 */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3 text-gray-300">订阅更新</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="输入邮箱地址"
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-r-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 分割线 */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} AI数字分身平台. 保留所有权利.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#privacy" className="hover:text-white transition-colors duration-200">
                隐私政策
              </a>
              <a href="#terms" className="hover:text-white transition-colors duration-200">
                服务条款
              </a>
              <a href="#cookies" className="hover:text-white transition-colors duration-200">
                Cookie政策
              </a>
            </div>
          </div>
        </div>

        {/* 技术声明 */}
        <div className="mt-8 pt-4 border-t border-gray-700">
          <div className="text-center text-gray-500 text-xs">
            <p>Powered by Advanced AI Technology | 让科技为个性赋能</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;