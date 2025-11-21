import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, User } from 'lucide-react';

interface Avatar {
  id: number | string;
  name: string;
  personality: string;
  imageUrl: string;
  inputMode?: 'direct' | 'diary';
}

interface AddAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatar: Avatar;
  onConfirm: (newName: string) => void;
}

const disallowedNames = [
  '我',
  '我的数字分身',
  '我的分身',
  '另一个我',
  '数字分身',
  'me',
  'my avatar',
  'my digital twin',
];

const nameSuggestions = ['晨曦', '星河', '小北', '林夕', '若水', '一一'];

const AddAvatarModal: React.FC<AddAvatarModalProps> = ({ isOpen, onClose, avatar, onConfirm }) => {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validateName = (name: string) => {
    const trimmed = name.trim().toLowerCase();
    if (trimmed.length < 2) return '名称过短，请使用昵称或实名等指向性名称';
    if (disallowedNames.some(n => trimmed.includes(n))) {
      return '名称不可使用“我/我的分身”等无指向性称呼，请使用昵称或真实姓名';
    }
    return '';
  };

  const handleConfirm = () => {
    const msg = validateName(newName);
    if (msg) {
      setError(msg);
      return;
    }
    onConfirm(newName.trim());
    setNewName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">添加到网页</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-700">是否将你的数字分身展示在网页的示例区？如果需要，请为分身重新命名为具有指向性的昵称或真实姓名：</p>
          <div className="flex items-center space-x-3">
            <img src={avatar.imageUrl} alt={avatar.name} className="w-16 h-16 rounded-full border" />
            <div>
              <p className="text-sm text-gray-500">当前名称</p>
              <p className="text-base font-semibold text-gray-900">{avatar.name}</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例如：小李、林同学、星河..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              maxLength={32}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          {error ? (
            <div className="flex items-center text-sm text-red-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {error}
            </div>
          ) : (
            <div className="text-sm text-gray-500">建议使用昵称或真实姓名，例如：{nameSuggestions.join('、')}</div>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">取消</button>
          <button onClick={handleConfirm} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg">确认添加</button>
        </div>
      </div>
    </div>
  );
};

export default AddAvatarModal;
