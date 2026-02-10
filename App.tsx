
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Message, ChatState } from './types';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import { sendMessageToGemini } from './services/geminiService';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    error: null,
  });

  // Tạo sectionId duy nhất cho mỗi phiên truy cập
  const sectionId = useMemo(() => {
    return 'zico-session-' + Math.random().toString(36).substring(2, 10);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tối ưu việc điều chỉnh chiều cao
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Khi input rỗng, ép chiều cao về mặc định 76px
      if (input === '') {
        textarea.style.height = '76px';
      } else {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${Math.min(scrollHeight, 200)}px`;
      }
    }
  }, [input]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.isTyping]);

  const handleSendMessage = async () => {
    const messageContent = input.trim();
    if (!messageContent || chatState.isTyping) return;

    // CHIẾN THUẬT XÓA TRIỆT ĐỂ: 
    // 1. Xóa state ngay lập tức
    setInput(''); 
    
    // 2. Ép giá trị DOM về rỗng và reset chiều cao ngay lập tức để người dùng thấy khung trống ngay
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.style.height = '76px';
    }

    // Cập nhật tin nhắn người dùng vào danh sách hiển thị
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
      error: null,
    }));

    try {
      // Xây dựng lịch sử bao gồm cả tin nhắn vừa gửi (vì chatState chưa kịp update do tính async)
      const currentHistory = chatState.messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })).concat([{ role: 'user', parts: [{ text: messageContent }] }]);

      const aiResponse = await sendMessageToGemini(messageContent, currentHistory, sectionId);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isTyping: false,
      }));
    } catch (error: any) {
      setChatState(prev => ({
        ...prev,
        isTyping: false,
        error: error.message || "Kết nối gián đoạn. ZÍCO đang tạm nghỉ.",
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Xử lý phím Enter (không kèm Shift) để gửi tin nhắn
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Ngăn trình duyệt thêm dòng mới vào textarea
      handleSendMessage();
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] flex flex-col text-zinc-300">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-900/5 blur-[140px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-zinc-800/10 blur-[140px] rounded-full"></div>
      </div>

      <Header />

      {/* Message Flow */}
      <main className="flex-1 flex flex-col relative z-10">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 pt-32 pb-[250px] custom-scrollbar"
        >
          <div className="max-w-4xl mx-auto w-full">
            {chatState.messages.length === 0 ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in duration-1000">
                <div className="space-y-4">
                  <h2 className="serif-font text-5xl md:text-7xl text-gradient font-light tracking-tight leading-tight">
                    Hãy luôn nhẹ nhàng với chính mình nhé!
                  </h2>
                  <p className="text-white/20 text-xs md:text-sm uppercase tracking-[0.5em] font-light">
                    Hệ tri thức ZÍCO
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {chatState.messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                
                {chatState.isTyping && (
                  <div className="flex items-center space-x-3 p-6 animate-pulse">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-duration:1s]"></div>
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.2s]"></div>
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.4s]"></div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-medium">ZÍCO đang phản hồi</span>
                  </div>
                )}

                {chatState.error && (
                  <div className="max-w-md mx-auto bg-red-500/5 border border-red-500/10 rounded-2xl p-6 mt-8 text-center backdrop-blur-sm">
                    <p className="text-red-400/80 text-[10px] tracking-[0.3em] uppercase mb-3 font-bold">Gián đoạn hệ thống</p>
                    <p className="text-red-400/60 text-xs italic font-light">{chatState.error}</p>
                    <button 
                      onClick={() => setChatState(p => ({...p, error: null}))}
                      className="mt-5 px-6 py-2 rounded-full bg-white/5 text-[9px] text-white/60 hover:text-white uppercase tracking-[0.2em] transition-all border border-white/5 hover:border-white/20"
                    >
                      Bỏ qua lỗi
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Elegant Fixed Input Area */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="h-24 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent pointer-events-none"></div>
        <div className="bg-[#0a0a0a] pb-10 px-6">
          <div className="max-w-4xl mx-auto w-full">
            <div className="relative glass-panel rounded-[2.5rem] p-1.5 shadow-2xl transition-all duration-500 border-white/5 group focus-within:border-white/10 focus-within:shadow-white/5">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ZÍCO đang lắng nghe bạn..."
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-white/10 text-lg md:text-xl py-6 px-10 resize-none min-h-[76px] max-h-[200px] font-light italic overflow-y-auto"
                style={{ height: '76px' }}
              />
              
              <div className="absolute right-6 bottom-5 flex items-center">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  disabled={!input.trim() || chatState.isTyping}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700
                    ${input.trim() && !chatState.isTyping 
                      ? 'bg-white text-black scale-100 opacity-100 hover:scale-105 shadow-xl shadow-white/10' 
                      : 'bg-white/5 text-white/10 scale-90 opacity-40'}
                  `}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="mt-5 flex justify-between items-center px-4 opacity-40 hover:opacity-80 transition-opacity">
              <span className="text-[9px] uppercase tracking-[0.4em] font-medium text-white/30">Intelligence Interface</span>
              <span className="text-[9px] uppercase tracking-[0.4em] font-medium text-white/30">thezico.haiphong</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
