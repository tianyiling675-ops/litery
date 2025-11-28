import React, { useState } from 'react';
import { X, Copy, Share2, Download, Eye, Heart } from 'lucide-react';

interface Avatar {
  id: string | number;
  name: string;
  personality: string;
  imageUrl: string;
  inputMode?: 'direct' | 'diary';
  createdAt?: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatar: Avatar;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, avatar }) => {
  const [copied, setCopied] = useState(false);
  const [viewCount] = useState(Math.floor(Math.random() * 1000) + 100);
  const [likeCount] = useState(Math.floor(Math.random() * 100) + 10);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/avatar/${avatar.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const downloadAvatar = () => {
    const link = document.createElement('a');
    link.href = avatar.imageUrl;
    link.download = `${avatar.name}-avatar.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareToSocial = (platform: string) => {
    const text = `我刚刚创建了名为"${avatar.name}"的AI数字分身！快来认识一下吧！`;
    const url = shareUrl;
    let shareLink = '';
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'weibo':
        shareLink = `https://service.weibo.com/share/share.php?title=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-blue-600" />
            分享你的数字分身
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg">
              <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-full object-cover" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">{avatar.name}</h4>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{avatar.personality}</p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {viewCount}
              </div>
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                {likeCount}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分享链接</label>
            <div className="flex space-x-2">
              <input type="text" value={shareUrl} readOnly className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
              <button onClick={copyToClipboard} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${copied ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                <div className="flex items-center">
                  <span className="mr-1">{copied ? '已复制' : '复制'}</span>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">下载分身</label>
            <button onClick={downloadAvatar} className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
              <Download className="w-4 h-4" />
              <span>下载头像图片</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分享到社交媒体</label>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => shareToSocial('twitter')} className="flex flex-col items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                <div className="w-6 h-6 mb-1 text-xs font-bold">𝕏</div>
                <span className="text-xs">Twitter</span>
              </button>
              <button onClick={() => shareToSocial('facebook')} className="flex flex-col items-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <div className="w-6 h-6 mb-1 text-xs font-bold">f</div>
                <span className="text-xs">Facebook</span>
              </button>
              <button onClick={() => shareToSocial('weibo')} className="flex flex-col items-center p-3 bg-red-500 text-white rounded-lg hover:bg-red-600">
                <div className="w-6 h-6 mb-1 text-xs font-bold">微</div>
                <span className="text-xs">微博</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button onClick={onClose} className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">关闭</button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
