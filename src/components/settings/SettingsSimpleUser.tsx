import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createTransaction } from '../../services/api';
import SubscriptionModal from '../SubscriptionModal';

export interface UserData {
  id?: string;
  username: string;
  email?: string;
  isPro: boolean;
  walletBalance?: number;
  avatar?: string;
}

export interface SupportMessage {
  id: number;
  sender: 'system' | 'agent' | 'user';
  message: string;
  time: string;
}

export interface PaymentMethod {
  id: number | string;
  type: string;
  name: string;
  details: string;
  icon: string;
}

const SettingsSimpleUser: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Pas d'onglet ouvert par défaut
  const [activeSection, setActiveSection] = useState('profile');

  const handleSectionClick = (section: string) => {
    setActiveSection(activeSection === section ? '' : section);
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

  // États pour la gestion du portefeuille
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(50);
  const [withdrawAmount, setWithdrawAmount] = useState(50);
  const [rechargeMethod, setRechargeMethod] = useState('card');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  // État pour l'abonnement Pro
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  // État pour la chatbox de support
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportMessages, setSupportMessages] = useState([
  {
    id: 1,
    sender: 'system',
    message:
    "Bienvenue dans le service client PronosBox! Comment pouvons-nous vous aider aujourd'hui?",
    time: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }]
  );
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  // États pour les notifications
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
  // État pour les méthodes de paiement
  // Payment methods are handled via AuthContext user object
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [newPaymentMethod, setNewPaymentMethod] = useState<Record<string, any>>({
    type: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });
  // Fonction pour devenir Pro (paiement unique de 10€)
  const handleBecomePro = async () => {
    if ((user?.walletBalance || 0) < 10) {
      setShowRechargeModal(true);
      return;
    }
    setIsProcessingPayment(true);
    try {
      await createTransaction({
        type: 'subscription',
        amount: 10,
        description: 'Passage au statut Pro'
      });
      // L'état de l'utilisateur sera mis à jour via le WebSocket ou un rechargement manuel si nécessaire
      // Mais ici AuthContext devrait normalement être informé par l'API
      if (updateUser) {
        await updateUser({
          isPro: true,
          walletBalance: (user?.walletBalance || 0) - 10
        });
      }
    } catch (error) {
      console.error('Erreur lors du passage en Pro:', error);
    } finally {
      setIsProcessingPayment(false);
    }
  };
  // Fonction pour gérer la recharge du compte
  const handleRecharge = async () => {
    if (rechargeAmount < 10) return;
    setIsProcessingPayment(true);
    try {
      await createTransaction({
        type: 'recharge',
        amount: rechargeAmount,
        description: 'Recharge du compte'
      });
      if (updateUser) {
        await updateUser({
          walletBalance: (user?.walletBalance || 0) + rechargeAmount
        });
      }
      setShowRechargeModal(false);
    } catch (error) {
      console.error('Erreur lors de la recharge:', error);
    } finally {
      setIsProcessingPayment(false);
    }
  };
  // Fonction pour gérer le retrait
  const handleWithdraw = async () => {
    if (withdrawAmount < 10 || withdrawAmount > (user?.walletBalance || 0))
    return;
    setIsProcessingWithdraw(true);
    try {
      await createTransaction({
        type: 'withdrawal',
        amount: withdrawAmount,
        description: 'Demande de retrait'
      });
      if (updateUser) {
        await updateUser({
          walletBalance: (user?.walletBalance || 0) - withdrawAmount
        });
      }
      setShowWithdrawModal(false);
    } catch (error) {
      console.error('Erreur lors du retrait:', error);
    } finally {
      setIsProcessingWithdraw(false);
    }
  };
  
  const handleDeletePaymentMethod = async (id: string | number) => {
    if (updateUser && user) {
      const updatedMethods = (user.paymentMethods || []).filter((m) => m.id !== id);
      await updateUser({ paymentMethods: updatedMethods });
    }
  };

  const handleAddPaymentMethod = async () => {
    if (
    newPaymentMethod.type === 'card' && (
    !newPaymentMethod.cardNumber ||
    !newPaymentMethod.expiryDate ||
    !newPaymentMethod.cvv))
    {
      alert('Veuillez remplir tous les champs requis');
      return;
    }
    const newMethod = {
      id: Date.now().toString(),
      type: newPaymentMethod.type,
      name:
      newPaymentMethod.type === 'card' ?
      `Carte se terminant par ${newPaymentMethod.cardNumber.slice(-4)}` :
      newPaymentMethod.type === 'mobile' ?
      'Compte Mobile Money' :
      'Portefeuille Crypto',
      details:
      newPaymentMethod.type === 'card' ?
      `Expire le ${newPaymentMethod.expiryDate}` :
      '',
      icon: newPaymentMethod.type
    };
    if (updateUser && user) {
      await updateUser({ paymentMethods: [...(user.paymentMethods || []), newMethod] });
      setShowAddPaymentModal(false);
      // Réinitialiser le formulaire
      setNewPaymentMethod({
        type: 'card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolder: ''
      });
    }
  };

  // Fonction d'ouverture du chat support
  const handleOpenSupportChat = (category = '') => {
    setShowSupportChat(true);
    // Si une catégorie est spécifiée, ajoutez un message système pour contextualiser
    if (category) {
      const categoryMessages: Record<string, string> = {
        account:
        'Je vois que vous avez des questions concernant votre compte. Comment puis-je vous aider?',
        payment:
        "Vous avez des questions sur les paiements. N'hésitez pas à me détailler votre problème.",
        technical:
        'Vous rencontrez un problème technique? Décrivez-le moi en détail et je ferai de mon mieux pour vous aider.'
      };
      if (categoryMessages[category]) {
        setTimeout(() => {
          setSupportMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: 'agent',
            message: categoryMessages[category],
            time: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })
          }]
          );
        }, 500);
      }
    }
  };
  // Fonction pour fermer le chat support
  const handleCloseSupportChat = () => {
    setShowSupportChat(false);
    // Réinitialiser la conversation si l'utilisateur ferme le chat
    if (supportMessages.length > 1) {
      setSupportMessages([
      {
        id: 1,
        sender: 'system',
        message:
        "Bienvenue dans le service client PronosBox! Comment pouvons-nous vous aider aujourd'hui?",
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }]
      );
    }
  };
  // Fonction pour envoyer un message de support
  const handleSupportMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    const newMessage = {
      id: supportMessages.length + 1,
      sender: 'user',
      message: supportMessage,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    setSupportMessages([...supportMessages, newMessage]);
    setSupportMessage('');
    // Simuler une réponse après 1 seconde
    setTimeout(() => {
      const responseMessage: SupportMessage = {
        id: supportMessages.length + 2,
        sender: 'agent',
        message: '',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      // Personnaliser la réponse en fonction du message ou de la catégorie
      const userMessageLower = supportMessage.toLowerCase();
      if (
      userMessageLower.includes('remboursement') ||
      userMessageLower.includes('paiement'))
      {
        responseMessage.message =
        'Pour toute demande de remboursement, veuillez nous fournir votre numéro de transaction et la raison de votre demande. Notre équipe traitera votre demande dans un délai de 48h ouvrables.';
      } else if (
      userMessageLower.includes('compte') ||
      userMessageLower.includes('mot de passe'))
      {
        responseMessage.message =
        "Pour les problèmes liés à votre compte ou à la réinitialisation de mot de passe, veuillez vérifier votre boîte mail (y compris les spams). Si vous n'avez rien reçu, nous pouvons vous envoyer un nouveau lien.";
      } else if (
      userMessageLower.includes('bug') ||
      userMessageLower.includes('erreur'))
      {
        responseMessage.message =
        "Merci de nous signaler ce problème. Pourriez-vous nous préciser sur quel appareil et navigateur vous rencontrez cette erreur? Une capture d'écran serait également très utile.";
      } else {
        responseMessage.message =
        'Merci pour votre message. Un conseiller va vous répondre dans les plus brefs délais. Votre demande a été enregistrée sous le numéro #' +
        Math.floor(Math.random() * 10000) +
        '.';
      }
      setSupportMessages((prev) => [...prev, responseMessage]);
    }, 1000);
  };
  // Fonction pour enregistrer les préférences de notifications
  const handleSaveNotificationPreferences = () => {
    // Ici, vous pourriez envoyer ces préférences à une API
    alert('Préférences de notifications enregistrées avec succès!');
  };

  return (
    <>
      {/* Bannière Pro pour les utilisateurs non-Pro */}
      {!user?.isPro &&
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 mb-6 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 md:mr-6">
              <h3 className="text-white font-bold text-lg md:text-xl mb-2">
                Passez à PronosBox Pro
              </h3>
              <p className="text-yellow-100 text-sm md:text-base">
                Créez vos propres canaux, monétisez vos pronostics et accédez à
                toutes les fonctionnalités premium.
              </p>
              <ul className="mt-2 space-y-1">
                <li className="text-yellow-100 text-xs md:text-sm flex items-center">
                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7" />

                  </svg>
                  Créez et monétisez vos propres canaux
                </li>
                <li className="text-yellow-100 text-xs md:text-sm flex items-center">
                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7" />

                  </svg>
                  Access aux statistiques avancées
                </li>
                <li className="text-yellow-100 text-xs md:text-sm flex items-center">
                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7" />

                  </svg>
                  Support prioritaire
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-white text-center mb-2">
                <span className="text-2xl md:text-3xl font-bold">10€</span>
                <span className="text-yellow-100 text-xs ml-1">
                  paiement unique
                </span>
              </div>
              <button
              title="Devenir Pro"
              onClick={handleBecomePro}
              className="px-6 py-3 bg-white text-yellow-700 rounded-full text-sm md:text-base font-bold hover:bg-yellow-100 transition-colors shadow-md flex items-center"
              disabled={isProcessingPayment}>

                {isProcessingPayment ?
              <>
                    <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-700"
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

              <>
                    Devenir Pro maintenant
                    <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                      <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3" />

                    </svg>
                  </>
              }
              </button>
            </div>
          </div>
        </div>
      }
      {/* En-tête du profil */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 flex items-center">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-green-500 flex-shrink-0">
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
                title="Recharger"
                onClick={() => setShowRechargeModal(true)}
                className="text-xs px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-700">

                Recharger
              </button>
              <button
                title="Retirer"
                onClick={() => setShowWithdrawModal(true)}
                className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600">

                Retirer
              </button>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          {user?.isPro &&
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
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
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />

              </svg>
              Pro
            </span>
          }
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {/* Liste des sections */}
        <div className="space-y-3 p-4">
          {/* Section Profil */}
          <div
            className={`p-3 border ${activeSection === 'profile' ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all`}
            onClick={() => handleSectionClick('profile')}>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />

                </svg>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Profil
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Modifier vos informations personnelles
                  </p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-gray-400 transition-transform ${activeSection === 'profile' ? 'transform rotate-180' : ''}`}
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
          {/* Contenu de la section Profil */}
          {activeSection === 'profile' &&
          <div className="ml-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm">
              <h3 className="text-lg font-medium mb-4 dark:text-white">
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
                        alt={user?.username || 'Utilisateur'}
                        className="w-full h-full object-cover" />

                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <label
                        htmlFor="avatar-upload"
                        className="text-white text-xs font-medium cursor-pointer p-2 text-center">

                          Modifier
                          <input
                          title="Avatar"
                          type="file"
                          id="avatar-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarChange} />

                        </label>
                      </div>
                    </div>
                    <div className="md:flex-1">
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nom d'utilisateur
                          </label>
                          <input
                          id="username"
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
                          id="email"
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
                    id="bio"
                    name="bio"
                    title="Bio"
                    defaultValue={user?.bio || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm"
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
          {/* Section Sécurité */}
          <div
            className={`p-3 border ${activeSection === 'security' ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all`}
            onClick={() => handleSectionClick('security')}>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />

                </svg>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sécurité
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Mot de passe et authentification
                  </p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-gray-400 transition-transform ${activeSection === 'security' ? 'transform rotate-180' : ''}`}
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
          {/* Contenu de la section Sécurité */}
          {activeSection === 'security' &&
          <div className="ml-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm">
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mot de passe actuel
                      </label>
                      <input
                      title="Mot de passe actuel"
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm"
                      placeholder="••••••••••••" />

                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nouveau mot de passe
                      </label>
                      <input
                      title="Nouveau mot de passe"
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm"
                      placeholder="••••••••••••" />

                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                      title="Confirmer le nouveau mot de passe"
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm"
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
                      <button
                      title="Déconnecter"
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
              </div>
            </div>
          }
          {/* Section Notifications */}
          <div
            className={`p-3 border ${activeSection === 'notifications' ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all`}
            onClick={() => handleSectionClick('notifications')}>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />

                </svg>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notifications
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Gérer vos préférences de notifications
                  </p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-gray-400 transition-transform ${activeSection === 'notifications' ? 'transform rotate-180' : ''}`}
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
          {/* Contenu de la section Notifications */}
          {activeSection === 'notifications' &&
          <div className="ml-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm">
              <h3 className="text-lg font-medium mb-4 dark:text-white">
                Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notifications par email
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Recevoir des emails pour les mises à jour importantes
                    </p>
                  </div>
                  <label className="relative inline-block w-10 mr-2 align-middle select-none">
                        <button
                          title={`Notifications par email: ${emailNotifications ? 'Désactiver' : 'Activer'}`}
                          onClick={() => handleNotificationChange('email', !emailNotifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${emailNotifications ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notifications push
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Recevoir des notifications sur votre appareil
                    </p>
                  </div>
                  <label className="relative inline-block w-10 mr-2 align-middle select-none">
                        <button
                          title={`Notifications push: ${pushNotifications ? 'Désactiver' : 'Activer'}`}
                          onClick={() => handleNotificationChange('push', !pushNotifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${pushNotifications ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notifications de matchs
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Alertes pour les matchs suivis et résultats
                    </p>
                  </div>
                  <label className="relative inline-block w-10 mr-2 align-middle select-none">
                        <button
                          title={`Notifications de matchs: ${matchNotifications ? 'Désactiver' : 'Activer'}`}
                          onClick={() => handleNotificationChange('matches', !matchNotifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${matchNotifications ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${matchNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notifications de canaux
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Alertes pour les nouveaux messages dans vos canaux
                    </p>
                  </div>
                  <label className="relative inline-block w-10 mr-2 align-middle select-none">
                        <button
                          title={`Notifications de canaux: ${channelNotifications ? 'Désactiver' : 'Activer'}`}
                          onClick={() => handleNotificationChange('channels', !channelNotifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${channelNotifications ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${channelNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                  </label>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                  title="Enregistrer les préférences"
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                  onClick={handleSaveNotificationPreferences}>

                    Enregistrer les préférences
                  </button>
                </div>
              </div>
            </div>
          }
          {/* Section Portefeuille */}
          <div
            className={`p-3 border ${activeSection === 'wallet' ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all`}
            onClick={() => handleSectionClick('wallet')}>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />

                </svg>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Portefeuille
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Gérer vos finances et transactions
                  </p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-gray-400 transition-transform ${activeSection === 'wallet' ? 'transform rotate-180' : ''}`}
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
          {/* Contenu de la section Portefeuille */}
          {activeSection === 'wallet' &&
          <div className="ml-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm">
              <h3 className="text-lg font-medium mb-4 dark:text-white">
                Portefeuille
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Solde actuel
                    </h4>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {user?.walletBalance?.toFixed(2) || '0.00'}€
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                    title="Recharger"
                    onClick={() => setShowRechargeModal(true)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">

                      Recharger
                    </button>
                    <button
                    title="Retirer"
                    onClick={() => setShowWithdrawModal(true)}
                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500">

                      Retirer
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dernières transactions
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          Recharge via Carte bancaire
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          22/10/2023 - 14:32
                        </p>
                      </div>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        +50.00€
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          Abonnement Canal Premium
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          15/10/2023 - 09:15
                        </p>
                      </div>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        -15.00€
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button
                    title="Voir toutes les transactions"
                    onClick={() => navigate('/transactions')}
                    className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium">

                      Voir toutes les transactions
                    </button>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Méthodes de paiement enregistrées
                  </h4>
                  <div className="space-y-2">
                    {(user?.paymentMethods || []).map((method) => (
                  <div
                    key={method.id}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">

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
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />

                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {method.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {method.details}
                            </p>
                          </div>
                        </div>
                        <button
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                      onClick={() => handleDeletePaymentMethod(method.id)}>

                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <button
                    className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
                    onClick={() => setShowAddPaymentModal(true)}>

                      Ajouter une méthode de paiement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
          {/* Section Aide & Support */}
          <div
            className={`p-3 border ${activeSection === 'support' ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all`}
            onClick={() => handleSectionClick('support')}>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

                </svg>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Aide & Support
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Besoin d'aide ? Contactez-nous
                  </p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-gray-400 transition-transform ${activeSection === 'support' ? 'transform rotate-180' : ''}`}
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
          {activeSection === 'support' &&
          <div className="ml-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Notre équipe est disponible pour répondre à vos questions concernant les paiements, l'accès Pro ou tout problème technique.
                </p>
                <div className="flex flex-col space-y-2">
                  <a
                  href="mailto:support@pronosbox.com"
                  className="flex items-center text-sm text-green-600 dark:text-green-400 hover:underline">

                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">

                      <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8M3 8l7.89 5.26" />

                    </svg>
                    support@pronosbox.com
                  </a>
                  <p className="text-xs text-gray-500">
                    Délai de réponse moyen : 24h
                  </p>
                </div>
                <button
                onClick={() => handleOpenSupportChat()}
                className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">

                  Ouvrir le chat d'assistance
                </button>
              </div>
            </div>
          }

          {/* Section FAQ */}
          <div
            className={`p-3 border ${activeSection === 'faq' ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all`}
            onClick={() => handleSectionClick('faq')}>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3"
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
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Questions fréquentes (FAQ)
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tout savoir sur PronosBox
                  </p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-gray-400 transition-transform ${activeSection === 'faq' ? 'transform rotate-180' : ''}`}
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
          {activeSection === 'faq' &&
          <div className="ml-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm">
              <div className="space-y-4">
                <div className="border-b border-gray-100 dark:border-gray-700 pb-2">
                  <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Comment devenir membre Pro ?</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Un paiement unique de 10€ vous donne un accès à vie. Pas d'abonnement récurrent.
                  </p>
                </div>
                <div className="border-b border-gray-100 dark:border-gray-700 pb-2">
                  <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Quels modes de paiement utilisez-vous ?</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Nous acceptons Orange Money, MTN, Moov via FedaPay, ainsi que les cartes Visa/Mastercard.
                  </p>
                </div>
                <div className="border-b border-gray-100 dark:border-gray-700 pb-2">
                  <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Comment fonctionnent les retraits ?</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Les demandes de retrait sont validées manuellement par nos administrateurs sous 24-48h pour garantir la sécurité.
                  </p>
                </div>
              </div>
            </div>
          }

          {/* Section À propos */}
          <div
            className={`p-3 border ${activeSection === 'about' ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all`}
            onClick={() => handleSectionClick('about')}>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3"
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
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    À propos
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Version et informations légales
                  </p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-gray-400 transition-transform ${activeSection === 'about' ? 'transform rotate-180' : ''}`}
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
          {activeSection === 'about' &&
          <div className="ml-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  PronosBox est une plateforme dédiée à l'analyse sportive et au partage de pronostics entre passionnés.
                </p>
                <div className="pt-2">
                  <p className="text-xs text-gray-500">Version 2.9.1 (Stabilization)</p>
                  <p className="text-xs text-gray-500">© 2026 PronosBox - Tous droits réservés</p>
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm"
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
                    title="Crypto-monnaie"
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
                    <select
                    title="Opérateur"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm">
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
                    <select
                    title="Crypto-monnaie"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm">
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
                      Les retraits sont traités sous 24-48h ouvrables. Aucun
                      frais ne s'applique sur les retraits.
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
      {/* Modal pour l'abonnement Pro */}
      {showSubscriptionModal &&
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)} />

      }
      {/* Modal pour ajouter une méthode de paiement */}
      {showAddPaymentModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
            <div className="relative px-4 py-3 bg-green-600 text-white">
              <h3 className="text-base font-medium">
                Ajouter une méthode de paiement
              </h3>
              <button
              title="Fermer"
              onClick={() => setShowAddPaymentModal(false)}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de méthode de paiement
                </label>
                <div className="space-y-2">
                  <div
                  className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() =>
                  setNewPaymentMethod({
                    ...newPaymentMethod,
                    type: 'card'
                  })
                  }>

                    <input
                    title="Carte bancaire"
                    type="radio"
                    id="new-card"
                    name="newPaymentMethod"
                    checked={newPaymentMethod.type === 'card'}
                    onChange={() =>
                    setNewPaymentMethod({
                      ...newPaymentMethod,
                      type: 'card'
                    })
                    }
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500" />

                    <label
                    htmlFor="new-card"
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
                  onClick={() =>
                  setNewPaymentMethod({
                    ...newPaymentMethod,
                    type: 'mobile'
                  })
                  }>

                    <input
                    title="Mobile Money"
                    type="radio"
                    id="new-mobile"
                    name="newPaymentMethod"
                    checked={newPaymentMethod.type === 'mobile'}
                    onChange={() =>
                    setNewPaymentMethod({
                      ...newPaymentMethod,
                      type: 'mobile'
                    })
                    }
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500" />

                    <label
                    htmlFor="new-mobile"
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
                  onClick={() =>
                  setNewPaymentMethod({
                    ...newPaymentMethod,
                    type: 'crypto'
                  })
                  }>

                    <input
                    title="Crypto-monnaie"
                    type="radio"
                    id="new-crypto"
                    name="newPaymentMethod"
                    checked={newPaymentMethod.type === 'crypto'}
                    onChange={() =>
                    setNewPaymentMethod({
                      ...newPaymentMethod,
                      type: 'crypto'
                    })
                    }
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500" />

                    <label
                    htmlFor="new-crypto"
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
              {newPaymentMethod.type === 'card' &&
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Numéro de carte
                    </label>
                    <input
                      title="Numéro de carte"
                      type="text"
                      value={newPaymentMethod.cardNumber}
                      onChange={(e) =>
                      setNewPaymentMethod({
                        ...newPaymentMethod,
                        cardNumber: e.target.value
                      })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                      placeholder="**** **** **** ****" />
                  </div>
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date d'expiration
                      </label>
                      <input
                        title="Date d'expiration"
                        type="text"
                        value={newPaymentMethod.expiryDate}
                        onChange={(e) =>
                        setNewPaymentMethod({
                          ...newPaymentMethod,
                          expiryDate: e.target.value
                        })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                        placeholder="MM/AA" />
                    </div>
                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        CVV
                      </label>
                      <input
                        title="CVV"
                        type="text"
                        value={newPaymentMethod.cvv}
                        onChange={(e) =>
                        setNewPaymentMethod({
                          ...newPaymentMethod,
                          cvv: e.target.value
                        })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                        placeholder="***" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Titulaire de la carte
                    </label>
                    <input
                      title="Titulaire de la carte"
                      type="text"
                      value={newPaymentMethod.cardHolder}
                      onChange={(e) =>
                      setNewPaymentMethod({
                        ...newPaymentMethod,
                        cardHolder: e.target.value
                      })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                      placeholder="Nom et prénom" />
                  </div>
                </div>
            }
              {newPaymentMethod.type === 'mobile' &&
            <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Opérateur
                    </label>
                    <select
                    title="Opérateur"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                    onChange={(e) =>
                    setNewPaymentMethod({
                      ...newPaymentMethod,
                      mobileOperator: e.target.value
                    })
                    }>

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
                    placeholder="Ex: +225 07 12 34 56 78"
                    onChange={(e) =>
                    setNewPaymentMethod({
                      ...newPaymentMethod,
                      mobileNumber: e.target.value
                    })
                    } />

                  </div>
                </div>
            }
              {newPaymentMethod.type === 'crypto' &&
            <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Crypto-monnaie
                    </label>
                    <select
                    title="Crypto-monnaie"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                    onChange={(e) =>
                    setNewPaymentMethod({
                      ...newPaymentMethod,
                      cryptoType: e.target.value
                    })
                    }>

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
                    placeholder="Ex: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                    onChange={(e) =>
                    setNewPaymentMethod({
                      ...newPaymentMethod,
                      walletAddress: e.target.value
                    })
                    } />
                  </div>
                </div>
            }
              <div className="flex justify-end space-x-3">
                 <button
                title="Annuler"
                onClick={() => setShowAddPaymentModal(false)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">

                  Annuler
                </button>
                 <button
                title="Ajouter"
                onClick={handleAddPaymentMethod}
                className="px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">

                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      {/* Support Chat */}
      {showSupportChat &&
      <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md h-96 flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-base font-medium">Support Client</h3>
               <button
              title="Fermer"
              onClick={handleCloseSupportChat}
              className="text-white hover:text-gray-200">

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
            <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3">

              {supportMessages.map((message) =>
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>

                  <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${message.sender === 'user' ? 'bg-blue-600 text-white' : message.sender === 'system' ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'}`}>

                    <p>{message.message}</p>
                    <p
                  className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>

                      {message.time}
                    </p>
                  </div>
                </div>
            )}
            </div>
            <form
            onSubmit={handleSupportMessageSubmit}
            className="p-4 border-t border-gray-200 dark:border-gray-700">

              <div className="flex space-x-2">
                 <input
                title="Message"
                type="text"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Tapez votre message..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                 <button
                title="Envoyer"
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">

                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </>);

};

export default SettingsSimpleUser;