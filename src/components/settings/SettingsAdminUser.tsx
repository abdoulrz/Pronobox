import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { WS_EVENTS } from '../../services/WebSocketService';
import { useWebSocket } from '../../hooks/useWebSocket';
import { getAdminTransactions, getAdminWithdrawals } from '../../services/api';
import LegalContent from '../legal/LegalContent';

// Interfaces
export interface UserData {
  id: string;
  username: string;
  email?: string;
  isPro: boolean;
  walletBalance?: number;
  avatar?: string;
  isBanned?: boolean;
  status?: string;
  role?: string;
  joinDate?: string;
  lastLogin?: string;
}

export interface SupportMessage {
  id: number;
  sender: 'system' | 'user' | 'agent';
  message: string;
  time: string;
  date?: string;
  userId?: string;
  username?: string;
  userType?: 'standard' | 'pro' | null;
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  amount: number;
  type: 'recharge' | 'subscription' | 'withdrawal' | 'product';
  status: 'completed' | 'pending' | 'failed' | 'rejected' | 'approved';
  method: string;
  date: string;
  description: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  method: string;
  date: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accountInfo?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eligibility?: any;
  processedAt?: string;
  processedBy?: string;
}

export interface SiteStats {
  totalUsers: number;
  proUsers: number;
  standardUsers: number;
  totalTransactions: number;
  totalVolume: number;
  pendingWithdrawals: number;
}

