import React from 'react';
interface ChannelLeaveConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  channelName: string;
}
const ChannelLeaveConfirmation: React.FC<ChannelLeaveConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  channelName
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-lg">
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Quitter le canal
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Êtes-vous sûr de vouloir quitter le canal{' '}
            <span className="font-medium">{channelName}</span> ? Vous n'aurez
            plus accès aux discussions et aux contenus partagés.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={onClose}>

              Annuler
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              onClick={() => {
                onConfirm();
                onClose();
              }}>

              Quitter
            </button>
          </div>
        </div>
      </div>
    </div>);

};
export default ChannelLeaveConfirmation;