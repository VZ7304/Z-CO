
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-10 message-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[90%] md:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && (
          <div className="flex items-center space-x-2 mb-3 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-semibold">ZÍCO</span>
          </div>
        )}
        <div className={`
          px-7 py-5 rounded-2xl leading-relaxed transition-all duration-300
          ${isUser 
            ? 'bg-white/5 border border-white/10 text-white/90 font-light text-sm shadow-sm' 
            : 'bg-transparent text-white font-light text-lg md:text-xl border-l border-white/10 ml-2'}
        `}>
          {message.content.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-3' : ''}>{line}</p>
          ))}
        </div>
        {isUser && (
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/20 mt-3 mr-1 font-medium">Bạn</span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
