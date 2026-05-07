import React from 'react';

interface ProNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const ProNavigation: React.FC<ProNavigationProps> = ({ activeSection, onSectionChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
    { id: 'channels', label: 'Mes Canaux', icon: '📺' },
    { id: 'earnings', label: 'Portefeuille', icon: '💳' },
    { id: 'profile', label: 'Profil', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Sécurité', icon: '🔒' },
    { id: 'about', label: 'Légal & À propos', icon: '⚖️' },
  ];

  return (
    <div className="flex overflow-x-auto gap-2 p-2 mb-6 bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 dark:border-gray-700/30 hide-scrollbar sticky top-0 z-10">
      {navItems.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`
              flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap rounded-xl transition-all duration-300 ease-out
              ${isActive 
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300 shadow-inner border border-green-500/30' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-gray-700/40 hover:text-gray-900 dark:hover:text-white border border-transparent'}
            `}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
