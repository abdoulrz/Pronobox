import React, { useEffect, useState, createContext, useContext } from 'react';
export type NotificationType =
'info' |
'success' |
'warning' |
'error' |
'subscription' |
'new_debate' |
'new_comment' |
'like' |
'reply';
export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: NotificationType;
  user?: string;
  avatar?: string;
  debateId?: number;
  linkTo?: string;
}
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  unreadCount: number;
}
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
};
export const NotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Charger les notifications depuis le localStorage au démarrage
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const savedNotifications = localStorage.getItem('pronosbox_notifications');
    return savedNotifications ?
    JSON.parse(savedNotifications) :
    [
    {
      id: 1,
      title: 'Bienvenue sur PronosBox!',
      message: 'Merci de vous être inscrit sur notre plateforme.',
      time: 'Il y a 2 jours',
      read: false,
      type: 'success'
    },
    {
      id: 2,
      title: 'Nouveau prono disponible',
      message:
      'Un nouveau pronostic a été ajouté pour le match PSG - Marseille.',
      time: 'Il y a 5 heures',
      read: false,
      type: 'info'
    },
    {
      id: 3,
      title: 'Abonnement expirant',
      message:
      'Votre abonnement au canal "Experts Premier League" expire dans 3 jours.',
      time: "Aujourd'hui",
      read: false,
      type: 'subscription'
    }];

  });
  const unreadCount = notifications.filter((notif) => !notif.read).length;
  // Sauvegarder les notifications dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem(
      'pronosbox_notifications',
      JSON.stringify(notifications)
    );
  }, [notifications]);
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: Date.now()
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
    prev.map((notif) =>
    notif.id === id ?
    {
      ...notif,
      read: true
    } :
    notif
    )
    );
  };
  const markAllAsRead = () => {
    setNotifications((prev) =>
    prev.map((notif) => ({
      ...notif,
      read: true
    }))
    );
  };
  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        unreadCount
      }}>

      {children}
    </NotificationContext.Provider>);

};