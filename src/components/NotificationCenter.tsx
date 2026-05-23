import React, { useEffect, useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
const NotificationCenter: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const {
    notifications,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    unreadCount
  } = useNotifications();
  const navigate = useNavigate();
  useEffect(() => {
    // Close notifications panel when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
      showNotifications &&
      !target.closest('.notification-panel') &&
      !target.closest('.notification-button'))
      {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);
  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    // Si la notification a un lien de redirection
    if (notification.linkTo) {
      navigate(notification.linkTo);
    }
    // Si c'est une notification de débat et qu'elle a un ID de débat
    if (
    ['new_debate', 'new_comment', 'like', 'reply'].includes(
      notification.type
    ) &&
    notification.debateId)
    {
      navigate(`/box`, {
        state: {
          activeDebateId: notification.debateId,
          activeTab: 'news' // or whichever tab shows debates in Box.tsx
        }
      });
    } else if (notification.matchId) {
      navigate(`/match/${notification.matchId}`);
    } else if (notification.channelId) {
      navigate(`/channel/${notification.channelId}`);
    }
    setShowNotifications(false);
  };
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <div className="w-2 h-2 rounded-full bg-green-500"></div>;
      case 'info':
        return <div className="w-2 h-2 rounded-full bg-blue-500"></div>;
      case 'warning':
        return <div className="w-2 h-2 rounded-full bg-yellow-500"></div>;
      case 'error':
        return <div className="w-2 h-2 rounded-full bg-red-500"></div>;
      case 'subscription':
        return <div className="w-2 h-2 rounded-full bg-purple-500"></div>;
      case 'new_debate':
        return <div className="w-2 h-2 rounded-full bg-green-600"></div>;
      case 'new_comment':
        return <div className="w-2 h-2 rounded-full bg-blue-600"></div>;
      case 'like':
        return <div className="w-2 h-2 rounded-full bg-red-500"></div>;
      case 'reply':
        return <div className="w-2 h-2 rounded-full bg-orange-500"></div>;
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-500"></div>;
    }
  };
  return (
    <div className="relative">
      <button
        className="notification-button p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200 focus:outline-none relative"
        onClick={() => setShowNotifications(!showNotifications)}
        title="Notifications">

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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />

        </svg>
        {unreadCount > 0 &&
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        }
      </button>
      {showNotifications &&
      <div className="notification-panel absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Notifications
            </h3>
            {unreadCount > 0 &&
          <button
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            onClick={markAllAsRead}>

                Tout marquer comme lu
              </button>
          }
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ?
          notifications.map((notification) =>
          <div
            key={notification.id}
            className={`p-3 border-b border-gray-100 dark:border-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''} cursor-pointer`}
            onClick={() => handleNotificationClick(notification)}>

                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-2 flex-1">
                        {notification.avatar &&
                  <div className="flex items-center mb-1">
                            <img
                      src={notification.avatar}
                      alt={notification.user || ''}
                      className="w-5 h-5 rounded-full mr-1.5 object-cover border border-gray-200" />

                            <span className="text-xs font-medium text-gray-700">
                              {notification.user}
                            </span>
                          </div>
                  }
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}>

                        <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
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
                  </div>
                </div>
          ) :

          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Aucune notification
              </div>
          }
          </div>
        </div>
      }
    </div>);

};
export default NotificationCenter;