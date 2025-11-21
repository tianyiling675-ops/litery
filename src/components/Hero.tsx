import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Sparkles, Bot, Wand2, BookOpen, User, PenTool, FileText, Brain } from 'lucide-react';
import ShareModal from './ShareModal';
import { analyzeText } from '@/services/agentBridge';

type InputMode = 'direct' | 'diary';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [personalityText, setPersonalityText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('direct');
  const [analysisResult, setAnalysisResult] = useState<string[]>([]);
  const [avatarName, setAvatarName] = useState('');
  const [generatedAvatar, setGeneratedAvatar] = useState<any>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const disallowedNames = ['我','我的数字分身','我的分身','另一个我','数字分身','me','my avatar','my digital twin'];
  const invalidName = disallowedNames.some(n => avatarName.trim().toLowerCase().includes(n));

  const handleGenerate = () => {
    if (personalityText.trim() && avatarName.trim()) {
      setIsGenerating(true);
      setAnalysisResult([]); // 重置分析结果
      
      // 模拟AI分析过程
      if (inputMode === 'diary') {
        // 日记分析模式 - 逐步显示分析结果
        const mockAnalysis = [
          '🔍 检测到乐观积极的表达方式',
          '📝 发现细腻的情感描述能力', 
          '💭 识别出深度思考的倾向',
          '🌟 提取到独特的个人价值观'
        ];
        
        // 逐步显示分析结果
        mockAnalysis.forEach((result, index) => {
          setTimeout(() => {
            setAnalysisResult(prev => [...prev, result]);
          }, index * 800);
        });
      }
      
      setTimeout(() => {
        const newAvatar = {
          id: Date.now(),
          name: avatarName,
          personality: personalityText,
          inputMode: inputMode,
          createdAt: new Date().toISOString(),
          imageUrl: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
            `Digital avatar representing ${avatarName}, ${personalityText.slice(0, 100)}, modern digital art style, vibrant colors, transparent background`
          )}&image_size=square_hd`
        };
        analyzeText({ text: personalityText, mode: inputMode, name: avatarName }).then((report) => {
          setGeneratedAvatar({ ...newAvatar, analysisReport: report });
          setIsGenerating(false);
        });
      }, 4000);
    }
  };

  const getPlaceholder = () => {
    if (inputMode === 'diary') {
      return "分享你的日记片段、生活感悟或任何文字表达...\n\n例如：\n今天又是一个充满挑战的日子。早晨醒来时，我习惯性地先深呼吸三次，告诉自己无论面对什么都要保持冷静。工作中遇到了一个棘手的问题，同事们都很焦虑，但我选择先仔细分析情况...\n\n（建议最少200字，AI会从你的表达习惯、用词选择、情感色彩等方面分析你的性格特征）\n\n你可以分享：\n• 日记片段\n• 生活感悟\n• 情感记录\n• 思考随笔\n• 任何真实的文字表达";
    }
    return "例如：我是一个热爱冒险、充满好奇心的人，喜欢探索未知的事物，总是保持积极乐观的态度...";
  };

  const getMaxLength = () => {
    return inputMode === 'diary' ? 10000 : 300;
  };

  const scrollToNext = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center pt-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          {/* 主标题 */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              创造你的
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI数字分身
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {inputMode === 'diary' 
                ? '分享你的日记或文字表达，让AI从遣词造句中分析你的性格特征'
                : '输入你的性格描述，让AI为你生成独一无二的数字分身，在虚拟世界中拥有另一个自己'
              }
            </p>
          </div>

          {/* 特色标签 */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 hover-float transition-all duration-300 hover:shadow-lg">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700 font-medium">智能文本分析</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 hover-float transition-all duration-300 hover:shadow-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700 font-medium">个性定制</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 hover-float transition-all duration-300 hover:shadow-lg">
              <Wand2 className="w-5 h-5 text-indigo-600" />
              <span className="text-gray-700 font-medium">即时生成</span>
            </div>
          </div>

          {/* 性格输入区域 */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200">
              {/* 输入模式选择 */}
              <div className="mb-6">
                <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
                  <button
                    onClick={() => setInputMode('direct')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                      inputMode === 'direct'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">直接描述</span>
                  </button>
                  <button
                    onClick={() => setInputMode('diary')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                      inputMode === 'diary'
                        ? 'bg-white text-purple-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="font-medium">日记分析</span>
                  </button>
                </div>

                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {inputMode === 'direct' ? '描述你的性格特点' : '分享你的文字表达'}
                </h3>
                <p className="text-gray-600">
                  {inputMode === 'direct'
                    ? '用几句话描述你的性格、兴趣或特点，AI会为你生成专属的数字分身'
                    : '分享你的日记、文章或任何文字表达，AI会从你的遣词造句中分析性格特征'}
                </p>
              </div>

              {/* 数字分身命名 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  给你的数字分身起个名字
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={avatarName}
                    onChange={(e) => setAvatarName(e.target.value)}
                    placeholder="例如：我的另一个我、小助手、智慧伙伴..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    maxLength={20}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Bot className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {avatarName.length}/20 字符 • 这个名字将作为你与数字分身对话时的指代
                </p>
                {invalidName && (
                  <p className="text-xs text-red-600 mt-1">请使用具有指向性的昵称或真实姓名，避免“我/我的分身”等称呼</p>
                )}
              </div>
              
              <div className="space-y-4">
                <textarea
                  value={personalityText}
                  onChange={(e) => setPersonalityText(e.target.value)}
                  placeholder={getPlaceholder()}
                  className={`w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    inputMode === 'diary' ? 'h-48' : 'h-32'
                  }`}
                  maxLength={getMaxLength()}
                />
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {personalityText.length}/{getMaxLength()} 字符
                    </span>
                    {inputMode === 'diary' && personalityText.length > 0 && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        personalityText.length >= 200 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {personalityText.length >= 200 ? '✓ 字数充足' : `建议再输入 ${200 - personalityText.length} 字符`}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={!personalityText.trim() || !avatarName.trim() || invalidName || isGenerating || (inputMode === 'diary' && personalityText.length < 50)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none animate-gradient"
                  >
                    {isGenerating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{inputMode === 'diary' ? 'AI正在分析你的文字...' : 'AI正在生成...'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5" />
                        <span>{inputMode === 'diary' ? '分析并生成数字分身' : '生成数字分身'}</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 生成结果展示 */}
          {isGenerating && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    {inputMode === 'diary' ? (
                      <Brain className="w-8 h-8 text-white animate-pulse" />
                    ) : (
                      <Bot className="w-8 h-8 text-white animate-pulse" />
                    )}
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {inputMode === 'diary' ? 'AI正在分析你的文字表达...' : 'AI正在分析你的性格...'}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {inputMode === 'diary' 
                      ? '我们正在从你的遣词造句中发现独特的性格特征，请稍等片刻' 
                      : '请稍等片刻，我们正在为你创造独一无二的数字分身'
                    }
                  </p>
                  
                  {/* 日记分析过程展示 */}
                  {inputMode === 'diary' && analysisResult.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h5 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                        <Brain className="w-4 h-4 mr-2 text-purple-600" />
                        🔍 分析发现：
                      </h5>
                      {analysisResult.map((result, index) => (
                        <div 
                          key={index}
                          className="text-left bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg text-sm text-gray-700 border-l-4 border-purple-400 animate-fadeInUp"
                          style={{ animationDelay: `${index * 0.3}s` }}
                        >
                          {result}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-6">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 生成完成展示 */}
          {generatedAvatar && !isGenerating && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">
                    🎉 {generatedAvatar.name} 已创建成功！
                  </h4>
                  <p className="text-gray-600 mb-6">
                    你的数字分身已经准备好了，现在可以开始对话或分享到社区
                  </p>
                  
                  {/* 分身预览 */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                    <img 
                      src={generatedAvatar.imageUrl} 
                      alt={generatedAvatar.name}
                      className="w-32 h-32 mx-auto rounded-full mb-4 border-4 border-white shadow-lg"
                    />
                    <h5 className="text-lg font-semibold text-gray-900 mb-2">{generatedAvatar.name}</h5>
                    <p className="text-sm text-gray-600 line-clamp-3">{generatedAvatar.personality}</p>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={() => navigate('/chat', { state: { avatar: generatedAvatar } })}
                      className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                    >
                      <Bot className="w-5 h-5" />
                      <span>开始对话</span>
                    </button>
                    <button 
                      onClick={() => setIsShareModalOpen(true)}
                      className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>分享到社区</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 向下滚动指示器 */}
        <div className="text-center">
          <button
            onClick={scrollToNext}
            className="animate-bounce p-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white transition-colors duration-200"
          >
            <ChevronDown className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 分享模态框 */}
      {generatedAvatar && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          avatar={generatedAvatar}
        />
      )}
    </section>
  );
};

export default Hero;
