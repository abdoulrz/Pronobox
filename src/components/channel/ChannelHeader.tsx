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
  onOpenMonetization: _onOpenMonetization,
  currentUserId
}) => {
  const [showEnlargedAvatar, setShowEnlargedAvatar] = React.useState(false);
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
        <div 
          onClick={() => setShowEnlargedAvatar(true)}
          className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
          title="Agrandir la photo"
        >
          <img 
            src={channel.avatar} 
            alt={channel.name} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=10b981&color=fff&size=512`;
            }}
          />
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
        <button
          title={canManage ? "Paramètres du canal" : "Informations du canal"}
          onClick={onOpenSettings}
          className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
        >
          {canManage ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Enlarged Avatar Modal */}
      {showEnlargedAvatar && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm cursor-default"
          onClick={(e) => {
            e.stopPropagation();
            setShowEnlargedAvatar(false);
          }}
        >
          <div
            className="relative max-w-sm w-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden p-2 shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEnlargedAvatar(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 p-2 rounded-full z-10 transition"
              title="Fermer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-full aspect-square rounded-xl overflow-hidden shadow-inner mb-3 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              <img
                src={channel.avatar}
                alt={channel.name}
                className="max-w-full max-h-full object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=10b981&color=fff&size=512`;
                }}
              />
            </div>
            <div className="text-center py-2 px-4 w-full">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate">
                {channel.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {channel.members ? (typeof channel.members === 'number' ? channel.members.toLocaleString() : channel.members) : 0} membres
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
