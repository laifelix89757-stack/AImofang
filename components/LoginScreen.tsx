import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
  isLicenseActive?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isLicenseActive }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authService.init();
  }, []);

  const handleLogin = () => {
    setError(null);
    if (!username || !password) {
      setError("请输入账号和密码");
      return;
    }
    
    const user = authService.login(username, password);
    if (user) {
      onLogin(user);
    } else {
      setError("账号或密码错误");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 w-full relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>

      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-md z-10 relative overflow-hidden">
        {isLicenseActive && (
          <div className="absolute top-0 left-0 w-full bg-green-600/90 text-white text-xs font-bold py-1 text-center shadow-lg">
            ✓ 企业授权已激活
          </div>
        )}

        <div className="text-center mb-8 mt-4">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
            NOVA AI
          </h1>
          <p className="text-gray-400 text-sm">企业级智能设计中台</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">账号</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="请输入账号"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">密码</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-300 text-xs text-center">
              {error}
            </div>
          )}

          <div className="pt-4">
            <button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-95"
            >
              登 录
            </button>
          </div>
          
          <div className="text-center mt-6">
             <p className="text-[10px] text-gray-600">
               © 2024 NOVA AI Design System. All rights reserved.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};