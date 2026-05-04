import React, { useState } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import BetEduc from './BetEduc';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showBetEduc, setShowBetEduc] = useState(false);

  return (
    // Theme-aware background
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-brand-navy overflow-hidden transition-colors duration-300">
      <Header onBetEducClick={() => setShowBetEduc(!showBetEduc)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar spacer — Navigation is fixed, so we just add left padding on desktop */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 md:pl-16 bg-slate-100 dark:bg-brand-navy transition-colors duration-300">
          {children}
        </main>
      </div>

      <Navigation />

      {/* BET-EDUC Slide-over Panel */}
      {showBetEduc && (
        <div
          className="beted-overlay fixed inset-0 z-50 flex justify-end"
          onClick={(e) => {
            // Close on backdrop click
            if (e.target === e.currentTarget) setShowBetEduc(false);
          }}
        >
          <div className="beted-panel w-full max-w-sm h-full overflow-y-auto">
            <BetEduc onClose={() => setShowBetEduc(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;