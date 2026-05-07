import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChannelData } from '../../contexts/ChannelContext';
import LegalContent from '../legal/LegalContent';

// Import refactored components
import { ProNavigation } from './pro/ProNavigation';
import { ProDashboard } from './pro/ProDashboard';
import { ProWallet } from './pro/ProWallet';
import { ProChannelManager } from './pro/ProChannelManager';
import { ProNotifications } from './pro/ProNotifications';
import { ProProfile } from './pro/ProProfile';

const SettingsProUser: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { channelData } = useChannelData();
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  // Compute channels for the logged-in Pro user
  const userChannels = Object.values(channelData?.channelDetails || {}).filter(
    (c) => c.owner?.id === user?.id
  ).map(c => ({
    ...c,
    topContent: c.topContent || [],
    recentActivities: c.recentActivities || []
  }));

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <ProDashboard user={user} userChannels={userChannels} />;
      case 'channels':
        return <ProChannelManager user={user} userChannels={userChannels} />;
      case 'earnings':
        return <ProWallet user={user} updateUser={updateUser as any} />;
      case 'profile':
        return <ProProfile user={user} updateUser={updateUser as any} />;
      case 'notifications':
        return <ProNotifications user={user} updateUser={updateUser as any} />;
      case 'security':
        return (
          <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Sécurité</h3>
            <p className="text-gray-500">Gérez vos mots de passe et la double authentification (2FA).</p>
            {/* Logic for security will go here in the future */}
          </div>
        );
      case 'about':
        return (
          <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Légal & À propos</h3>
            <LegalContent type="terms" onClose={() => {}} />
          </div>
        );
      default:
        return <ProDashboard user={user} userChannels={userChannels} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Profile Summary */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} alt="Profile" className="w-16 h-16 rounded-full border-2 border-green-500 shadow-lg object-cover" />
            <div>
              <h1 className="text-3xl font-black tracking-tight">{user?.username}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 shadow-sm">Compte Pro</span>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Solde actuel</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{(user?.walletBalance || 0).toFixed(2)}€</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <ProNavigation activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* Dynamic Content */}
        <div className="mt-6">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default SettingsProUser;