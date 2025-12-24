import React, { useState, useEffect } from 'react';
import { authService, UserAccount } from '../services/authService';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const loadUsers = () => {
    setUsers(authService.getAllUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = () => {
    if (!newUsername || !newPassword) {
      setMsg({ type: 'error', text: '账号和密码不能为空' });
      return;
    }
    const success = authService.createUser({
      username: newUsername,
      password: newPassword,
      role: newRole,
      createdAt: Date.now()
    });

    if (success) {
      setMsg({ type: 'success', text: `用户 ${newUsername} 创建成功` });
      setNewUsername('');
      setNewPassword('');
      loadUsers();
    } else {
      setMsg({ type: 'error', text: '该用户已存在' });
    }
    
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDelete = (username: string) => {
    if (confirm(`确定要删除用户 ${username} 吗?`)) {
      authService.deleteUser(username);
      loadUsers();
    }
  };

  return (
    <div className="space-y-8">
      {/* Create User Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>👤</span> 创建新账号
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">用户名</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none"
              placeholder="client_01"
            />
          </div>
          <div>
             <label className="block text-xs font-semibold text-gray-400 mb-1">密码</label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none"
              placeholder="设置密码"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">角色权限</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none"
            >
              <option value="user">普通用户 (User)</option>
              <option value="admin">管理员 (Admin)</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm h-10"
          >
            + 添加用户
          </button>
        </div>
        {msg && (
          <div className={`mt-3 text-xs ${msg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {msg.text}
          </div>
        )}
      </div>

      {/* User List Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 bg-gray-850">
          <h3 className="text-sm font-bold text-gray-300">已注册用户列表</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">用户名</th>
              <th className="px-6 py-3">角色</th>
              <th className="px-6 py-3">密码 (仅管理员可见)</th>
              <th className="px-6 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((u) => (
              <tr key={u.username} className="hover:bg-gray-750 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{u.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs border ${
                    u.role === 'admin' 
                      ? 'bg-purple-900/30 text-purple-300 border-purple-700' 
                      : 'bg-blue-900/30 text-blue-300 border-blue-700'
                  }`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 font-mono">
                  {u.password}
                </td>
                <td className="px-6 py-4">
                  {u.username !== 'admin' && (
                    <button 
                      onClick={() => handleDelete(u.username)}
                      className="text-red-400 hover:text-red-300 hover:underline"
                    >
                      删除
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
