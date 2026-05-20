import React from 'react';
import Header from './Header';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    // Theme-aware background
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-brand-navy overflow-hidden transition-colors duration-300">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar spacer — Navigation is fixed, so we just add left padding on desktop */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 md:pl-16 bg-slate-100 dark:bg-brand-navy transition-colors duration-300">
          {children}
        </main>
      </div>

      <Navigation />
    </div>
  );
};

export default Layout;