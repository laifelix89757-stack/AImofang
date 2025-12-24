import React, { useState, useEffect } from 'react';
import { ModuleConfig, ModelType } from '../types';
import { UserManagement } from './UserManagement';
import { securityService } from '../services/securityService';

interface AdminPanelProps {
  modules: ModuleConfig[];
  onUpdateModule: (id: string, updates: Partial<ModuleConfig>) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ modules, onUpdateModule, onClose }) => {
  const [activeTab, setActiveTab] = useState<'modules' | 'users' | 'settings'>('modules');
  
  // Settings State
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);
  
  // Share Link State
  const [generatedLink, setGeneratedLink] = useState('');

  useEffect(() => {
    // Try to load encrypted key first
    const encryptedKey = localStorage.getItem(securityService.STORAGE_KEY);
    if (encryptedKey) {
      const decrypted = securityService.decrypt(encryptedKey);
      if (decrypted) {
        setApiKey(decrypted);
        setIsEncrypted(true);
        return;
      }
    }
    
    // Fallback to old plain text key (for migration)
    const oldKey = localStorage.getItem('nova_global_api_key');
    if (oldKey) {
      setApiKey(oldKey);
      setIsEncrypted(false); // Mark as not encrypted yet
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey) return;
    
    // 1. Encrypt the key
    const encrypted = securityService.encrypt(apiKey);
    
    // 2. Save to secure storage
    localStorage.setItem(securityService.STORAGE_KEY, encrypted);
    
    // 3. Clean up old insecure key
    localStorage.removeItem('nova_global_api_key');
    
    setIsEncrypted(true);
    setGeneratedLink(''); // Reset link if key changes
    alert('API Key 已通过 AES 高级加密标准加密并安全保存。托管模式已激活。');
  };

  const handleClearKey = () => {
    localStorage.removeItem(securityService.STORAGE_KEY);
    localStorage.removeItem('nova_global_api_key');
    setApiKey('');
    setIsEncrypted(false);
    setGeneratedLink('');
    alert('全局 API Key 已移除。系统将恢复为开发模式。');
  };

  const generateDeliveryLink = () => {
    const encryptedKey = localStorage.getItem(securityService.STORAGE_KEY);
    if (!encryptedKey) {
      alert("请先保存 API Key 才能生成交付链接。");
      return;
    }
    
    // Create the URL. We use encodeURIComponent to ensure special chars in the hash don't break the URL
    const baseUrl = window.location.origin + window.location.pathname;
    const link = `${baseUrl}?sk=${encodeURIComponent(encryptedKey)}`;
    setGeneratedLink(link);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("交付链接已复制到剪贴板！\n\n发送给用户后，他们打开链接即可直接使用 AI 功能，无需配置 Key。");
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-850">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-yellow-500">⚙️</span> 后台管理系统
          </h2>
          <p className="text-xs text-gray-400 mt-1">NOVA AI Enterprise Admin</p>
        </div>
        <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
          返回工作台
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 border-b border-gray-700 flex gap-4">
        <button
          onClick={() => setActiveTab('modules')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'modules' 
              ? 'border-blue-500 text-blue-400' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          GEM 调试与配置
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'users' 
              ? 'border-blue-500 text-blue-400' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          账号与用户管理
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'settings' 
              ? 'border-blue-500 text-blue-400' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          系统全局设置
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        
        {/* User Management Tab */}
        {activeTab === 'users' && (
          <UserManagement />
        )}

        {/* Global Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8">
            
            {/* Key Configuration Section */}
            <div className={`rounded-xl border p-6 shadow-lg transition-all ${
              isEncrypted 
                ? 'bg-gray-800 border-green-800/50 shadow-green-900/10' 
                : 'bg-gray-800 border-yellow-700/50'
            }`}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>{isEncrypted ? '🔐' : '🔑'}</span> 全局 API Key 安全配置
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 flex justify-between">
                    <span>Google GenAI API Key</span>
                    {isEncrypted && <span className="text-green-400 flex items-center gap-1">✅ AES Encrypted</span>}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setIsEncrypted(false); 
                        setGeneratedLink('');
                      }}
                      className={`flex-1 bg-gray-900 border rounded-lg p-3 text-sm text-white focus:outline-none font-mono transition-colors ${
                        isEncrypted ? 'border-green-600/50 text-green-300' : 'border-gray-600 focus:border-yellow-500'
                      }`}
                      placeholder="AIzaSy..."
                    />
                    <button 
                      onClick={() => setShowKey(!showKey)}
                      className="px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300"
                    >
                      {showKey ? '隐藏' : '显示'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleSaveKey}
                    className={`flex-1 font-bold py-2 rounded-lg shadow-lg transition-transform active:scale-95 text-white ${
                      isEncrypted
                        ? 'bg-green-700 hover:bg-green-600 cursor-default'
                        : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500'
                    }`}
                  >
                    {isEncrypted ? '配置已加密保存' : '加密并保存配置'}
                  </button>
                  {apiKey && (
                    <button
                      onClick={handleClearKey}
                      className="px-4 py-2 border border-red-800 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      清除
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Link Generator Section */}
            {isEncrypted && (
              <div className="bg-gradient-to-br from-gray-800 to-blue-900/20 rounded-xl border border-blue-800/30 p-6 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <span>🚀</span> 商用交付链接生成
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  生成一个包含加密凭证的一次性配置链接。发送此链接给客户，客户打开后将自动完成环境配置，无需手动输入 API Key。
                </p>

                {!generatedLink ? (
                   <button 
                     onClick={generateDeliveryLink}
                     className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                   >
                     生成交付链接
                   </button>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 font-mono text-xs text-gray-300 break-all">
                      {generatedLink}
                    </div>
                    <button 
                      onClick={copyLink}
                      className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-bold text-sm shadow-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <span>📋</span> 复制链接发送给客户
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 opacity-75">
              <h3 className="text-lg font-bold text-white mb-2">安全建议</h3>
              <ul className="list-disc pl-5 text-sm text-gray-400 space-y-2">
                <li className="text-yellow-500">
                  <b>至关重要：</b>请务必在 <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="underline hover:text-yellow-400">Google Cloud Console</a> 中配置 API Key 限制。
                </li>
                <li>
                  在 "Application restrictions" 中选择 <b>HTTP referrers (web sites)</b>，并填入您部署后的网站域名（如 <code>https://your-domain.com/*</code>）。
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Modules Config Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-8">
            {modules.map((module) => (
              <div key={module.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{module.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{module.name}</h3>
                      <p className="text-xs text-gray-400">{module.description}</p>
                    </div>
                  </div>
                  <div className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded border border-blue-700">
                    ID: {module.id}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Basic Config */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">调用模型 (Model)</label>
                      <select
                        value={module.model}
                        onChange={(e) => onUpdateModule(module.id, { model: e.target.value as ModelType })}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none"
                      >
                        <option value={ModelType.GEMINI_3_PRO_IMAGE}>Gemini 3 Pro Image (High Quality)</option>
                        <option value={ModelType.GEMINI_2_5_FLASH_IMAGE}>Gemini 2.5 Flash Image (Fast/Edit)</option>
                        <option value={ModelType.GEMINI_3_PRO}>Gemini 3 Pro (Text Only)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">输入图片数量</label>
                      <select
                        value={module.inputCount}
                        onChange={(e) => onUpdateModule(module.id, { inputCount: parseInt(e.target.value) as 1 | 2 })}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none"
                      >
                        <option value={1}>单图输入</option>
                        <option value={2}>双图输入 (融合/参考)</option>
                      </select>
                    </div>
                  </div>

                  {/* Right: GEM Definition */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-yellow-500 mb-1 flex justify-between">
                      <span>GEM 系统指令 (System Instruction)</span>
                      <span className="text-gray-500 font-normal">此处定义的角色将直接控制用户侧的生成结果</span>
                    </label>
                    <textarea
                      value={module.systemInstruction}
                      onChange={(e) => onUpdateModule(module.id, { systemInstruction: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg p-4 text-sm font-mono text-gray-300 focus:ring-1 focus:ring-yellow-500 outline-none h-40 resize-none"
                      placeholder="You are an expert designer..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};