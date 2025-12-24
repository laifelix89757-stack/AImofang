import React from 'react';
import { ModuleConfig, UserProfile } from '../types';

interface SidebarProps {
  user: UserProfile;
  modules: ModuleConfig[];
  activeModuleId: string;
  onSelectModule: (id: string) => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  user, 
  modules, 
  activeModuleId, 
  onSelectModule, 
  onOpenAdmin,
  onLogout
}) => {
  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 h-full flex flex-col shrink-0 transition-all duration-300">
      <div className="p-6">
        <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tighter">
          NOVA AI
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <p className="text-xs text-gray-300 truncate">欢迎, {user.username}</p>
        </div>
      </div>

      <div className="px-4 py-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">业务板块</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => onSelectModule(module.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left ${
              activeModuleId === module.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span>{module.icon}</span>
            <span className="truncate">{module.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700 space-y-2">
        {user.role === 'admin' && (
          <button 
            onClick={onOpenAdmin}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-yellow-500 bg-yellow-900/20 hover:bg-yellow-900/40 rounded-lg transition-colors border border-yellow-800/50"
          >
            <span>⚙️</span>
            后台调试 (Admin)
          </button>
        )}
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <span>🚪</span>
          退出登录
        </button>
      </div>
    </div>
  );
};
