import React, { useState, useEffect } from 'react';
import { ModuleConfig, ModelType } from '../types';
import { generateConceptDesign, editImage } from '../services/geminiService';
import { ImageUploader } from './ImageUploader';
import { securityService } from '../services/securityService';

interface DesignStudioProps {
  moduleConfig: ModuleConfig;
}

export const DesignStudio: React.FC<DesignStudioProps> = ({ moduleConfig }) => {
  const [image1, setImage1] = useState<string | null>(null);
  const [image2, setImage2] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // API Key State
  const [isReadyToGenerate, setIsReadyToGenerate] = useState(false);

  // Helper: Is this a managed environment?
  // We check this directly from storage to determine UI state
  const isManagedMode = !!(localStorage.getItem(securityService.STORAGE_KEY) || localStorage.getItem('nova_global_api_key'));

  // Reset state when module changes
  useEffect(() => {
    setImage1(null);
    setImage2(null);
    setPrompt('');
    setGeneratedImage(null);
    setError(null);
  }, [moduleConfig.id]);

  // Check for Global Key OR IDX Key availability
  useEffect(() => {
    const checkAvailability = async () => {
      // 1. Check Global Secure Key (Managed Mode)
      if (isManagedMode) {
        setIsReadyToGenerate(true);
        return;
      }

      // 2. Check IDX Environment Key
      try {
        if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          setIsReadyToGenerate(hasKey);
        }
      } catch (e) {
        console.warn("Failed to check API key status", e);
      }
    };
    checkAvailability();
  }, [isManagedMode]);

  const handleSelectApiKey = async () => {
    try {
      if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        setIsReadyToGenerate(true);
        setError(null);
      }
    } catch (e) {
      console.error("Failed to select API key", e);
      setError("无法打开 API Key 选择窗口");
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    
    if (!isReadyToGenerate) {
      setError("系统未配置 API Key。请联系管理员配置全局 Key，或自行连接。");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      let result = '';
      
      // Validation based on module config
      if (moduleConfig.inputCount >= 1 && !image1) throw new Error("请上传第一张图片。");
      if (moduleConfig.inputCount === 2 && !image2) throw new Error("请上传第二张图片。");

      // Logic routing based on Model Type
      if (moduleConfig.model === ModelType.GEMINI_2_5_FLASH_IMAGE) {
        // Flash Image is usually for editing or fast generation
        result = await editImage(image1!, prompt, moduleConfig.systemInstruction);
      } else {
        // Pro Image handles complex logic
        const images = [];
        if (image1) images.push(image1);
        if (image2) images.push(image2);
        
        result = await generateConceptDesign(
          prompt, 
          images, 
          moduleConfig.model, 
          moduleConfig.systemInstruction
        );
      }

      setGeneratedImage(result);
    } catch (err: any) {
      const msg = err.message || "图片生成失败。";
      
      // Handle permission errors
      if (msg.includes("403") || msg.includes("PERMISSION_DENIED") || msg.includes("API key not valid")) {
         if (isManagedMode) {
           // If managed mode, do NOT show "Configure Key" button, just show error
           setError("企业授权校验失败 (403)。请联系管理员检查后台 API Key 配置或配额。");
         } else {
           setIsReadyToGenerate(false);
           setError("权限不足 (403)。请点击下方按钮连接您的 API Key。");
         }
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header with Status Badge */}
      <div className="mb-2 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">{moduleConfig.name}</h2>
          <p className="text-gray-400 text-sm">{moduleConfig.description}</p>
        </div>
        {isManagedMode && (
          <div className="flex items-center gap-2 bg-green-900/30 border border-green-700/50 px-3 py-1 rounded-full shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-green-400">企业授权已激活 (Managed)</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        
        {/* Left Panel: Inputs */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 pb-20 custom-scrollbar">
          
          <ImageUploader 
            label={moduleConfig.inputLabels[0] || "上传图片 1"} 
            image={image1} 
            onImageUpload={setImage1} 
            onClear={() => setImage1(null)}
          />

          {moduleConfig.inputCount === 2 && (
            <ImageUploader 
              label={moduleConfig.inputLabels[1] || "上传图片 2"} 
              image={image2} 
              onImageUpload={setImage2} 
              onClear={() => setImage2(null)}
            />
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-300">
              需求描述 (Prompt)
            </label>
            <textarea
              className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
              placeholder={moduleConfig.defaultPrompt || "请描述您的设计需求..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {/* Conditional Rendering for API Key Button */}
          {/* Only show the 'Configure Key' button if NOT in managed mode and NOT ready */}
          {!isReadyToGenerate && !isManagedMode ? (
             <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 flex flex-col gap-2">
               <p className="text-xs text-yellow-200">
                 使用高级模型需要连接付费项目 API Key。
               </p>
               <button
                 onClick={handleSelectApiKey}
                 className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold text-sm transition-colors"
               >
                 配置 API Key
               </button>
             </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                loading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-900/20'
              }`}
            >
              {loading ? 'Nova AI 正在计算...' : '立即生成'}
            </button>
          )}
          
          {error && (
            <div className={`p-3 border rounded-lg break-words text-xs ${
              isManagedMode ? 'bg-red-900/30 border-red-800 text-red-200' : 'bg-red-900/50 border-red-700 text-red-200'
            }`}>
              {error}
            </div>
          )}
        </div>

        {/* Right Panel: Output */}
        <div className="flex-1 bg-gray-800/50 rounded-xl border border-gray-700 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
           {generatedImage ? (
             <div className="relative w-full h-full p-4 flex items-center justify-center group">
               <img 
                 src={generatedImage} 
                 alt="Generated Result" 
                 className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
               />
               <a 
                 href={generatedImage} 
                 download={`nova-ai-${moduleConfig.id}-${Date.now()}.png`}
                 className="absolute bottom-6 right-6 bg-white text-black px-4 py-2 rounded-lg font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 下载结果
               </a>
             </div>
           ) : (
             <div className="text-center p-8">
                {loading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 animate-pulse">
                      AI 正在根据系统指令进行设计运算...
                    </p>
                  </div>
                ) : (
                  <div className="text-gray-600 flex flex-col items-center">
                    <span className="text-4xl mb-4">✨</span>
                    <p>等待任务提交</p>
                    {isManagedMode && <p className="text-xs text-green-500 mt-2">企业云端计算资源就绪</p>}
                  </div>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};