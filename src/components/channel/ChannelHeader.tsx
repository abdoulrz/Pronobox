import React from 'react';
import { Channel, UserFeatures } from '../../types/chat';

interface ChannelHeaderProps {
  channel: Channel;
  onBack: () => void;
  userFunctions: UserFeatures;
  onOpenSettings?: () => void;
  onOpenMonetization?: () => void;
  currentUserId?: string;
}

export const ChannelHeader: React.FC<ChannelHeaderProps> = ({
  channel,
  onBack,
  userFunctions,
  onOpenSettings,
  onOpenMonetization,
  currentUserId
}) => {
  const isOwner = currentUserId && channel.owner?.id === currentUserId;
  const canManage = userFunctions.canManageAllChannels || isOwner;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          title="Retour aux canaux"
          onClick={onBack}
          className="mr-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
          <img src={channel.avatar} alt={channel.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 dark:text-gray-100 flex items-center">
            {channel.name}
            {channel.premium && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Premium
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {typeof channel.members === 'number' ? channel.members.toLocaleString() : channel.members} membres
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {canManage && (
          <button
            title="Paramètres du canal"
            onClick={onOpenSettings}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
        {(userFunctions.canMonetizeContent && isOwner) && (
          <button
            title="Monétisation"
            onClick={onOpenMonetization}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
