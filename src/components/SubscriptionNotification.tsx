import React, { useEffect } from 'react';
interface SubscriptionNotificationProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}
const SubscriptionNotification: React.FC<SubscriptionNotificationProps> = ({
  isOpen,
  message,
  onClose
}) => {
  // Fermeture automatique après 5 secondes
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 flex items-start">
        <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-800 p-2 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-yellow-600 dark:text-yellow-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />

          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Notification d'abonnement
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-500">

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12" />

          </svg>
        </button>
      </div>
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex justify-end">
        <button
          type="button"
          className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
          onClick={onClose}>

          Compris
        </button>
      </div>
    </div>);

};
export default SubscriptionNotification;