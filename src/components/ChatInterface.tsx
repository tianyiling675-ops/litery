import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Bot, User, Sparkles, Clock, Heart, ArrowLeft, PlusCircle, ShieldAlert } from 'lucide-react';
import AddAvatarModal from './AddAvatarModal';
import { chatWithPersona } from '@/services/agentBridge';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'avatar';
  timestamp: Date;
}

interface Avatar {
  id: string;
  name: string;
  personality: string;
  imageUrl: string;
  analysisReport?: any;
}

const ChatInterface: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addedToSite, setAddedToSite] = useState(false);
  const [crisisMode, setCrisisMode] = useState(false);

  
  
  // 获取从Hero组件传递过来的分身数据
  const currentAvatar: Avatar = location.state?.avatar || {
    id: '1',
    name: '智慧助手',
    personality: '一个温柔体贴、善解人意的AI伙伴',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Friendly%20AI%20assistant%20avatar%2C%20warm%20and%20approachable%20character%2C%20soft%20colors%2C%20digital%20art%20style%2C%20transparent%20background&image_size=square_hd'
  };

  const detectCrisis = (text: string) => {
    const t = text.toLowerCase();
    const signals = [
      '自杀', '轻生', '不想活了', '结束生命', '抑郁', '绝望',
      'suicide', 'kill myself', 'end my life', 'depressed', 'i want to die'
    ];
    return signals.some(k => t.includes(k));
  };

  const sendMessage = () => {
    if (inputMessage.trim()) {
      if (detectCrisis(inputMessage)) {
        const alertMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: '我注意到你的信息可能包含自伤或抑郁倾向。为了你的安全，我将暂停对话。请立即寻求专业帮助：联系当地紧急服务或心理援助热线。你并不孤单，我们关心你。',
          sender: 'avatar',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, alertMessage]);
        setCrisisMode(true);
        setInputMessage('');
        return;
      }
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputMessage,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      
      setIsTyping(true);
      const history = [...messages, userMessage];
      const lastReply = [...messages].reverse().find(m => m.sender === 'avatar')?.text || '';
      const recentReplies = [...messages]
        .filter(m => m.sender === 'avatar')
        .slice(-3)
        .map(m => m.text);
      chatWithPersona({
        messages: history.map(m => ({ id: m.id, text: m.text, sender: m.sender })),
        avatar: { name: currentAvatar.name, personality: currentAvatar.personality },
        analysisReport: currentAvatar.analysisReport,
        avoidRepeat: true,
        lastReply,
        recentReplies,
      })
        .then(({ reply }) => {
          const avatarMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: reply,
            sender: 'avatar',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, avatarMessage]);
        })
        .catch(() => {
          const fallback: Message = {
            id: (Date.now() + 2).toString(),
            text: `就你刚刚说的这件事，我们把思路收拢一下：先选一个今天能完成的微动作，把可控部分做起来，再逐步推进。你更愿意从哪个点开始？`,
            sender: 'avatar',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, fallback]);
        })
        .finally(() => setIsTyping(false));
    }
  };

  const handleAddToSiteConfirm = (newName: string) => {
    const shared = JSON.parse(localStorage.getItem('sharedAvatars') || '[]');
    const toSave = { ...currentAvatar, name: newName };
    shared.unshift({
      id: toSave.id,
      name: toSave.name,
      personality: toSave.personality,
      imageUrl: toSave.imageUrl,
      inputMode: (currentAvatar as any).inputMode || 'direct',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('sharedAvatars', JSON.stringify(shared));
    setAddedToSite(true);
    setMessages(prev => [...prev, {
      id: (Date.now() + 2).toString(),
      text: `已将分身以“${newName}”的名称添加到网页示例中。`,
      sender: 'avatar',
      timestamp: new Date(),
    }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* 聊天头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <img 
              src={currentAvatar.imageUrl} 
              alt={currentAvatar.name}
              className="w-10 h-10 rounded-full"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{currentAvatar.name}</h3>
            <p className="text-blue-100 text-sm">{currentAvatar.personality}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">在线</span>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>添加到网页</span>
            </button>
          </div>
        </div>
      </div>

      {/* 聊天消息区域 */}
      <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {message.sender === 'avatar' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <img 
                      src={currentAvatar.imageUrl} 
                      alt={currentAvatar.name}
                      className="w-6 h-6 rounded-full"
                    />
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            </div>
          ))
        }
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <img 
                  src={currentAvatar.imageUrl} 
                  alt={currentAvatar.name}
                  className="w-6 h-6 rounded-full"
                />
              </div>
              <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 安全提示 */}
      {crisisMode && (
        <div className="px-6 py-3 bg-red-50 text-red-700 border-t border-red-200 flex items-center">
          <ShieldAlert className="w-5 h-5 mr-2" />
          为了你的安全，已暂停对话。请联系当地紧急服务或心理援助热线，和可信赖的人交流。
        </div>
      )}

      {/* 输入区域 */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`与 ${currentAvatar.name} 对话...`}
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              rows={1}
              maxLength={500}
            />
            <div className="absolute right-3 bottom-3 text-xs text-gray-400">
              {inputMessage.length}/500
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping || crisisMode}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 添加到网页模态框 */}
      <AddAvatarModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        avatar={currentAvatar}
        onConfirm={handleAddToSiteConfirm}
      />
    </div>
  );
};

export default ChatInterface;
