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
    { id: 'joined', label: 'Rejoints' },
    { id: 'pinned', label: 'Épinglés' }
  ];

  if (isPro) {
    tabs.push({ id: 'owned', label: 'Mes canaux' });
  }

  return (
    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
      <div className="flex space-x-4 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500'
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
