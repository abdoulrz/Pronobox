import React, { useState } from 'react';
import { Channel, UserFeatures } from '../../types/chat';

interface ChannelHeaderProps {
  channel: Channel;
  onBack: () => void;
  userFunctions: UserFeatures;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onShare: (platform: string) => void;
  onLeave: () => void;
  onOpenSettings?: () => void;
  onOpenMonetization?: () => void;
  currentUserId?: string;
}

export const ChannelHeader: React.FC<ChannelHeaderProps> = ({
  channel,
  onBack,
  userFunctions,
  notificationsEnabled,
  onToggleNotifications,
  onShare,
  onLeave,
  onOpenSettings,
  onOpenMonetization,
  currentUserId
}) => {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const isOwner = currentUserId && channel.owner?.id === currentUserId;
  const canManage = userFunctions.canManageAllChannels || isOwner;

  const handleShare = (platform: string) => {
    onShare(platform);
    setShowShareMenu(false);
    setShowOptionsMenu(false);
  };

  const handleLeave = () => {
    onLeave();
    setShowOptionsMenu(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          title="Retour aux canaux"
          onClick={onBack}
          className="mr-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
          <img
            src={channel.avatar}
            alt={channel.name}
            className="w-full h-full object-cover"
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
            {channel.members.toLocaleString()} membres
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        )}
        {(userFunctions.canMonetizeContent && isOwner) && (
          <button
            title="Monétisation"
            onClick={onOpenMonetization}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        )}
        <div className="relative">
          <button
            title="Plus d'options"
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          </button>
          {showOptionsMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
              <div className="py-1">
                <button
                  title={notificationsEnabled ? 'Désactiver les notifications' : 'Activer les notifications'}
                  onClick={() => {
                    onToggleNotifications();
                    setShowOptionsMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 mr-2 ${notificationsEnabled ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.342L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {notificationsEnabled ? 'Désactiver les notifications' : 'Activer les notifications'}
                </button>
                <div className="relative">
                  <button
                    title="Partager le lien"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    Partager le lien
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  {showShareMenu && (
                    <div className="absolute left-full top-0 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 ml-1">
                      <div className="py-1">
                        {['twitter', 'facebook', 'whatsapp', 'telegram', 'copy'].map((platform) => (
                          <button
                            key={platform}
                            title={`Partager sur ${platform}`}
                            onClick={() => handleShare(platform)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <span className="capitalize">{platform}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                  <button
                    title="Quitter le canal"
                    onClick={handleLeave}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Quitter le canal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
