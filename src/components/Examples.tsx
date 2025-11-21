import React, { useState, useEffect } from 'react';
import { Heart, Share2, Eye, Sparkles } from 'lucide-react';

interface AvatarExample {
  id: number;
  name: string;
  description: string;
  personality: string;
  likes: number;
  views: number;
  imageUrl: string;
  tags: string[];
  inputType: 'direct' | 'diary';
  sampleText: string;
}

const Examples: React.FC = () => {
  const [likedAvatars, setLikedAvatars] = useState<number[]>([]);
  const [examples, setExamples] = useState<AvatarExample[]>([]);

  const defaultExamples: AvatarExample[] = [
    {
      id: 1,
      name: "冒险探索者",
      description: "热爱冒险，充满好奇心，总是追求新鲜体验",
      personality: "我是一个勇敢的探索者，喜欢挑战未知，对新鲜事物充满好奇。我相信每一次冒险都是成长的机会，愿意尝试各种新体验。",
      likes: 234,
      views: 1250,
      imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Adventure%20explorer%20avatar%2C%20brave%20and%20curious%20character%2C%20outdoor%20gear%2C%20confident%20pose%2C%20modern%20digital%20art%20style%2C%20vibrant%20colors%2C%20transparent%20background&image_size=square_hd",
      tags: ["勇敢", "好奇", "冒险"],
      inputType: 'direct',
      sampleText: "直接描述性格特点"
    },
    {
      id: 2,
      name: "温柔治愈师",
      description: "善解人意，温暖贴心，总能给人安全感",
      personality: "我是一个温柔的人，善于倾听和理解他人。我相信善良和同理心能够治愈世界，总是尽力为身边的人带来温暖和安慰。",
      likes: 189,
      views: 890,
      imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Gentle%20healer%20avatar%2C%20warm%20and%20caring%20character%2C%20soft%20colors%2C%20peaceful%20expression%2C%20digital%20art%20style%2C%20pastel%20tones%2C%20transparent%20background&image_size=square_hd",
      tags: ["温柔", "治愈", "善解人意"],
      inputType: 'direct',
      sampleText: "直接描述性格特点"
    },
    {
      id: 3,
      name: "文字诗人",
      description: "从日记中发现细腻情感和文艺气质",
      personality: "通过文字表达内心世界的诗人，善于观察生活中的美好瞬间，用细腻的笔触记录情感和思考。",
      likes: 312,
      views: 1580,
      imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Poetic%20writer%20avatar%2C%20artistic%20and%20sensitive%20character%2C%20surrounded%20by%20floating%20words%20and%20poetry%2C%20gentle%20expression%2C%20digital%20art%20style%2C%20soft%20literary%20colors%2C%20transparent%20background&image_size=square_hd",
      tags: ["文艺", "细腻", "感性"],
      inputType: 'diary',
      sampleText: "今天的阳光很特别，透过窗帘的缝隙洒在书桌上，形成了斑驳的光影。我坐在熟悉的位置，翻开许久未写的日记本..."
    },
    {
      id: 4,
      name: "理性思考者",
      description: "从文字表达中发现逻辑性和深度思考",
      personality: "善于分析和思考的人，喜欢用理性的方式看待问题，追求知识和真理，表达方式严谨而有条理。",
      likes: 156,
      views: 723,
      imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Wise%20thinker%20avatar%2C%20intellectual%20character%2C%20thoughtful%20expression%2C%20glasses%2C%20books%20around%2C%20digital%20art%20style%2C%20scholarly%20atmosphere%2C%20transparent%20background&image_size=square_hd",
      tags: ["智慧", "理性", "思考"],
      inputType: 'direct',
      sampleText: "直接描述性格特点"
    },
    {
      id: 5,
      name: "生活观察家",
      description: "从日常记录中发现独特的观察力和幽默感",
      personality: "善于观察生活细节的人，能从平凡中发现不平凡，用独特的视角和幽默感记录生活点滴。",
      likes: 278,
      views: 1345,
      imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Life%20observer%20avatar%2C%20observant%20and%20humorous%20character%2C%20magnifying%20glass%2C%20notebook%2C%20curious%20expression%2C%20digital%20art%20style%2C%20warm%20observant%20colors%2C%20transparent%20background&image_size=square_hd",
      tags: ["观察", "幽默", "生活化"],
      inputType: 'diary',
      sampleText: "早上买咖啡的时候，我发现了一个有趣的现象：人们排队时的表情可以分成好几类..."
    },
    {
      id: 6,
      name: "创意艺术家",
      description: "想象力丰富，创意无限，用艺术表达内心世界",
      personality: "我是一个充满创意的人，喜欢用各种方式表达自己。我相信想象力和创造力能够让生活更加丰富多彩，总是在寻找新的艺术形式和表现手法。",
      likes: 278,
      views: 1345,
      imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Creative%20artist%20avatar%2C%20colorful%20and%20artistic%20character%2C%20paint%20brushes%2C%20palette%2C%20creative%20pose%2C%20digital%20art%20style%2C%20rainbow%20colors%2C%20transparent%20background&image_size=square_hd",
      tags: ["创意", "艺术", "想象力"],
      inputType: 'direct',
      sampleText: "直接描述性格特点"
    },
    {
      id: 7,
      name: "活力运动家",
      description: "充满活力，热爱运动，追求健康和挑战",
      personality: "我是一个充满活力的人，热爱各种运动。我相信健康的身体和积极的心态是生活的基础，总是在挑战自己的极限，追求更好的表现。",
      likes: 203,
      views: 967,
      imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Energetic%20athlete%20avatar%2C%20dynamic%20sporty%20character%2C%20athletic%20wear%2C%20confident%20pose%2C%20digital%20art%20style%2C%20bright%20colors%2C%20transparent%20background&image_size=square_hd",
      tags: ["活力", "运动", "健康"],
      inputType: 'direct',
      sampleText: "直接描述性格特点"
    }
  ];

  useEffect(() => {
    const shared = JSON.parse(localStorage.getItem('sharedAvatars') || '[]');
    const sharedMapped: AvatarExample[] = shared.map((a: any, idx: number) => ({
      id: typeof a.id === 'number' ? a.id : Number(a.id) || Date.now() + idx,
      name: a.name,
      description: '用户添加的数字分身',
      personality: a.personality,
      likes: Math.floor(Math.random() * 200) + 50,
      views: Math.floor(Math.random() * 1500) + 200,
      imageUrl: a.imageUrl,
      tags: ['用户作品'],
      inputType: a.inputMode || 'diary',
      sampleText: a.personality.slice(0, 100) + (a.personality.length > 100 ? '...' : '')
    }));
    setExamples([...sharedMapped, ...defaultExamples]);
  }, []);

  const toggleLike = (id: number) => {
    setLikedAvatars(prev => 
      prev.includes(id) 
        ? prev.filter(avatarId => avatarId !== id)
        : [...prev, id]
    );
  };

  return (
    <section id="examples" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题区域 */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              精选分身示例
            </h2>
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            看看其他用户创造的精彩数字分身，每一个都是独一无二的个性表达
          </p>
          
          {/* 输入模式说明 */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full"></div>
              <span className="text-sm text-gray-700">👤 直接描述模式</span>
            </div>
            <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full"></div>
              <span className="text-sm text-gray-700">📖 日记分析模式</span>
            </div>
          </div>
        </div>

        {/* 示例网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {examples.map((avatar) => (
            <div
              key={avatar.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-200 hover-float"
            >
              {/* 头像图片 */}
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
                <img
                  src={avatar.imageUrl}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* 内容区域 */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {avatar.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {avatar.description}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {avatar.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      avatar.inputType === 'diary'
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                        : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700'
                    }`}
                  >
                    {avatar.inputType === 'diary' ? '📖 日记分析' : '👤 直接描述'}
                  </span>
                </div>

                {/* 示例文字预览 */}
                {avatar.inputType === 'diary' && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 italic line-clamp-3">
                      "{avatar.sampleText}"
                    </p>
                  </div>
                )}

                {/* 统计和操作 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-gray-500">
                    <button
                      onClick={() => toggleLike(avatar.id)}
                      className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                        likedAvatars.includes(avatar.id) ? 'text-red-500' : ''
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          likedAvatars.includes(avatar.id) ? 'fill-current' : ''
                        }`}
                      />
                      <span className="text-sm">{avatar.likes}</span>
                    </button>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{avatar.views}</span>
                    </div>
                  </div>
                  <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">分享</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA 区域 */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              创造属于你的数字分身
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              选择你喜欢的输入方式，让AI帮你将个性特点转化为独一无二的数字分身
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <div className="flex items-center justify-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-sm">直接描述性格</span>
              </div>
              <div className="flex items-center justify-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                <span className="text-sm">分享日记文字</span>
              </div>
            </div>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 animate-gradient">
              立即开始创作
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Examples;
