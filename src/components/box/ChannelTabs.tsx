import React from 'react';

interface ChannelTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isPro: boolean;
}

export const ChannelTabs: React.FC<ChannelTabsProps> = ({ activeTab, setActiveTab, isPro }) => {
  const tabs = [
    { id: 'all', label: 'Tous' },
    { id: 'premium', label: 'Premium' },
    { id: 'free', label: 'Gratuits' },
    { id: 'top_rated', label: 'Les mieux notés' },
    { id: 'joined', label: 'Rejoints' },
    { id: 'pinned', label: 'Épinglés' }
  ];

  if (isPro) {
    tabs.push({ id: 'owned', label: 'Mes canaux' });
  }

  return (
    <div className="mb-4">
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-brand-green text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/90'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
