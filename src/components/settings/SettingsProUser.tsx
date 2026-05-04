import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

import { useNavigate } from 'react-router-dom';
import LegalContent from '../legal/LegalContent';
import { useChannelData } from '../../contexts/ChannelContext';
import { DynamicWidthBar } from '../common/DynamicWidthBar';

import { useUserFeatures } from '../../hooks/useUserFeatures';

/**
 * Helper component to set dynamic widths without using inline styles in JSX,
 * satisfying strict linter rules while maintaining dynamic functionality.
 */

interface Performance {
  accuracy: number;
  engagement: number;
  retention: number;
}

interface Activity {
  type: 'new-subscriber' | 'post-published' | 'withdrawal' | 'comment';
  date: string;
  user?: string;
  amount?: number;
  title?: string;
  content?: string;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  image: string;
  members: number;
  views: number;
  revenue: number;
  subscriptions: number;
  growth: number;
  createdAt: string;
  lastActivity: string;
  performance: Performance;
  topContent: Array<{ id: string; title: string; views: number }>;
  recentActivities: Activity[];
}

interface ProStats {
  successRate: number;
  habilitationLevel: number;
  totalPredictions: number;
  totalEarnings: number;
  averageOdds: number;
  bestStreak: number;
  avgMonthlyRevenue: number;
  rankingPosition: number;
}

