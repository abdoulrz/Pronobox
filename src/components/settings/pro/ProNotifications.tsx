import React, { useState } from 'react';

interface ProNotificationsProps {
  user: any;
  updateUser: (updates: any) => Promise<void>;
}

export const ProNotifications: React.FC<ProNotificationsProps> = ({ user, updateUser }) => {
  const [emailNotifications, setEmailNotifications] = useState(user?.notifications?.email ?? false);
  const [pushNotifications, setPushNotifications] = useState(user?.notifications?.push ?? true);
  const [matchNotifications, setMatchNotifications] = useState(user?.notifications?.matches ?? true);
  const [channelNotifications, setChannelNotifications] = useState(user?.notifications?.channels ?? true);

  const handleNotificationChange = async (type: string, value: boolean) => {
    switch (type) {
      case 'email': setEmailNotifications(value); break;
      case 'push': setPushNotifications(value); break;
      case 'matches': setMatchNotifications(value); break;
      case 'channels': setChannelNotifications(value); break;
    }

    if (updateUser && user) {
      const updatedNotifications = {
        email: user.notifications?.email ?? false,
        push: user.notifications?.push ?? true,
        matches: user.notifications?.matches ?? true,
        channels: user.notifications?.channels ?? true,
        [type]: value
      };
      await updateUser({ notifications: updatedNotifications });
    }
  };

  const ToggleSwitch = ({ label, description, isChecked, onChange }: { label: string, description: string, isChecked: boolean, onChange: (val: boolean) => void }) => (
    <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 rounded-2xl transition-all hover:bg-white/60 dark:hover:bg-gray-700/60">
      <div>
        <h4 className="text-gray-900 dark:text-white font-medium">{label}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!isChecked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isChecked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400 mb-6">
        Préférences de Notifications
      </h3>
      
      <div className="space-y-4">
        <ToggleSwitch
          label="Notifications Push"
          description="Recevez des alertes directement sur votre appareil"
          isChecked={pushNotifications}
          onChange={(val) => handleNotificationChange('push', val)}
        />
        <ToggleSwitch
          label="Emails Récapitulatifs"
          description="Recevez un résumé de vos performances par email"
          isChecked={emailNotifications}
          onChange={(val) => handleNotificationChange('email', val)}
        />
        <ToggleSwitch
          label="Alerte Nouveaux Abonnés"
          description="Soyez averti lorsqu'un utilisateur s'abonne à votre canal"
          isChecked={channelNotifications}
          onChange={(val) => handleNotificationChange('channels', val)}
        />
        <ToggleSwitch
          label="Alertes de Match"
          description="Notifications sur les résultats de vos pronostics"
          isChecked={matchNotifications}
          onChange={(val) => handleNotificationChange('matches', val)}
        />
      </div>
    </div>
  );
};
