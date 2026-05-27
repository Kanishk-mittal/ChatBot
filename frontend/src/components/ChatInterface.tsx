import { useState, useRef, useEffect } from 'react';
import type { Message } from '../types/chat';
import { useTheme } from '../context/ThemeContext';
import { listModels } from '../api/api';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string, model?: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function ChatInterface({ messages, onSendMessage, isLoading = false, error = null }: ChatInterfaceProps) {
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch available models on mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const availableModels = await listModels();
        setModels(availableModels);
        // Set first model as default
        if (availableModels.length > 0) {
          setSelectedModel(availableModels[0]);
        }
      } catch (err) {
        console.error('Failed to fetch models:', err);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim(), selectedModel);
      setInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FFD41D] via-[#FFA240] to-[#FF4646] flex items-center justify-center shadow-lg mb-6">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5-1.338c1.47.851 3.179 1.338 5 1.338 5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.477 0-2.864-.395-4.062-1.082l-2.938.784.784-2.938A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
                <circle cx="8" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="16" cy="12" r="1.5" />
              </svg>
            </div>
            <h2 className={`text-2xl font-black mb-2 italic uppercase ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>New Session</h2>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ask MAX anything to start the conversation.</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`flex ${msg.type === 'User' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] p-4 md:p-6 rounded-[2rem] shadow-lg ${msg.type === 'User'
                ? 'bg-gradient-to-br from-[#FFA240] to-[#FF4646] text-white rounded-tr-none'
                : `backdrop-blur-md border border-white/20 rounded-tl-none ${theme === 'dark' ? 'bg-white/10 text-gray-100' : 'bg-white text-gray-800'
                }`
                }`}
            >
              <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                {msg.message}
              </div>
            </div>
          </div>
        ))}        {error && (
          <div className="flex justify-center">
            <div className="max-w-[85%] md:max-w-[70%] p-4 md:p-6 rounded-[2rem] bg-red-500/20 border border-red-500/50 text-red-600 dark:text-red-400">
              <div className="text-sm md:text-base font-medium">
                {error}
              </div>
            </div>
          </div>
        )}        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-2 md:p-8 bg-transparent">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto group flex flex-col md:flex-row gap-2 md:gap-3 items-stretch md:items-end">
          {/* Model Selector */}
          <div className="flex-shrink-0 w-full md:w-auto">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isLoading || loadingModels}
              style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
              className={`w-full px-4 py-3 md:py-4 rounded-[1.5rem] border transition-all shadow-lg backdrop-blur-2xl focus:outline-none focus:ring-4 focus:ring-[#FFA240]/20 ${theme === 'dark'
                ? 'bg-gray-900 border-gray-700 text-white'
                : 'bg-white/90 border-white/20 text-gray-800'
                } disabled:opacity-50 text-sm md:text-base`}
            >
              {loadingModels ? (
                <option>Loading models...</option>
              ) : models.length === 0 ? (
                <option>No models available</option>
              ) : (
                models.map((model) => (
                  <option key={model} value={model}>
                    {model.split('/').pop() || model}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Input + Button Row */}
          <div className="flex gap-2 md:gap-3 items-end flex-1">
            {/* Input Field */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask MAX..."
              className={`flex-1 min-w-0 p-3 md:p-4 backdrop-blur-2xl border transition-all shadow-2xl rounded-[1.5rem] placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#FFA240]/20 text-sm md:text-base ${theme === 'dark'
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-white/90 border-white/20 text-gray-800'
                }`}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 p-3 md:px-4 md:py-4 md:aspect-square bg-gradient-to-br from-[#FFD41D] via-[#FFA240] to-[#FF4646] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all group-hover:shadow-orange-500/30"
            >
              {isLoading ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6 animate-spin">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0c4.418 0 8 3.582 8 8s-3.582 8-8 8v-8a8 8 0 00-8 8z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
