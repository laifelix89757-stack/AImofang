import { UserProfile } from '../types';

const STORAGE_KEY = 'nova_users';

export interface UserAccount extends UserProfile {
  password?: string; 
  createdAt: number;
}

// =========================================================
// 配置区域：在此处修改默认的管理员账号和密码
// 注意：如果您的浏览器已经缓存了旧账号，请清除缓存或LocalStorage生效
// =========================================================
const DEFAULT_USERS: UserAccount[] = [
  {
    username: 'admin',
    role: 'admin',
    password: 'nova_admin_2025', // <--- 在这里修改您的管理员密码
    createdAt: Date.now()
  },
  {
    username: 'demo',
    role: 'user',
    password: 'user123', // <--- 在这里修改默认演示账号密码
    createdAt: Date.now()
  }
];

export const authService = {
  // Initialize default users if storage is empty
  init: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      console.log("NOVA AI: 初始化默认账号成功。");
    }
  },

  login: (username: string, password: string): UserAccount | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const users: UserAccount[] = stored ? JSON.parse(stored) : DEFAULT_USERS;
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      // Return user without password
      const { password, ...safeUser } = user;
      return safeUser as UserAccount;
    }
    return null;
  },

  getAllUsers: (): UserAccount[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_USERS;
  },

  createUser: (user: UserAccount): boolean => {
    const users = authService.getAllUsers();
    if (users.find(u => u.username === user.username)) {
      return false; // User exists
    }
    users.push({ ...user, createdAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return true;
  },

  deleteUser: (username: string) => {
    let users = authService.getAllUsers();
    // Prevent deleting the main admin
    if (username === 'admin') return;
    users = users.filter(u => u.username !== username);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
};