const SettingsAdminUser: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { connected, subscribe } = useWebSocket();
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [selectedLegalTab, setSelectedLegalTab] = useState<'terms' | 'privacy' | 'cookies' | 'legal'>('terms');
  
  // États pour la gestion du portefeuille
  const [showRechargeModal, setShowRechargeModal] = useState<boolean>(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(50);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [rechargeMethod, setRechargeMethod] = useState<string>('card');
  const [withdrawMethod, setWithdrawMethod] = useState<string>('bank');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState<boolean>(false);

  // États pour les transactions et demandes de retrait (bilan financier)
  const [siteTotalBalance, setSiteTotalBalance] = useState<number>(0);
  const [siteStats, setSiteStats] = useState<SiteStats>({
    totalUsers: 0,
    proUsers: 0,
    standardUsers: 0,
    totalTransactions: 0,
    totalVolume: 0,
    pendingWithdrawals: 0
  });

  // Charger les transactions
  const loadTransactions = async () => {
    try {
      const response = await getAdminTransactions();
      
      const totalBalance = response.reduce((sum: number, tr: any) => {
        if (tr.type === 'recharge' && tr.status === 'completed') return sum + tr.amount;
        else if (['withdrawal', 'subscription', 'product'].includes(tr.type) && tr.status === 'completed') return sum - tr.amount;
        return sum;
      }, 0);
      setSiteTotalBalance(totalBalance);
      
      setSiteStats((prev) => ({
        ...prev,
        totalTransactions: response.length,
        totalVolume: response.reduce((sum: number, tr: any) => sum + tr.amount, 0)
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
    }
  };

  // Charger les retraits
  const loadWithdrawalRequests = async () => {
    try {
      const response = await getAdminWithdrawals();
      setSiteStats((prev) => ({
        ...prev,
        pendingWithdrawals: response.filter((w: any) => w.status === 'pending').length
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des retraits:', error);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadTransactions();
    loadWithdrawalRequests();
  }, []);

  // S'abonner aux événements WebSocket
  useEffect(() => {
    if (connected) {
      const unsubscribeWithdrawal = subscribe(
        WS_EVENTS.ADMIN_WITHDRAWAL_REQUEST,
        () => {
          setSiteStats((prev) => ({
            ...prev,
            pendingWithdrawals: prev.pendingWithdrawals + 1
          }));
        }
      );

      const unsubscribeTransaction = subscribe(
        WS_EVENTS.TRANSACTION_COMPLETE,
        (payload: any) => {
          if (payload.type === 'recharge') {
            setSiteTotalBalance((prev) => prev + payload.amount);
          } else if (['withdrawal', 'subscription', 'product'].includes(payload.type)) {
            setSiteTotalBalance((prev) => prev - payload.amount);
          }
          setSiteStats((prev) => ({
            ...prev,
            totalTransactions: prev.totalTransactions + 1,
            totalVolume: prev.totalVolume + payload.amount
          }));
        }
      );

      return () => {
        unsubscribeWithdrawal();
        unsubscribeTransaction();
      };
    }
  }, [connected, subscribe]);


  const [emailNotifications, setEmailNotifications] = useState(user?.notifications?.email ?? false);
  const [pushNotifications, setPushNotifications] = useState(user?.notifications?.push ?? true);
  const [matchNotifications, setMatchNotifications] = useState(user?.notifications?.matches ?? true);
  const [channelNotifications, setChannelNotifications] = useState(user?.notifications?.channels ?? true);

  const handleNotificationChange = async (type: string, value: boolean) => {
    // Update local state first for instant feedback
    switch (type) {
      case 'email': setEmailNotifications(value); break;
      case 'push': setPushNotifications(value); break;
      case 'matches': setMatchNotifications(value); break;
      case 'channels': setChannelNotifications(value); break;
    }

    // Persist to DB
    if (updateUser && user) {
      const updatedNotifications = {
        email: user.notifications?.email ?? false,
        push: user.notifications?.push ?? true,
        matches: user.notifications?.matches ?? true,
        channels: user.notifications?.channels ?? true,
        [type]: value
      };
      await updateUser({
        notifications: updatedNotifications
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (updateUser) {
          updateUser({ avatar: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const bio = formData.get('bio') as string;

    try {
      if (updateUser) {
        await updateUser({
          username,
          email,
          bio
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setIsSaving(false);
    }
  };

  /* const handleLegalPageClick = (page: string) => {
    // setActiveLegalPage(page);
  };
  const handleCloseLegalPage = () => {
    // setActiveLegalPage(null);
  }; */
  // Fonction pour gérer la recharge du compte
  const handleRecharge = async () => {
    if (rechargeAmount < 10) return;
    setIsProcessingPayment(true);
    // Simuler un délai de traitement
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Mettre à jour le solde de l'utilisateur (simulation)
    const currentBalance = user?.walletBalance || 0;
    updateUser({
      walletBalance: currentBalance + rechargeAmount
    });
    setIsProcessingPayment(false);
    setShowRechargeModal(false);
  };
  // Fonction pour gérer le retrait
  const handleWithdraw = async () => {
    if (withdrawAmount < 10 || withdrawAmount > (user?.walletBalance || 0))
    return;
    setIsProcessingWithdraw(true);
    // Simuler un délai de traitement
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Mettre à jour le solde de l'utilisateur (simulation)
    const currentBalance = user?.walletBalance || 0;
    updateUser({
      walletBalance: currentBalance - withdrawAmount
    });
    setIsProcessingWithdraw(false);
    setShowWithdrawModal(false);
  };

  return (
    <>
      {/* En-tête du profil */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 flex items-center">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500 flex-shrink-0">
          <img
            src={
            user?.avatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
            }
            alt={user?.username || 'Utilisateur'}
            className="w-full h-full object-cover" />

        </div>
        <div className="ml-4 flex-grow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {user?.username || 'Utilisateur'}
            <span className="ml-2 inline-block text-xs bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 px-2 py-0.5 rounded-full">
              Admin
            </span>
            {connected &&
            <span className="ml-2 inline-flex items-center text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Connecté
              </span>
            }
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.email || 'email@exemple.com'}
          </p>
          <div className="flex items-center mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-green-500 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Solde: {user?.walletBalance?.toFixed(2) || '0.00'}€
            </span>
            <div className="ml-2 flex space-x-1">
              <button
                onClick={() => setShowRechargeModal(true)}
                className="text-xs px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-700">

                Recharger
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600">

                Retirer
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Tableau de bord financier du site */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
          Bilan financier du site
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
              Solde total
            </h4>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {siteTotalBalance.toFixed(2)}€
            </p>
            <div className="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor">

                <path
                  fillRule="evenodd"
                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                  clipRule="evenodd" />

              </svg>
              <span>+2.5% cette semaine</span>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
              Volume de transactions
            </h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {siteStats.totalVolume.toFixed(2)}€
            </p>
            <div className="flex items-center mt-2 text-xs text-blue-600 dark:text-blue-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor">

                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span>{siteStats.totalTransactions} transactions</span>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
              Retraits en attente
            </h4>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {siteStats.pendingWithdrawals}
            </p>
            <div className="flex items-center mt-2 text-xs text-yellow-600 dark:text-yellow-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor">

                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd" />

              </svg>
              <span>À traiter sous 24h</span>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 p-2 mb-6 bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 dark:border-gray-700/30 hide-scrollbar sticky top-0 z-10">
        {[
          { id: 'profile', label: 'Profil', icon: '👤' },
          { id: 'notifications', label: 'Notifications', icon: '🔔' },
          { id: 'security', label: 'Sécurité', icon: '🔒' },
          { id: 'about', label: 'À propos', icon: 'ℹ️' },
        ].map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`
                flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap rounded-xl transition-all duration-300 ease-out
                ${isActive 
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300 shadow-inner border border-green-500/30' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-gray-700/40 hover:text-gray-900 dark:hover:text-white border border-transparent'}
              `}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 overflow-hidden">

          {/* Contenu de la section Profil */}
          {activeSection === 'profile' &&
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm animate-fade-in">
              <h3 className="text-lg font-medium mb-4 dark:text-white">
                Profil
              </h3>
              <form onSubmit={handleProfileSubmit}>
                <div className="space-y-4">
                  <div className="flex flex-col items-center md:flex-row md:items-start mb-4">
                    <div className="relative w-24 h-24 mb-4 md:mb-0 md:mr-6 group">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-green-500 shadow-md">
                        <img
                          src={
                            user?.avatar ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
                          }
                          alt={user?.username || 'Utilisateur'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 cursor-pointer hover:scale-110 active:scale-95 transition-all"
                        title="Modifier la photo de profil"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                          title="Avatar"
                          type="file"
                          id="avatar-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>
                    <div className="md:flex-1">
                      <div className="space-y-2">
                        <div>
                          <label htmlFor="admin-profile-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nom d'utilisateur
                          </label>
                          <input
                          id="admin-profile-username"
                          name="username"
                          title="Nom d'utilisateur"
                          type="text"
                          defaultValue={user?.username || ''}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm" />

                        </div>
                        <div>
                          <label htmlFor="admin-profile-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                          </label>
                          <input
                          id="admin-profile-email"
                          name="email"
                          title="Email"
                          type="email"
                          defaultValue={user?.email || ''}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm" />

                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    <textarea
                    id="admin-profile-bio"
                    name="bio"
                    title="Bio"
                    defaultValue={user?.bio || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                    rows={3}
                    placeholder="Parlez-nous de vous...">
                  </textarea>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">

                      {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                    {saveSuccess && (
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium animate-fade-in">
                        Profil mis à jour !
                      </span>
                    )}
                  </div>
                </div>
              </form>
            </div>
          }
          {/* Contenu de la section Notifications */}
          {activeSection === 'notifications' &&
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm animate-fade-in">
              <h3 className="text-lg font-medium mb-4 dark:text-white">
                Préférences de notifications
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notifications par email
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Recevoir des résumés quotidiens et des annonces importantes
                    </p>
                  </div>
                  <button
                    title={`Notifications par email: ${emailNotifications ? 'Désactiver' : 'Activer'}`}
                    onClick={() => handleNotificationChange('email', !emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${emailNotifications ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notifications push
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Notifications en temps réel sur votre navigateur ou mobile
                    </p>
                  </div>
                  <button
                    title={`Notifications push: ${pushNotifications ? 'Désactiver' : 'Activer'}`}
                    onClick={() => handleNotificationChange('push', !pushNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${pushNotifications ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notifications de matchs
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Alertes sur les débuts et fins de matchs suivis
                    </p>
                  </div>
                  <button
                    title={`Notifications de matchs: ${matchNotifications ? 'Désactiver' : 'Activer'}`}
                    onClick={() => handleNotificationChange('matches', !matchNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${matchNotifications ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${matchNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notifications de canaux
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Alertes lors de nouvelles publications dans vos canaux
                    </p>
                  </div>
                  <button
                    title={`Notifications de canaux: ${channelNotifications ? 'Désactiver' : 'Activer'}`}
                    onClick={() => handleNotificationChange('channels', !channelNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${channelNotifications ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${channelNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          }

          {/* Contenu de la section Sécurité */}
          {activeSection === 'security' &&
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm animate-fade-in">
              <h3 className="text-lg font-medium mb-4 dark:text-white">
                Sécurité
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Changer de mot de passe
                  </h4>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    setIsSaving(true);
                    setTimeout(() => {
                      setIsSaving(false);
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 3000);
                      (e.target as HTMLFormElement).reset();
                    }, 1000);
                  }}>
                    <div className="space-y-3">
                    <div>
                      <label htmlFor="current-password" title="Mot de passe actuel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mot de passe actuel
                      </label>
                      <input
                      id="current-password"
                      title="Mot de passe actuel"
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                      placeholder="••••••••••••" />

                    </div>
                    <div>
                      <label htmlFor="new-password" title="Nouveau mot de passe" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nouveau mot de passe
                      </label>
                      <input
                      id="new-password"
                      title="Nouveau mot de passe"
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                      placeholder="••••••••••••" />

                    </div>
                    <div>
                      <label htmlFor="confirm-password" title="Confirmer le nouveau mot de passe" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                      id="confirm-password"
                      title="Confirmer le nouveau mot de passe"
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                      placeholder="••••••••••••" />

                    </div>
                    <div className="flex items-center justify-between">
                      <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-all">
                        {isSaving ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                      </button>
                      {saveSuccess && (
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium animate-fade-in">
                          Mot de passe mis à jour !
                        </span>
                      )}
                    </div>
                  </div>
                </form>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Authentification à deux facteurs
                  </h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        L'authentification à deux facteurs est activée
                      </p>
                    </div>
                    <button className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
                      Désactiver
                    </button>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sessions actives
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                          <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-green-600 dark:text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">

                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />

                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            Session actuelle
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Paris, France - Chrome sur Windows
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Actif
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                          <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-blue-600 dark:text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">

                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />

                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            Application mobile
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            iPhone 13 - iOS 15
                          </p>
                        </div>
                      </div>
                      <button className="text-xs text-red-600 dark:text-red-400 hover:underline">
                        Déconnecter
                      </button>
                    </div>
                    <div className="pt-2">
                      <button className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium">
                        Déconnecter toutes les autres sessions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          {activeSection === 'about' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm animate-fade-in">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  PronosBox est une plateforme dédiée à l'analyse sportive et au partage de pronostics entre passionnés.
                </p>
                
                {/* Horizontal tabs */}
                <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
                  {[
                    { id: 'terms', label: 'Conditions Générales' },
                    { id: 'privacy', label: 'Confidentialité' },
                    { id: 'cookies', label: 'Cookies' },
                    { id: 'legal', label: 'Mentions Légales' }
                  ].map((tab) => {
                    const isActive = selectedLegalTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedLegalTab(tab.id as any)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
                          isActive
                            ? 'bg-green-600 text-white shadow-md shadow-green-500/20'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Inline Content */}
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-inner max-h-[50vh] overflow-y-auto">
                  <LegalContent type={selectedLegalTab} isInline={true} />
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-750">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">Version 2.9.1 (Stabilization)</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">© 2026 PronosBox - Tous droits réservés</p>
                </div>
              </div>
            </div>
          )}
      </div>
      {/* Modal pour recharger le compte */}
      {showRechargeModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
            <div className="relative px-4 py-3 bg-green-600 text-white">
              <h3 className="text-base font-medium">Recharger mon compte</h3>
              <button
              title="Fermer"
              onClick={() => setShowRechargeModal(false)}
              className="absolute right-2 top-2 text-white hover:text-gray-200">

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
            <div className="p-4">
              <div className="mb-4">
                <label htmlFor="recharge-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Montant à recharger (€)
                </label>
                <input
                id="recharge-amount"
                title="Montant de la recharge"
                type="number"
                min="10"
                step="5"
                value={rechargeAmount}
                onChange={(e) =>
                setRechargeAmount(parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                placeholder="Ex: 50" />

              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Méthode de paiement
                </label>
                <div className="space-y-2">
                  <div
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setRechargeMethod('card')}>

                    <input
                    title="Carte bancaire"
                    type="radio"
                    id="card"
                    name="paymentMethod"
                    checked={rechargeMethod === 'card'}
                    onChange={() => setRechargeMethod('card')}
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500" />

                    <label
                    htmlFor="card"
                    className="ml-3 flex items-center cursor-pointer">

                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">

                          <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />

                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Carte bancaire
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Visa, Mastercard, etc.
                        </p>
                      </div>
                    </label>
                  </div>
                  <div
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setRechargeMethod('mobile')}>

                    <input
                    title="Mobile Money"
                    type="radio"
                    id="mobile"
                    name="paymentMethod"
                    checked={rechargeMethod === 'mobile'}
                    onChange={() => setRechargeMethod('mobile')}
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500" />

                    <label
                    htmlFor="mobile"
                    className="ml-3 flex items-center cursor-pointer">

                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-3">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-orange-600 dark:text-orange-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">

                          <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />

                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Mobile Money
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Orange Money, MTN Mobile Money, Moov Money
                        </p>
                      </div>
                    </label>
                  </div>
                  <div
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setRechargeMethod('crypto')}>

                    <input
                    title="Crypto"
                    type="radio"
                    id="crypto"
                    name="paymentMethod"
                    checked={rechargeMethod === 'crypto'}
                    onChange={() => setRechargeMethod('crypto')}
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500" />

                    <label
                    htmlFor="crypto"
                    className="ml-3 flex items-center cursor-pointer">

                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-purple-600 dark:text-purple-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">

                          <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />

                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Crypto-monnaie
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Bitcoin, Ethereum, etc.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Montant
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {rechargeAmount.toFixed(2)}€
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Frais (2.5%)
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {(rechargeAmount * 0.025).toFixed(2)}€
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Total à payer
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {(rechargeAmount * 1.025).toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                onClick={() => setShowRechargeModal(false)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">

                  Retour
                </button>
                <button
                onClick={handleRecharge}
                className="px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center">

                  {isProcessingPayment ?
                <>
                      <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">

                        <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4">
                    </circle>
                        <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                      </svg>
                      Traitement...
                    </> :

                'Procéder au paiement'
                }
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      {/* Modal pour retirer des fonds */}
      {showWithdrawModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
            <div className="relative px-4 py-3 bg-green-600 text-white">
              <h3 className="text-base font-medium">Retirer des fonds</h3>
              <button
              title="Fermer"
              onClick={() => setShowWithdrawModal(false)}
              className="absolute right-2 top-2 text-white hover:text-gray-200">

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
            <div className="p-4">
              <div className="mb-4">
                <label htmlFor="withdraw-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Montant à retirer (€)
                </label>
                <input
                id="withdraw-amount"
                title="Montant"
                type="number"
                min="10"
                max={user?.walletBalance || 0}
                step="5"
                value={withdrawAmount}
                onChange={(e) =>
                setWithdrawAmount(parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                placeholder="Ex: 50" />

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Solde disponible: {user?.walletBalance?.toFixed(2) || '0.00'}€
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Méthode de retrait
                </label>
                <select
                title="Méthode de retrait"
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm">

                  <option value="bank">Virement bancaire</option>
                  <option value="mobile">Mobile Money</option>
                  <option value="crypto">Crypto-monnaie</option>
                </select>
              </div>
              {withdrawMethod === 'bank' &&
            <div className="mb-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom du titulaire
                    </label>
                    <input
                  title="Nom du titulaire"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                  placeholder="Ex: Jean Dupont" />

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      IBAN
                    </label>
                    <input
                  title="IBAN"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                  placeholder="Ex: FR76 1234 5678 9012 3456 7890 123" />

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      BIC/SWIFT
                    </label>
                    <input
                  title="BIC/SWIFT"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                  placeholder="Ex: BNPAFRPP" />

                  </div>
                </div>
            }
              {withdrawMethod === 'mobile' &&
            <div className="mb-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Opérateur
                    </label>
                    <select title="Opérateur" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm">
                      <option value="orange">Orange Money</option>
                      <option value="mtn">MTN Mobile Money</option>
                      <option value="moov">Moov Money</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Numéro de téléphone
                    </label>
                    <input
                  title="Numéro de téléphone"
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                  placeholder="Ex: +225 07 12 34 56 78" />

                  </div>
                </div>
            }
              {withdrawMethod === 'crypto' &&
            <div className="mb-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Crypto-monnaie
                    </label>
                    <select title="Crypto-monnaie" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm">
                      <option value="btc">Bitcoin (BTC)</option>
                      <option value="eth">Ethereum (ETH)</option>
                      <option value="usdt">Tether (USDT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Adresse de portefeuille
                    </label>
                    <input
                  title="Adresse de portefeuille"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                  placeholder="Ex: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" />

                  </div>
                </div>
            }
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-md p-3 mb-4">
                <div className="flex">
                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

                  </svg>
                  <div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Les retraits sont traités sous 24-48h ouvrables. Des frais
                      de 2,5% s'appliquent, avec un minimum de 0,50€.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">

                  Retour
                </button>
                <button
                onClick={handleWithdraw}
                className="px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center"
                disabled={
                withdrawAmount > (user?.walletBalance || 0) ||
                withdrawAmount < 10
                }>

                  {isProcessingWithdraw ?
                <>
                      <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">

                        <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4">
                    </circle>
                        <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                      </svg>
                      Traitement...
                    </> :

                'Confirmer le retrait'
                }
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </>
  );
};
export default SettingsAdminUser;
