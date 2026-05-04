import React from 'react';
import { Channel } from '../../types/chat';

interface ChannelListItemProps {
  channel: Channel;
  currentUserId: string | number;
  isPro: boolean;
  onOpen: (id: string | number) => void;
  onTogglePin: (id: string | number) => void;
  onJoin: (channel: Channel) => void;
  isProcessingJoin: boolean;
  isEditing: boolean;
  onToggleEdit: (id: string | number) => void;
  channelFeatures: Record<string | number, unknown>;
  onFeatureToggle: (id: string | number, feature: string) => void;
}

export const ChannelListItem: React.FC<ChannelListItemProps> = ({
  channel,
  currentUserId,
  isPro,
  onOpen,
  onTogglePin,
  onJoin,
  isProcessingJoin,
  isEditing,
  onToggleEdit,
  channelFeatures,
  onFeatureToggle
}) => {
  const features = (channelFeatures[channel.id] || {}) as Record<string, boolean>;
  return (
    <div
      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
      onClick={() => onOpen(channel.id)}
    >
      <div className="flex items-start">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0 border border-gray-200 dark:border-gray-600">
          <img
            src={channel.avatar}
            alt={channel.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-medium truncate dark:text-white">
              {channel.name}
              {channel.premium && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                  Premium
                </span>
              )}
              {channel.owner && channel.owner.id === currentUserId && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                  Propriétaire
                </span>
              )}
            </h3>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">12:45</span>
              {channel.joined && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(channel.id);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mr-2"
                  title={channel.pinned ? 'Désépingler' : 'Épingler'}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ${channel.pinned ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}
                    fill={channel.pinned ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </button>
              )}
              {isPro && (channel.owner?.id === currentUserId || isEditing) && (
                <button
                  title="Modifier le canal"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleEdit(channel.id);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
            {channel.lastMessage || 'Aucun message'}
          </p>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {channel.members.toLocaleString()} membres
              </span>
              {channel.premium && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  {channel.price}€/mois
                </span>
              )}
            </div>
            {channel.joined ? (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                Rejoint
              </span>
            ) : isPro ? (
              <button
                className="px-3 py-1 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin(channel);
                }}
                disabled={isProcessingJoin}
              >
                Accès Pro
              </button>
            ) : (
              <button
                className={`px-3 py-1 rounded-full ${channel.premium ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white text-xs font-medium flex items-center`}
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin(channel);
                }}
                disabled={isProcessingJoin}
              >
                {isProcessingJoin ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Traitement...</span>
                  </>
                ) : channel.premium ? (
                  "S'abonner"
                ) : (
                  'Rejoindre'
                )}
              </button>
            )}
          </div>

          {isEditing && isPro && channel.owner?.id === currentUserId && (
            <div
              className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Gestion du canal
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Messages vocaux
                    </p>
                  </div>
                  <label className="relative inline-block w-10 h-6 cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      title="Messages vocaux"
                      checked={features.voiceMessages || false}
                      onChange={() => onFeatureToggle(channel.id, 'voiceMessages')}
                    />
                    <div className="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Commentaires
                    </p>
                  </div>
                  <label className="relative inline-block w-10 h-6 cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      title="Commentaires"
                      checked={features.comments || false}
                      onChange={() => onFeatureToggle(channel.id, 'comments')}
                    />
                    <div className="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
