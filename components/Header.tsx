
import React from 'react';

interface HeaderProps {
  onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-8 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
      <div className="flex items-center space-x-3 pointer-events-auto">
        <button 
          onClick={onReset}
          className="flex items-center space-x-3 group transition-all duration-500 hover:opacity-80 active:scale-95"
          title="Bắt đầu cuộc hội thoại mới"
        >
          <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:border-white/30 group-hover:bg-white/10 transition-all">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse group-hover:bg-white/70"></div>
          </div>
          <h1 className="serif-font text-xl tracking-[0.4em] font-medium text-gradient uppercase transition-all">
            VINCANZO ZÍCO
          </h1>
        </button>
      </div>
      
      <div className="flex items-center space-x-4 opacity-30 hover:opacity-100 transition-opacity pointer-events-auto">
        <button className="text-white hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