const SettingsProUser: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { addChannel } = useChannelData();
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeLegalPage, setActiveLegalPage] = useState<string | null>(null);
  const { channelData } = useChannelData();
  const userChannels = Object.values(channelData?.channelDetails || {}).filter(
    (c) => c.owner?.id === user?.id
  ).map(c => ({
    ...c,
    topContent: c.topContent || [],
    recentActivities: c.recentActivities || []
  })) as unknown as Channel[];
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [withdrawalStatus, setWithdrawalStatus] = useState<{
    success: boolean;
    message: string;
    amount?: number;
    fees?: number;
    netAmount?: number;
    processingDays?: string;
  } | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState<number>(50);
  const [showRechargeModal, setShowRechargeModal] = useState<boolean>(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showSubscribersModal, setShowSubscribersModal] = useState<boolean>(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState<boolean>(false);
  const [newChannelName, setNewChannelName] = useState<string>('');
  const [newChannelDescription, setNewChannelDescription] = useState<string>('');
  const [newChannelIsPremium, setNewChannelIsPremium] = useState<boolean>(false);
  const [isCreatingChannel, setIsCreatingChannel] = useState<boolean>(false);

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
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

  const handleDeletePaymentMethod = async (id: string | number) => {
    if (updateUser && user) {
      const updatedMethods = (user.paymentMethods || []).filter((m) => m.id !== id);
      await updateUser({ paymentMethods: updatedMethods });
    }
  };

  const handleAddPaymentMethod = async () => {
    if (updateUser && user) {
      const newMethod = {
        id: `pm-${Date.now()}`,
        type: 'card' as const,
        name: 'Visa se terminant par 8888',
        details: 'Expire le 05/27',
        icon: 'card'
      };
      await updateUser({ paymentMethods: [...(user.paymentMethods || []), newMethod] });
    }
  };

  const proStats: ProStats = {
    successRate: userChannels.length > 0 ? 
      userChannels.reduce((sum, c) => sum + (c.performance?.accuracy || 0), 0) / userChannels.length : 0,
    habilitationLevel: user?.isPro ? 4 : 0, // À lier à un vrai système de niveaux plus tard
    totalPredictions: userChannels.reduce((sum, c) => sum + (c.topContent?.length || 0), 0),
    totalEarnings: userChannels.reduce((sum, c) => sum + (c.revenue || 0), 0),
    averageOdds: 1.85, // Valeur par défaut ou à calculer via les posts
    bestStreak: 8,
    avgMonthlyRevenue: userChannels.reduce((sum, c) => sum + (c.revenue || 0), 0) / (userChannels.length || 1),
    rankingPosition: 42
  };
  const handleChannelClick = (channelId: string) => {
    setActiveChannelId(activeChannelId === channelId ? null : channelId);
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

  const handleLegalPageClick = (page: string) => {
    setActiveLegalPage(page);
  };
  const handleCloseLegalPage = () => {
    setActiveLegalPage(null);
  };
  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount < 50) {
      setWithdrawalStatus({
        success: false,
        message: 'Veuillez entrer un montant valide (minimum 50€)'
      });
      return;
    }
    // Simuler une réponse de l'API
    const fees = amount * 0.1; // 10% de frais
    const netAmount = amount - fees;
    setWithdrawalStatus({
      success: true,
      message: `Votre demande de retrait de ${amount}€ a été enregistrée. Frais de 10%: ${fees.toFixed(2)}€. Montant net: ${netAmount.toFixed(2)}€. Le traitement sera effectué dans les 48h (uniquement jeudi et vendredi).`,
      amount: amount,
      fees: fees,
      netAmount: netAmount,
      processingDays: '48h (jeudi et vendredi uniquement)'
    });
    setWithdrawalAmount('');
  };
  // Fonction pour gérer la recharge du compte
  const handleRecharge = async () => {
    if (rechargeAmount < 10) {
      alert('Le montant minimum de recharge est de 10€');
      return;
    }
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
    // Afficher une notification de succès
    alert(`Votre compte a été rechargé de ${rechargeAmount}€ avec succès!`);
  };
  const userFunctions = useUserFeatures(user);

  // Fonction pour gérer le retrait
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount < userFunctions.minWithdrawalAmount) {
      alert(`Le montant minimum de retrait est de ${userFunctions.minWithdrawalAmount}€`);
      return;
    }
    if (amount > (user?.walletBalance || 0)) {
      alert('Solde insuffisant pour effectuer ce retrait');
      return;
    }
    setIsProcessingWithdraw(true);
    // Simuler un délai de traitement
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Mettre à jour le solde de l'utilisateur (simulation)
    const currentBalance = user?.walletBalance || 0;
    updateUser({
      walletBalance: currentBalance - amount
    });
    // Calculer les frais et le montant net
    const fees = amount * (userFunctions.withdrawalFeePercentage / 100);
    const netAmount = amount - fees;
    setIsProcessingWithdraw(false);
    setShowWithdrawModal(false);
    setWithdrawalAmount('');
    // Afficher une notification de succès
    alert(
      `Votre demande de retrait de ${amount}€ a été traitée avec succès! Frais: ${fees.toFixed(2)}€ (${userFunctions.withdrawalFeePercentage}%). Montant net: ${netAmount.toFixed(2)}€. Le traitement sera effectué dans les 48h.`
    );
  };
  // Fonction pour afficher les statistiques détaillées
  const handleShowStats = () => {
    setShowStatsModal(true);
  };
  // Fonction pour gérer les abonnés
  const handleManageSubscribers = () => {
    setShowSubscribersModal(true);
  };
  // Fonction pour créer un canal
  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      alert('Veuillez entrer un nom pour le canal');
      return;
    }
    setIsCreatingChannel(true);
    
    const newChannelId = `channel-${Date.now()}`;
    
    // Créer le canal dans le format attendu par le contexte global
    const globalChannel = {
      id: newChannelId,
      name: newChannelName.trim(),
      description: newChannelDescription.trim(),
      premium: newChannelIsPremium,
      members: 1,
      views: 0,
      image:
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      posts: [
      {
        id: `post-${Date.now()}`,
        title: `Bienvenue sur ${newChannelName.trim()}!`,
        content: newChannelDescription.trim() || 'Canal créé avec PronosBox.'
      }]
    };
    // Ajouter le canal au contexte global
    if (addChannel) {
      addChannel(globalChannel);
    }
    // Réinitialiser le formulaire
    setNewChannelName('');
    setNewChannelDescription('');
    setNewChannelIsPremium(false);
    setIsCreatingChannel(false);
    setShowCreateChannelModal(false);
    // Notification de succès
    alert('Canal créé avec succès!');
  };

  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

  const handleEditChannelClick = (channel: Channel) => {
    setEditingChannel(channel);
    setNewChannelName(channel.name);
    setNewChannelDescription(channel.description || '');
    setNewChannelIsPremium(channel.subscriptions !== undefined && channel.subscriptions > 0);
    setShowCreateChannelModal(true);
  };

  const handleUpdateChannel = async () => {
    if (!editingChannel || !newChannelName.trim()) return;
    
    setIsCreatingChannel(true);
    
    // TODO: Call API to update channel when service is ready
    // For now we just close the modal
    setEditingChannel(null);
    setNewChannelName('');
    setNewChannelDescription('');
    setIsCreatingChannel(false);
    setShowCreateChannelModal(false);
    alert('Canal mis à jour avec succès!');
  };
  // Calculer le revenu total de tous les canaux
  const totalRevenue = userChannels.reduce(
    (sum, channel) => sum + channel.revenue,
    0
  );
  const totalSubscriptions = userChannels.reduce(
    (sum, channel) => sum + channel.subscriptions,
    0
  );
  const totalViews = userChannels.reduce(
    (sum, channel) => sum + channel.views,
    0
  );
  // Fonction pour afficher les étoiles du niveau d'habilitation
  const renderHabilitationStars = (level: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 ${i <= level ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
          viewBox="0 0 20 20"
          fill="currentColor">

          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          Niveau {level}/5
        </span>
      </div>);

  };
  return (
    <>
      {/* Tableau de bord Pro - Résumé des statistiques */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 rounded-lg shadow-md p-6 mb-6 text-white">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="relative mb-4 md:mb-0 md:mr-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30">
              <img
                src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
                }
                alt={user?.username || 'Utilisateur Pro'}
                className="w-full h-full object-cover" />

            </div>
            <div
              className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={handleAvatarClick}>

              <span className="text-white text-xs font-medium">Modifier</span>
              <input
                title="Changer de photo de profil"
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange} />

            </div>
          </div>
          <div className="text-center md:text-left md:flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  {user?.username || 'Utilisateur Pro'}
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-400 text-yellow-900">
                    Pro
                  </span>
                </h2>
                <p className="text-white/80">
                  {user?.email || 'email@exemple.com'}
                </p>
                <div className="mt-2">
                  {renderHabilitationStars(proStats.habilitationLevel)}
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                <div className="text-xl font-bold">
                  {user?.walletBalance?.toFixed(2) || '0.00'}€
                </div>
                <div className="flex space-x-2 mt-2">
                  <button
                    title="Recharger le compte"
                    onClick={() => setShowRechargeModal(true)}
                    className="px-3 py-1.5 bg-white text-green-700 rounded-md text-sm font-medium hover:bg-green-50">
                    Recharger
                  </button>
                  <button
                    title="Retirer des fonds"
                    onClick={() => setShowWithdrawModal(true)}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-400">

                    Retirer
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-lg font-bold">{proStats.successRate}%</div>
                <div className="text-xs">Taux de réussite</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-lg font-bold">{totalSubscriptions}</div>
                <div className="text-xs">Abonnés totaux</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-lg font-bold">{userChannels.length}</div>
                <div className="text-xs">Canaux actifs</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-lg font-bold">
                  {totalRevenue.toFixed(2)}€
                </div>
                <div className="text-xs">Revenus totaux</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {/* Navigation par onglets */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeSection === 'dashboard' ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveSection('dashboard')}>

            Tableau de bord
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeSection === 'channels' ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveSection('channels')}>

            Mes Canaux
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeSection === 'earnings' ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveSection('earnings')}>

            Revenus
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeSection === 'profile' ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveSection('profile')}>
            Profil
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeSection === 'notifications' ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveSection('notifications')}>
            Notifications
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeSection === 'security' ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveSection('security')}>
            Sécurité
          </button>

          <button
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeSection === 'about' ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveSection('about')}>

            À propos
          </button>
        </div>
        {/* Contenu des sections */}
        <div className="p-6">
          {/* Section Tableau de bord */}
          {activeSection === 'dashboard' &&
          <div>
              <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
                Tableau de bord Pro
              </h3>
              {/* Statistiques détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-5 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                    Performance des pronostics
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Taux de réussite
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {proStats.successRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <DynamicWidthBar
                        progress={proStats.successRate}
                        className="bg-green-500 progress-bar-fill"
                      />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Pronostics totaux
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {proStats.totalPredictions}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Cote moyenne
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {proStats.averageOdds}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Meilleure série
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {proStats.bestStreak} victoires
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Classement
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          #{proStats.rankingPosition}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-5 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                    Performance financière
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Revenus totaux
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {proStats.totalEarnings.toFixed(2)}€
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Revenus mensuels
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {proStats.avgMonthlyRevenue.toFixed(2)}€
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Abonnés totaux
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {totalSubscriptions}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Vues totales
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {totalViews}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Niveau d'habilitation PronosBox
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {proStats.habilitationLevel}/5
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <DynamicWidthBar
                        progress={proStats.habilitationLevel / 5 * 100}
                        className="bg-yellow-500 progress-bar-fill"
                      />
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Les utilisateurs de niveau 4 bénéficient de frais
                        réduits et d'une visibilité accrue sur la plateforme.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Aperçu des canaux */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Aperçu des canaux
                  </h4>
                  <button
                  onClick={() => setActiveSection('channels')}
                  className="text-sm text-green-600 dark:text-green-400 hover:underline">

                    Voir tous les canaux →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userChannels.slice(0, 3).map((channel) =>
                <div
                  key={channel.id}
                  className="bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600 overflow-hidden">

                      <div className="h-24 bg-gray-200 dark:bg-gray-600 relative">
                        <img
                      src={channel.image}
                      alt={channel.name}
                      className="w-full h-full object-cover" />

                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                          <h5 className="text-white font-semibold text-lg">
                            {channel.name}
                          </h5>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-300">
                            {channel.members} membres
                          </span>
                          <span className="text-gray-600 dark:text-gray-300">
                            {channel.subscriptions} abonnés
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-gray-600 dark:text-gray-300">
                            {channel.views} vues
                          </span>
                          <span className="text-green-600 dark:text-green-400">
                            {channel.revenue.toFixed(2)}€
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">
                            Précision: {channel.performance.accuracy}%
                          </span>
                          <span
                        className={`${channel.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>

                            {channel.growth > 0 ? '+' : ''}
                            {channel.growth}% ce mois
                          </span>
                        </div>
                      </div>
                    </div>
                )}
                </div>
              </div>
              {/* Actions rapides */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  Actions rapides
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                  title="Créer un nouveau canal"
                  onClick={() => setShowCreateChannelModal(true)}
                  className="p-4 bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors flex flex-col items-center justify-center">

                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">

                      <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" />

                    </svg>
                    <span className="text-sm font-medium">Créer un canal</span>
                  </button>
                  <button
                  title="Effectuer un retrait"
                  onClick={() => setShowWithdrawModal(true)}
                  className="p-4 bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors flex flex-col items-center justify-center">

                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">

                      <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0 0h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2z" />

                    </svg>
                    <span className="text-sm font-medium">
                      Effectuer un retrait
                    </span>
                  </button>
                  <button
                  title="Voir les statistiques détaillées"
                  onClick={handleShowStats}
                  className="p-4 bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors flex flex-col items-center justify-center">

                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">

                      <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />

                    </svg>
                    <span className="text-sm font-medium">
                      Voir mes statistiques
                    </span>
                  </button>
                  <button
                  title="Gérer les abonnés"
                  onClick={handleManageSubscribers}
                  className="p-4 bg-yellow-100 dark:bg-yellow-800/30 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800/50 transition-colors flex flex-col items-center justify-center">

                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">

                      <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />

                    </svg>
                    <span className="text-sm font-medium">
                      Gérer les abonnés
                    </span>
                  </button>
                </div>
              </div>
            </div>
          }
          {/* Section Mes Canaux */}
          {activeSection === 'channels' &&
          <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  Mes Canaux
                </h3>
                <button
                title="Créer un nouveau canal"
                onClick={() => setShowCreateChannelModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center">

                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />

                  </svg>
                  Créer un canal
                </button>
              </div>
              {/* Résumé des statistiques */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Revenus totaux
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {totalRevenue.toFixed(2)}€
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Retraits sans frais
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Revenus ce mois
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    325.75€
                  </div>
                  <div className="text-xs text-green-500 dark:text-green-400 mt-1">
                    +12.5% vs mois dernier
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Revenus totaux
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    1,245.50€
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Depuis le 15/02/2023
                  </div>
                </div>
              </div>
              {/* Liste des canaux */}
              <div className="space-y-4">
                {userChannels.map((channel) =>
              <div
                key={channel.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">

                    <div
                  className={`p-4 ${activeChannelId === channel.id ? 'bg-green-50 dark:bg-green-900/10' : 'bg-white dark:bg-gray-700'} cursor-pointer`}
                  onClick={() => handleChannelClick(channel.id)}>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded overflow-hidden mr-4">
                            <img
                          src={channel.image}
                          alt={channel.name}
                          className="w-full h-full object-cover" />

                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-gray-200">
                              {channel.name}
                            </h4>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <span>{channel.members} membres</span>
                              <span className="mx-2">•</span>
                              <span>{channel.subscriptions} abonnés</span>
                              <span className="mx-2">•</span>
                              <span>{channel.revenue.toFixed(2)}€ générés</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="mr-4 text-right">
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {channel.performance.accuracy}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Précision
                            </div>
                          </div>
                          <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 text-gray-400 transition-transform ${activeChannelId === channel.id ? 'transform rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">

                            <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7" />

                          </svg>
                        </div>
                      </div>
                    </div>
                    {/* Détails du canal */}
                    {activeChannelId === channel.id &&
                <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          {/* Performances */}
                          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                            <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                              Performance
                            </h5>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Précision des pronos
                                  </span>
                                  <span className="font-medium">
                                    {channel.performance.accuracy}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                  <DynamicWidthBar
                              progress={channel.performance.accuracy}
                              className="bg-green-600 progress-bar-fill"
                            />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Engagement
                                  </span>
                                  <span className="font-medium">
                                    {channel.performance.engagement}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                  <DynamicWidthBar
                              progress={channel.performance.engagement}
                              className="bg-blue-600 progress-bar-fill"
                            />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Rétention
                                  </span>
                                  <span className="font-medium">
                                    {channel.performance.retention}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                  <DynamicWidthBar
                              progress={channel.performance.retention}
                              className="bg-purple-600 progress-bar-fill"
                            />
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Contenu populaire */}
                          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                            <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                              Contenu populaire
                            </h5>
                            <div className="space-y-3">
                              {channel.topContent.map((content) =>
                        <div
                          key={content.id}
                          className="flex justify-between items-center">

                                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[70%]">
                                    {content.title}
                                  </span>
                                  <span className="text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">
                                    {content.views} vues
                                  </span>
                                </div>
                        )}
                            </div>
                          </div>
                          {/* Activité récente */}
                          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                            <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                              Activité récente
                            </h5>
                            <div className="space-y-3">
                              {channel.recentActivities.map(
                          (activity, index) =>
                          <div key={index} className="flex items-start">
                                    <div className="mr-2 mt-0.5">
                                      {activity.type === 'new-subscriber' &&
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              }
                                      {activity.type === 'post-published' &&
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              }
                                      {activity.type === 'withdrawal' &&
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              }
                                      {activity.type === 'comment' &&
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              }
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(
                                  activity.date
                                ).toLocaleDateString()}
                                      </div>
                                      <div className="text-sm text-gray-700 dark:text-gray-300">
                                        {activity.type === 'new-subscriber' &&
                                <>
                                            <span className="font-medium">
                                              {activity.user}
                                            </span>{' '}
                                            s'est abonné pour {activity.amount}€
                                          </>
                                }
                                        {activity.type === 'post-published' &&
                                <>
                                            Publication:{' '}
                                            <span className="font-medium">
                                              {activity.title}
                                            </span>
                                          </>
                                }
                                        {activity.type === 'withdrawal' &&
                                <>
                                            Retrait de{' '}
                                            <span className="font-medium">
                                              {activity.amount}€
                                            </span>
                                          </>
                                }
                                        {activity.type === 'comment' &&
                                <>
                                            <span className="font-medium">
                                              {activity.user}
                                            </span>
                                            : {activity.content}
                                          </>
                                }
                                      </div>
                                    </div>
                                  </div>

                        )}
                            </div>
                          </div>
                        </div>
                        {/* Boutons d'action */}
                        <div className="flex flex-wrap gap-2">
                          <button
                      onClick={() => navigate(`/channel/${channel.id}`)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">

                            Voir le canal
                          </button>
                          <button className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700">
                            Gérer les membres
                          </button>
                          <button 
                            onClick={() => handleEditChannelClick(channel)}
                            className="px-3 py-1.5 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700">
                            Paramètres du canal
                          </button>
                          <button className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
                            Supprimer
                          </button>
                        </div>
                      </div>
                }
                  </div>
              )}
              </div>
            </div>
          }
          {/* Section Revenus et Retraits */}
          {activeSection === 'earnings' &&
          <div>
              <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
                Revenus et Retraits
              </h3>
              {/* Résumé des revenus */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Solde disponible
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {totalRevenue.toFixed(2)}€
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Retraits sans frais
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Revenus ce mois
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    325.75€
                  </div>
                  <div className="text-xs text-green-500 dark:text-green-400 mt-1">
                    +12.5% vs mois dernier
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Revenus totaux
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    1,245.50€
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Depuis le 15/02/2023
                  </div>
                </div>
              </div>
              {/* Graphique des revenus par canal */}
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm mb-6">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Répartition des revenus par canal
                </h4>
                <div className="space-y-3">
                  {userChannels.map((channel) =>
                <div key={channel.id}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded overflow-hidden mr-2">
                            <img
                          src={channel.image}
                          alt={channel.name}
                          className="w-full h-full object-cover" />

                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {channel.name}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {channel.revenue.toFixed(2)}€
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
                        <DynamicWidthBar
                      progress={channel.revenue / totalRevenue * 100}
                      className={`progress-bar-fill ${channel.id === 'channel-1' ? 'bg-blue-500' : channel.id === 'channel-2' ? 'bg-green-500' : 'bg-purple-500'}`}
                    />
                      </div>
                    </div>
                )}
                </div>
              </div>
              {/* Formulaire de retrait */}
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm mb-6">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Effectuer un retrait
                </h4>
                {withdrawalStatus &&
              <div
                className={`p-3 rounded-lg mb-4 ${withdrawalStatus.success ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`}>

                    {withdrawalStatus.message}
                  </div>
              }
                <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Montant (€)
                    </label>
                    <input
                    type="number"
                    min="10"
                    step="0.01"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                    placeholder="Montant minimum: 10€" />

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Méthode de paiement
                    </label>
                    <select
                  title="Catégorie du canal"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm">
                      <option value="bank">Virement bancaire</option>
                      <option value="paypal">PayPal</option>
                      <option value="stripe">Carte bancaire</option>
                    </select>
                  </div>
                  <div className="pt-2">
                    <button
                    title="Demander un retrait"
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">

                      Demander un retrait
                    </button>
                  </div>
                </form>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <p className="font-medium">
                    Conditions de retrait pour comptes Pro:
                  </p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Frais de retrait: 10% du montant retiré</li>
                    <li>Montant minimum de retrait: 50€</li>
                    <li>
                      Retraits disponibles uniquement les jeudis et vendredis
                    </li>
                    <li>Délai de traitement: 48h</li>
                  </ul>
                </div>
              </div>
              {/* Historique des transactions */}
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Historique des transactions
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          10/10/2023
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          Retrait
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          Virement bancaire
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-right">
                          -250.00€
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Complété
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          05/10/2023
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          Revenu
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          Abonnements - Premier League Insights
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-right">
                          +125.00€
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Complété
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          01/10/2023
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          Revenu
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          Abonnements - Pronos Ligue 1
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-right">
                          +175.50€
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Complété
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }
          {/* Section Profil */}
          {activeSection === 'profile' &&
          <div>
              <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
                Profil
              </h3>
              <form onSubmit={handleProfileSubmit}>
                <div className="space-y-4">
                  <div className="flex flex-col items-center md:flex-row md:items-start mb-4">
                    <div className="relative w-24 h-24 mb-4 md:mb-0 md:mr-6">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                        <img
                        src={
                        user?.avatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
                        }
                        alt={user?.username || 'Utilisateur Pro'}
                        className="w-full h-full object-cover" />

                      </div>
                      <div
                      className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={handleAvatarClick}>

                        <span className="text-white text-xs font-medium cursor-pointer p-2 text-center">
                          Modifier
                          <input
                          title="Changer de photo de profil"
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarChange} />

                        </span>
                      </div>
                    </div>
                    <div className="md:flex-1">
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nom d'utilisateur
                          </label>
                          <input
                          id="pro-username"
                          name="username"
                          title="Nom d'utilisateur"
                          type="text"
                          defaultValue={user?.username || ''}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm" />

                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                          </label>
                          <input
                          id="pro-email"
                          name="email"
                          title="Email"
                          type="email"
                          defaultValue={user?.email || ''}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm" />

                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    <textarea
                    id="pro-bio"
                    name="bio"
                    title="Bio"
                    defaultValue={user?.bio || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm"
                    rows={3}
                    placeholder="Parlez-nous de vous...">
                  </textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Spécialités
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div className="flex items-center">
                        <input
                        title="Football"
                        type="checkbox"
                        id="football"
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        defaultChecked />

                        <label
                        htmlFor="football"
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300">

                          Football
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                        title="Basketball"
                        type="checkbox"
                        id="basketball"
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />

                        <label
                        htmlFor="basketball"
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300">

                          Basketball
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                        title="Tennis"
                        type="checkbox"
                        id="tennis"
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        defaultChecked />

                        <label
                        htmlFor="tennis"
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300">

                          Tennis
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                        title="Rugby"
                        type="checkbox"
                        id="rugby"
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />

                        <label
                        htmlFor="rugby"
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300">

                          Rugby
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                        title="Hockey"
                        type="checkbox"
                        id="hockey"
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />

                        <label
                        htmlFor="hockey"
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300">

                          Hockey
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                        title="Autre"
                        type="checkbox"
                        id="other"
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />

                        <label
                        htmlFor="other"
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300">

                          Autres
                        </label>
                      </div>
                    </div>
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
              
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Méthodes de paiement enregistrées
                </h4>
                <div className="space-y-3">
                  {(user?.paymentMethods || []).map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div className="flex items-center">
                        <div className="w-10 h-6 bg-gray-200 dark:bg-gray-600 rounded mr-3 flex items-center justify-center">
                          <span className="text-[10px] font-bold uppercase">{method.type}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{method.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{method.details}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Supprimer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={handleAddPaymentMethod}
                    className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-500 dark:text-gray-400 hover:border-green-500 hover:text-green-500 transition-all flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Ajouter une méthode de paiement
                  </button>
                </div>
              </div>
            </div>
          }
          {/* Section Notifications */}
          {activeSection === 'notifications' &&
          <div>
              <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
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
          {/* Section Sécurité */}
          {activeSection === 'security' &&
          <div>
              <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mot de passe actuel
                      </label>
                      <input
                      title="Mot de passe actuel"
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                      placeholder="••••••••••••" />

                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nouveau mot de passe
                      </label>
                      <input
                      title="Nouveau mot de passe"
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                      placeholder="••••••••••••" />

                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
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
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 018 0 4 4 0 01-8 0z" />

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
                            d="M12 20l-1.5-1.5m-1.5 1.5l-1.5-1.5m-1.5 1.5l1.5-1.5m1.5 1.5l1.5 1.5M12 12a3 3 0 110 6 3 3 0 010-6z" />

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
                      <button
                      title="Déconnecter la session"
                      className="text-xs text-red-600 dark:text-red-400 hover:underline">
                        Déconnecter
                      </button>
                    </div>
                    <div className="pt-2">
                      <button
                      title="Déconnecter toutes les autres sessions"
                      className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium">
                        Déconnecter toutes les autres sessions
                      </button>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Authentification à deux facteurs
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Renforcez la sécurité de votre compte en ajoutant une étape
                    de vérification supplémentaire lors de la connexion.
                  </p>
                  <button
                  title="Activer l'A2F"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                    Activer l'authentification à deux facteurs
                  </button>
                </div>
              </div>
            </div>
          }

          {/* Section À propos */}
          {activeSection === 'about' &&
          <div>
              <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
                À propos
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    PronosBox
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    PronosBox est une plateforme innovante dédiée aux pronostics
                    sportifs et à l'analyse de données sportives. Notre mission
                    est de fournir aux passionnés de sport des outils avancés
                    pour améliorer leur expérience et leurs performances de
                    pronostics.
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Votre compte Pro
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    En tant qu'utilisateur Pro, vous bénéficiez d'avantages
                    exclusifs:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <li>Création et gestion illimitée de canaux</li>
                    <li>Monétisation de votre contenu</li>
                    <li>Retraits sans frais</li>
                    <li>Statistiques avancées</li>
                    <li>Support prioritaire</li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Informations légales
                  </h4>
                  <div className="space-y-2">
                    <button
                    onClick={() => handleLegalPageClick('terms')}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 block">

                      Conditions Générales d'Utilisation
                    </button>
                    <button
                    onClick={() => handleLegalPageClick('privacy')}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 block">

                      Politique de Confidentialité
                    </button>
                    <button
                    onClick={() => handleLegalPageClick('cookies')}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 block">

                      Politique des Cookies
                    </button>
                    <button
                    onClick={() => handleLegalPageClick('legal')}
                    className="text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 block">

                      Mentions Légales
                    </button>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Version
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Application: v2.3.1
                    <br />
                    Dernière mise à jour: 15 octobre 2023
                  </p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
      {/* Modal pour recharger le compte */}
      {showRechargeModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
            <div className="relative px-4 py-3 bg-green-600 text-white">
              <h3 className="text-base font-medium">Recharger mon compte</h3>
              <button
              title="Fermer le modal"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Montant à recharger (€)
                </label>
                <input
                title="Montant à recharger"
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
                  <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                    title="Carte bancaire"
                    type="radio"
                    id="card"
                    name="paymentMethod"
                    checked={true}
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
                    Frais (0%)
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    0.00€
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Total à payer
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {rechargeAmount.toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                title="Retour"
                onClick={() => setShowRechargeModal(false)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">

                  Retour
                </button>
                <button
                title="Procéder au paiement"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Montant à retirer (€)
                </label>
                <input
                title="Montant à retirer"
                type="number"
                min="50"
                max={user?.walletBalance || 0}
                step="5"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                placeholder="Minimum: 50€" />

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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm">
                  <option value="bank">Virement bancaire</option>
                  <option value="mobile">Mobile Money</option>
                  <option value="crypto">Crypto-monnaie</option>
                </select>
              </div>
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
                      Les retraits sont traités dans un délai de 48h, uniquement
                      les jeudis et vendredis. Des frais de 10% s'appliquent sur
                      tous les retraits.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Montant demandé
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {parseFloat(withdrawalAmount || '0').toFixed(2)}€
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Frais (10%)
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {(parseFloat(withdrawalAmount || '0') * 0.1).toFixed(2)}€
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Montant net à recevoir
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {(parseFloat(withdrawalAmount || '0') * 0.9).toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                title="Retour"
                onClick={() => setShowWithdrawModal(false)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">

                  Retour
                </button>
                <button
                title="Confirmer le retrait"
                onClick={handleWithdraw}
                className="px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center"
                disabled={
                parseFloat(withdrawalAmount) > (user?.walletBalance || 0) ||
                parseFloat(withdrawalAmount) < 50
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
      {/* Modal pour voir les statistiques détaillées */}
      {showStatsModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl mx-4 overflow-hidden">
            <div className="relative px-4 py-3 bg-purple-600 text-white">
              <h3 className="text-base font-medium">Statistiques détaillées</h3>
              <button
              title="Fermer"
              onClick={() => setShowStatsModal(false)}
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
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Performance globale
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Taux de réussite
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {proStats.successRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <DynamicWidthBar
                        progress={proStats.successRate}
                        className="bg-green-500 progress-bar-fill"
                      />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Niveau d'habilitation
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {proStats.habilitationLevel}/5
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <DynamicWidthBar
                        progress={proStats.habilitationLevel / 5 * 100}
                        className="bg-yellow-500 progress-bar-fill"
                      />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Pronostics totaux
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {proStats.totalPredictions}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Cote moyenne
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {proStats.averageOdds}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Meilleure série
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {proStats.bestStreak} victoires
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Classement
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          #{proStats.rankingPosition}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Performance financière
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Revenus totaux
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {proStats.totalEarnings.toFixed(2)}€
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Revenus mensuels
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {proStats.avgMonthlyRevenue.toFixed(2)}€
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Abonnés totaux
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {totalSubscriptions}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Vues totales
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {totalViews}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Évolution des revenus (6 derniers mois)
                      </div>
                      <div className="h-40 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-end justify-between p-2">
                        {/* Simulation de graphique avec des barres */}
                        <div className="w-1/6 h-[35%] bg-green-500 rounded-t-sm"></div>
                        <div className="w-1/6 h-[45%] bg-green-500 rounded-t-sm"></div>
                        <div className="w-1/6 h-[30%] bg-green-500 rounded-t-sm"></div>
                        <div className="w-1/6 h-[50%] bg-green-500 rounded-t-sm"></div>
                        <div className="w-1/6 h-[70%] bg-green-500 rounded-t-sm"></div>
                        <div className="w-1/6 h-[85%] bg-green-500 rounded-t-sm"></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>Mai</span>
                        <span>Juin</span>
                        <span>Juil</span>
                        <span>Août</span>
                        <span>Sept</span>
                        <span>Oct</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 mb-6">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Performance par sport
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Football
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        78%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-[78%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Tennis
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        65%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-[65%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Basketball
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        82%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full w-[82%]"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Pronostics récents
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          PSG vs OM
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          10/10/2023 - Ligue 1
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                        Gagné
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          Man City vs Liverpool
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          08/10/2023 - Premier League
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-300 text-xs font-medium rounded-full">
                        Perdu
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          Inter vs Juventus
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          05/10/2023 - Serie A
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                        Gagné
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Recommandations
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm rounded-lg">
                      <p className="font-medium">
                        Améliorer vos pronostics Tennis
                      </p>
                      <p className="text-xs mt-1">
                        Votre taux de réussite en Tennis est inférieur à votre
                        moyenne. Concentrez-vous sur les matchs de joueurs du
                        Top 20 pour améliorer vos résultats.
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm rounded-lg">
                      <p className="font-medium">Potentiel de croissance</p>
                      <p className="text-xs mt-1">
                        Vos pronostics Basketball ont un excellent taux de
                        réussite. Envisagez de créer un canal spécialisé pour
                        attirer plus d'abonnés.
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 text-sm rounded-lg">
                      <p className="font-medium">Engagement des abonnés</p>
                      <p className="text-xs mt-1">
                        Publiez plus régulièrement pour augmenter l'engagement.
                        Les canaux avec des publications quotidiennes ont 45%
                        d'engagement en plus.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                title="Fermer"
                onClick={() => setShowStatsModal(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      {/* Modal pour gérer les abonnés */}
      {showSubscribersModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl mx-4 overflow-hidden">
            <div className="relative px-4 py-3 bg-yellow-600 text-white">
              <h3 className="text-base font-medium">Gestion des abonnés</h3>
              <button
              title="Fermer"
              onClick={() => setShowSubscribersModal(false)}
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
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">
                    Abonnés par canal
                  </h4>
                  <div className="relative">
                    <input
                    title="Rechercher un abonné"
                    type="text"
                    placeholder="Rechercher un abonné..."
                    className="px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm w-64" />

                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">

                      <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />

                    </svg>
                  </div>
                </div>
                <div className="space-y-4">
                  {userChannels.map((channel) =>
                <div
                  key={channel.id}
                  className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">

                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-600 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded overflow-hidden mr-3">
                            <img
                          src={channel.image}
                          alt={channel.name}
                          className="w-full h-full object-cover" />

                          </div>
                          <div>
                            <h5 className="font-medium text-gray-800 dark:text-gray-200">
                              {channel.name}
                            </h5>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {channel.subscriptions} abonnés
                            </div>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-yellow-600 text-white rounded-md text-xs font-medium hover:bg-yellow-700">
                          Exporter
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Utilisateur
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Date d'abonnement
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Montant
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Statut
                                </th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                              {[1, 2, 3].map((item) => (
                                <tr
                                  key={item}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-600/50">

                                  <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-gray-200 dark:bg-gray-600">
                                        <img
                                    src={`https://randomuser.me/api/portraits/men/${item + 10}.jpg`}
                                    alt="Abonné"
                                    className="w-full h-full object-cover" />

                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-800 dark:text-gray-200">
                                          Utilisateur {item}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          utilisateur{item}@example.com
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    {`${10 - item}/10/2023`}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    {`${5 * item}.00€`}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                      Actif
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right">
                                    <button className="text-blue-600 dark:text-blue-400 hover:underline text-xs mr-2">
                                      Message
                                    </button>
                                    <button className="text-red-600 dark:text-red-400 hover:underline text-xs">
                                      Bloquer
                                    </button>
                                  </td>
                                </tr>
                          ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                )}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 mb-6">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Statistiques d'abonnement
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Nouveaux abonnés (30j)
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      +24
                    </div>
                    <div className="text-xs text-green-500">
                      +15% vs mois précédent
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Taux de rétention
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      87%
                    </div>
                    <div className="text-xs text-green-500">
                      +3% vs mois précédent
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Revenu moyen par abonné
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      5.75€
                    </div>
                    <div className="text-xs text-red-500">
                      -0.25€ vs mois précédent
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                title="Fermer"
                onClick={() => setShowSubscribersModal(false)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      {/* Modal pour créer un canal */}
      {showCreateChannelModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
            <div className="relative px-4 py-3 bg-green-600 text-white">
              <h3 className="text-base font-medium">
                {editingChannel ? 'Modifier le canal' : 'Créer un nouveau canal'}
              </h3>
              <button
              title="Fermer"
              onClick={() => setShowCreateChannelModal(false)}
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom du canal *
                  </label>
                  <input
                  title="Nom du canal"
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                  placeholder="Ex: Pronostics Ligue 1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                  title="Description du canal"
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                  placeholder="Décrivez votre canal en quelques mots..."
                  rows={3}>
                </textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Catégorie
                  </label>
                  <select
                  title="Catégorie du canal"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm">
                    <option value="football">Football</option>
                    <option value="basketball">Basketball</option>
                    <option value="tennis">Tennis</option>
                    <option value="rugby">Rugby</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                  title="Canal premium"
                  type="checkbox"
                  id="premium-channel"
                  checked={newChannelIsPremium}
                  onChange={(e) => setNewChannelIsPremium(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />

                  <label
                  htmlFor="premium-channel"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300">

                    Canal premium (contenu payant)
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                onClick={() => {
                  setShowCreateChannelModal(false);
                  setEditingChannel(null);
                  setNewChannelName('');
                  setNewChannelDescription('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                disabled={isCreatingChannel}>
                  Annuler
                </button>
                <button
                onClick={editingChannel ? handleUpdateChannel : handleCreateChannel}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center"
                disabled={isCreatingChannel}>

                  {isCreatingChannel ?
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
                      {editingChannel ? 'Mise à jour...' : 'Création...'}
                    </> :

                (editingChannel ? 'Mettre à jour' : 'Créer le canal')
                }
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      {/* Affichage des pages légales */}
      {activeLegalPage &&
      <LegalContent type={activeLegalPage as 'terms' | 'privacy' | 'cookies' | 'legal'} onClose={handleCloseLegalPage} />
      }
    </>);

};
export default SettingsProUser;