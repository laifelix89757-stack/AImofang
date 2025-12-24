import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DesignStudio } from './components/DesignStudio';
import { AdminPanel } from './components/AdminPanel';
import { LoginScreen } from './components/LoginScreen';
import { ModuleConfig, ModelType, UserProfile } from './types';
import { authService } from './services/authService';

// Default Modules Data (Initial State)
const DEFAULT_MODULES: ModuleConfig[] = [
  {
    id: 'concept_design',
    name: '外观概念设计',
    icon: '🎨',
    description: '通过双图融合（风格+形态）生成创意产品方案。',
    model: ModelType.GEMINI_3_PRO_IMAGE,
    inputCount: 2,
    inputLabels: ['材质风格参考图', '产品形态参考图'],
    systemInstruction: '你是一位先锋工业设计师。请分析第一张图片的材质与风格，以及第二张图片的产品形态。将第一张图片的风格特征完美迁移到第二张图片的产品结构上，生成一张高质量、写实的产品渲染图。保持透视和光影的自然统一。'
  },
  {
    id: 'sketch_render',
    name: '草图生成渲染',
    icon: '✏️',
    description: '将手绘草图转化为逼真的产品渲染图。',
    model: ModelType.GEMINI_3_PRO_IMAGE,
    inputCount: 1,
    inputLabels: ['手绘草图'],
    systemInstruction: '你是一位精通渲染的工业设计师。用户将提供一张线稿草图。请根据用户的提示词描述（如材质、颜色、表面处理），将此草图渲染为照片级真实的产品图。保留草图的原始线条结构，但赋予其真实的体积感和光影细节。'
  },
  {
    id: 'variant_gen',
    name: '方案变款生成',
    icon: '✨',
    description: '基于现有产品图进行CMF变款或细节微调。',
    model: ModelType.GEMINI_2_5_FLASH_IMAGE, // Fast model for editing
    inputCount: 1,
    inputLabels: ['原始效果图'],
    systemInstruction: '你是一位产品CMF专家。请严格遵循用户的指令对上传的图片进行编辑。只修改用户指定的区域或属性（如颜色、材质、背景），保持其他部分不变。输出高质量的图像。'
  },
  {
    id: 'scene_comp',
    name: '场景图合成',
    icon: '🏞️',
    description: '将产品融入特定场景，生成营销海报级图像。',
    model: ModelType.GEMINI_3_PRO_IMAGE,
    inputCount: 2,
    inputLabels: ['产品白底图', '场景/背景参考图'],
    systemInstruction: '你是一位专业的广告合成师。用户提供了一张产品图和一张场景图。请将该产品自然地融入到场景中。调整产品的光影、色调和透视，使其与背景环境完美匹配。产品应作为视觉焦点。'
  },
  {
    id: 'ecommerce_detail',
    name: '电商详情页生成',
    icon: '🛍️',
    description: '自动生成带有卖点展示的电商详情页视觉图。',
    model: ModelType.GEMINI_3_PRO_IMAGE,
    inputCount: 1,
    inputLabels: ['产品主图'],
    systemInstruction: '你是一位资深电商设计师。请基于上传的产品图片，设计一张极具吸引力的电商详情页海报。提取产品的主要视觉特征，配以简洁的高级感背景。画面风格需要符合高端消费电子产品的调性。'
  }
];

const App: React.FC = () => {
  // Session State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // App Data State
  const [modules, setModules] = useState<ModuleConfig[]>(DEFAULT_MODULES);
  const [activeModuleId, setActiveModuleId] = useState<string>(DEFAULT_MODULES[0].id);

  // Initialize Auth
  useEffect(() => {
    authService.init();
  }, []);

  const handleLogin = (userProfile: UserProfile) => {
    setUser(userProfile);
    if (userProfile.role === 'admin') {
      setIsAdminMode(true);
    }
  };

  const handleUpdateModule = (id: string, updates: Partial<ModuleConfig>) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const activeModule = modules.find(m => m.id === activeModuleId) || modules[0];

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-gray-100 font-sans">
      <Sidebar 
        user={user}
        modules={modules} 
        activeModuleId={activeModuleId} 
        onSelectModule={(id) => {
          setActiveModuleId(id);
          setIsAdminMode(false); // Switch back to user view when selecting a module
        }}
        onOpenAdmin={() => setIsAdminMode(true)}
        onLogout={() => {
          setUser(null);
          setIsAdminMode(false);
        }}
      />
      
      <main className="flex-1 h-full overflow-hidden flex flex-col relative bg-gray-950">
        {/* Top Watermark */}
        <div className="absolute top-0 right-0 p-4 z-0 opacity-10 pointer-events-none select-none">
          <span className="text-8xl font-black text-white">NOVA</span>
        </div>

        <div className="flex-1 h-full overflow-hidden relative z-10">
          {isAdminMode ? (
            <AdminPanel 
              modules={modules}
              onUpdateModule={handleUpdateModule}
              onClose={() => setIsAdminMode(false)}
            />
          ) : (
            <div className="p-6 h-full">
              <DesignStudio moduleConfig={activeModule} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
