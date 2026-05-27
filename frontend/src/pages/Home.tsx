import { useState, useEffect } from 'react';
import type { UserProfile } from '../types/user';
import type { Chat, Message, NewChatResponse } from '../types/chat';
import ChatList from '../components/ChatList';
import ChatInterface from '../components/ChatInterface';
import ThemeToggle from '../components/ThemeToggle';
import LogoutButton from '../components/LogoutButton';
import { useTheme } from '../context/ThemeContext';
import { createChat, sendMessage, listChats, getChatMessages } from '../api/api';

interface HomeProps {
  user: UserProfile;
  onLogout: () => void;
}

export default function Home({ user, onLogout }: HomeProps) {
  const { theme } = useTheme();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]); // This will hold messages for the active chat
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userChats = await listChats();
        setChats(userChats);
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (activeChatId) {
        try {
          const chatMessages = await getChatMessages(activeChatId);
          setMessages(chatMessages);
        } catch (error) {
          console.error('Failed to fetch messages:', error);
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    };

    fetchMessages();
  }, [activeChatId]);

  const handleSendMessage = async (text: string, model?: string) => {
    const userMessageId = Date.now().toString();
    setMessages([...messages, { id: userMessageId, type: 'User', message: text }]);
    setIsLoading(true);
    setError(null);
    try {
      if (!activeChatId) {
        // sending request to backend to create a new chat and get the first response
        const response: NewChatResponse = await createChat(text, model);

        // add the response to the messages and set the new chat as active
        setIsLoading(false);
        const aiMessageId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: aiMessageId, type: 'AI', message: response.reply }]);

        // adding this to the list of chats 
        setChats(prev => [
          {
            id: response.chatID,
            title: response.title,
            lastAccessed: new Date().toISOString(),
            userId: user?.sub || '', // Google uses 'sub' as unique ID
            messages: []
          },
          ...prev
        ]);

        // setting this chat as active
        setActiveChatId(response.chatID);
      } else {
        const response: string = await sendMessage(activeChatId, text, model);
        setIsLoading(false);
        const aiMessageId = Date.now().toString();
        setMessages(prev => [...prev, { id: aiMessageId, type: 'AI', message: response }]);

        // Update the last accessed time for the active chat
        setChats(chats.map(chat => chat.id === activeChatId ? { ...chat, lastAccessed: new Date().toISOString() } : chat));
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'There was some error generating this response';
      setError(errorMessage);
    }
  };

  const handleNewChat = () => {
    // Simply set activeChatId as empty string to reset the view for a new chat
    setActiveChatId('');
    setMessages([]); // Clear messages for the new chat
    setIsSidebarOpen(false);
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-all duration-700 font-sans ${theme === 'dark'
      ? 'bg-black'
      : 'bg-linear-to-br from-[#FFCC99] via-[#FFB366] to-[#FFA240]'
      }`}>

      {/* Sidebar - Chat List */}
      <ChatList
        chats={chats}
        activeChatId={activeChatId}
        setChat={(id) => {
          setActiveChatId(id);
          setIsSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content - Chat Interface */}
      <div className="flex-1 flex flex-col relative z-10 min-h-0">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-white/10 backdrop-blur-md bg-white/5 relative z-20">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`md:hidden p-2 rounded-lg ${theme === 'dark' ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-black/5'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#FFD41D] via-[#FFA240] to-[#FF4646] flex items-center justify-center shadow-lg shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5-1.338c1.47.851 3.179 1.338 5 1.338 5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.477 0-2.864-.395-4.062-1.082l-2.938.784.784-2.938A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
                <circle cx="8" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="16" cy="12" r="1.5" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h2 className={`text-xl font-black uppercase italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                M<span className={theme === 'dark' ? 'text-[#FFA240]' : 'text-[#FF4646]'}>AX</span>
              </h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                {activeChatId ? (chats.find(c => c.id === activeChatId)?.title || 'Conversation') : 'New Session'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <div className="h-8 w-px bg-white/10 mx-1 md:mx-2"></div>
            <div className="flex items-center gap-2 md:gap-3">
              <img src={user.picture} alt="" className="w-8 h-8 rounded-full border-2 border-[#FFA240] shrink-0" />
              <LogoutButton onLogout={onLogout} className={`py-2 px-3 md:px-4 text-[10px] md:text-xs font-bold uppercase tracking-widest border-none rounded-lg transition-all ${theme === 'dark'
                ? 'bg-white/5 hover:bg-white/10 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-800'
                }`} />
            </div>
          </div>
        </header>

        {/* Chatting Interface */}
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          error={error}
        />

        {isLoading && (
          <div className={`absolute bottom-32 left-4 md:left-10 text-[10px] md:text-xs font-bold text-[#FFA240] animate-pulse uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md ${theme === 'dark' ? 'bg-white/5' : 'bg-black/10'}`}>
            MAX is thinking...
          </div>
        )}
      </div>
    </div>
  );
}
