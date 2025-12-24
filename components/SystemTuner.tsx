import React, { useState } from 'react';
import { generateTextResponse } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const SystemTuner: React.FC = () => {
  const [systemPrompt, setSystemPrompt] = useState(
    '你是一位资深的工业设计顾问与产品经理。你的任务是针对用户的设计需求提供专业的可行性分析、材料建议以及美学指导。请以专业、简洁且富有建设性的语气回答。'
  );
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', text: input };
    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Convert UI history to API history format
      const apiHistory = history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }));

      const responseText = await generateTextResponse(userMsg.text, systemPrompt, apiHistory);
      
      setHistory(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setHistory(prev => [...prev, { role: 'model', text: '生成响应出错。请检查 API Key 或配额。' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Configuration Panel */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shrink-0">
        <label className="block text-sm font-medium text-gray-300 mb-2">系统指令定义 (System Instruction / GEM Definition)</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-24"
          placeholder="定义该 GEM 的角色设定、规则以及业务场景..."
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm italic">
              开始测试你的 GEM 指令... <br/> (例如: "帮我评估一下这个咖啡机的设计方案")
            </div>
          )}
          {history.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-200'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="bg-gray-700 text-gray-400 rounded-lg p-3 text-sm animate-pulse">
                 Gemini 3 Pro 正在思考中...
               </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700 bg-gray-850">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入测试内容..."
              className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
