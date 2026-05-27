import type { Chat } from '../types/chat';
import { useTheme } from '../context/ThemeContext';

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  setChat: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatList({ chats, activeChatId, setChat, onNewChat, isOpen, onClose }: ChatListProps) {
  const { theme } = useTheme();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 md:w-80 flex flex-col h-screen backdrop-blur-xl border-r border-white/10 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:static md:z-auto
        ${theme === 'dark' ? 'bg-black/80 md:bg-white/5' : 'bg-white/90 md:bg-black/5'}
      `}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4">
          <button
            onClick={onNewChat}
            className={`flex-1 py-3 px-4 border border-white/10 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${theme === 'dark'
              ? 'bg-white/5 hover:bg-white/10 text-white'
              : 'bg-white/10 hover:bg-white/20 text-gray-800'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Chat
          </button>

          <button
            onClick={onClose}
            className={`md:hidden p-2 rounded-lg ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setChat(chat.id)}
              className={`w-full text-left p-4 rounded-2xl transition-all duration-200 group relative overflow-hidden ${activeChatId === chat.id
                ? 'bg-linear-to-r from-[#FFA240] to-[#FF4646] text-white shadow-lg shadow-orange-500/20'
                : theme === 'dark'
                  ? 'hover:bg-white/5 text-gray-300'
                  : 'hover:bg-white/10 text-gray-700'
                }`}
            >
              <div className="flex items-center gap-3 relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 opacity-70">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <span className="truncate font-medium">{chat.title}</span>
              </div>
            </button>
          ))}
        </div>

        <div className={`p-4 border-t border-white/10 text-[10px] text-center font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
          MAX CORE v1.0
        </div>
      </div>
    </>
  );
}
