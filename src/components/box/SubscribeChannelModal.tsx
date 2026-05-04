import React from 'react';
import { Channel } from '../../types/chat';

interface SubscribeChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel | null;
  onSubscribe: () => void;
  isProcessing: boolean;
}

export const SubscribeChannelModal: React.FC<SubscribeChannelModalProps> = ({
  isOpen,
  onClose,
  channel,
  onSubscribe,
  isProcessing
}) => {
  if (!isOpen || !channel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-xs mx-4 overflow-hidden">
        <div className="relative px-3 py-2 bg-yellow-600 text-white">
          <h3 className="text-base font-medium">S'abonner au canal</h3>
          <p className="text-xs opacity-90">{channel.name}</p>
          <button
            title="Fermer"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:text-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-3">
          <div className="mb-3">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md text-center">
              <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                {channel.price}€
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">par mois</div>
            </div>
          </div>
          <ul className="text-xs space-y-1 mb-4">
            <li className="flex items-start">
              <span className="text-green-500 mr-1">✓</span>
              <span>Pronostics premium</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-1">✓</span>
              <span>Analyses détaillées</span>
            </li>
          </ul>
        </div>
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/30 flex justify-between">
          <button onClick={onClose} className="px-2 py-1 text-xs text-gray-700 border border-gray-300 rounded-md">
            Retour
          </button>
          <button
            onClick={onSubscribe}
            disabled={isProcessing}
            className="px-2 py-1 bg-yellow-600 text-white rounded-md text-xs font-medium"
          >
            {isProcessing ? 'Traitement...' : `S'abonner`}
          </button>
        </div>
      </div>
    </div>
  );
};
