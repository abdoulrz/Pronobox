import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChannelData } from '../contexts/ChannelContext';

interface User {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  lastActive: string;
  role: string;
  joinedDate: string | null;
  bio: string | null;
}

interface UIChannel {
  id: string | number;
  name: string;
  members: number;
  description: string;
  premium: boolean;
  joined: boolean;
  lastMessage: string;
  users: User[];
  posts?: {
    id: string | number;
    title: string;
    content: string;
    createdAt: string;
  }[];
}

interface ChannelFeatures {
  voiceMessages: boolean;
  comments: boolean;
  paidCoupons: boolean;
}

const Channels = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { channelData, navigateToChannel, addChannel } = useChannelData();

  const [activeTab, setActiveTab] = useState('all');
  // à‰tat pour suivre les fonctionnalités activées pour chaque canal
  const [channelFeatures, setChannelFeatures] = useState<Record<string | number, ChannelFeatures>>({
    'channel-1': {
      voiceMessages: true,
      comments: true,
      paidCoupons: false
    },
    'channel-2': {
      voiceMessages: true,
      comments: true,
      paidCoupons: true
    },
    'channel-3': {
      voiceMessages: false,
      comments: true,
      paidCoupons: false
    },
    'channel-4': {
      voiceMessages: true,
      comments: false,
      paidCoupons: true
    },
    'channel-5': {
      voiceMessages: false,
      comments: false,
      paidCoupons: false
    }
  });
  // à‰tat pour les canaux épinglés
  const [pinnedChannels, setPinnedChannels] = useState<(string | number)[]>([1, 4]);
  // à‰tat pour l'enregistrement audio
  const [isRecording, setIsRecording] = useState(false);
  const [recordingChannelId, setRecordingChannelId] = useState<string | number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // à‰tat pour le modal de création de canal
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [newChannelIsPremium, setNewChannelIsPremium] = useState(false);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  // à‰tat pour afficher la liste des utilisateurs d'un canal
  const [showChannelUsers, setShowChannelUsers] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string | number | null>(null);
  // Fonctions spécifiques en fonction du type d'utilisateur
  const isProUser = user?.isPro || false;
  const isAdminUser = user?.role === 'admin' || false;
  // Liste de noms d'utilisateurs simulés pour les canaux
  const mockUserNames = [
  'Thomas Dubois',
  'Sophie Martin',
  'Lucas Bernard',
  'Emma Petit',
  'Jules Moreau',
  'Léa Richard',
  'Hugo Leroy',
  'Chloé Simon',
  'Louis Robert',
  'Camille Laurent',
  'Nathan Lefebvre',
  'Manon Michel',
  'Maxime Garcia',
  'Zoé David',
  'Théo Bertrand',
  'Inès Roux',
  'Enzo Bonnet',
  'Jade Morel',
  'Adam Vincent',
  'Lina Fournier'];

  // Fonction pour générer des utilisateurs simulés avec des noms réalistes
  function generateMockUsers(count: number, forNewChannel = false) {
    const users = [];
    // Si c'est pour un nouveau canal, on génère exactement 10 utilisateurs
    const maxUsers = forNewChannel ? 10 : Math.min(count, 50);
    for (let i = 0; i < maxUsers; i++) {
      // Pour un nouveau canal, on utilise des noms prédéfinis pour plus de réalisme
      const name = forNewChannel ?
      mockUserNames[i % mockUserNames.length] :
      `Utilisateur ${i + 1}`;
      // Calculer un identifiant unique basé sur le nom
      const userId = `user-${name.toLowerCase().replace(/\s/g, '-')}-${Math.floor(Math.random() * 1000)}`;
      // Générer un avatar plus réaliste
      const gender = Math.random() > 0.5 ? 'men' : 'women';
      const avatarId = i % 20 + 1;
      const avatar = `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`;
      // Statut en ligne aléatoire
      const isOnline = Math.random() > 0.3; // 70% de chance d'àªtre en ligne pour un nouveau canal
      // Dernière activité plus réaliste
      let lastActive;
      if (isOnline) {
        lastActive = 'En ligne';
      } else if (Math.random() > 0.5) {
        lastActive = `${Math.floor(Math.random() * 60)} min`;
      } else {
        const hours = Math.floor(Math.random() * 24);
        lastActive = `${hours}h`;
      }
      users.push({
        id: userId,
        name: name,
        avatar: avatar,
        online: isOnline,
        lastActive: lastActive,
        // Ajouter des informations supplémentaires pour les nouveaux canaux
        role:
        forNewChannel && i === 0 ?
        'admin' :
        Math.random() > 0.8 ?
        'moderator' :
        'member',
        joinedDate: forNewChannel ?
        new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString() :
        null,
        bio: forNewChannel ? generateRandomBio() : null
      });
    }
    return users;
  }
  // Générer une biographie aléatoire
  function generateRandomBio() {
    const bios = [
    'Passionné de sport et de paris sportifs depuis 10 ans.',
    'Expert en pronostics football, spécialiste de la Ligue 1.',
    "Fan de tennis et de NBA, j'adore analyser les statistiques.",
    'Suiveur assidu des championnats européens de football.',
    "Ancien joueur semi-pro, j'apporte mon expertise technique.",
    'Journaliste sportif à mes heures perdues.',
    'Statisticien passionné par les modèles prédictifs.',
    'Partageur de bons plans et de combinés gagnants !',
    'Spécialiste des paris sur les sports américains.',
    'Membre de plusieurs communautés de parieurs depuis 5 ans.'];

    return bios[Math.floor(Math.random() * bios.length)];
  }
  // Convertir les canaux du contexte au format attendu par le composant
  const channels: UIChannel[] =
  channelData?.channels.map((channel, index: number) => ({
    id: channel.id,
    name: channel.name,
    members: channel.members || 0,
    description: channel.description,
    premium: false, // Default value as it's not in the base Channel
    joined: index < 3,
    lastMessage:
    channel.posts && channel.posts.length > 0 ?
    channel.posts[0].title :
    'Pas de messages récents',
    // Ajouter des utilisateurs simulés pour le header
    users: (channel as any).users || generateMockUsers(channel.members || 0)
  })) || [];
  const filteredChannels = channels.filter((channel: UIChannel) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'premium') return channel.premium;
    if (activeTab === 'free') return !channel.premium;
    if (activeTab === 'joined') return channel.joined;
    if (activeTab === 'pinned') return pinnedChannels.includes(channel.id);
    return true;
  });
  // Fonction pour gérer le changement d'état des fonctionnalités
  const handleFeatureToggle = (channelId: string | number, feature: keyof ChannelFeatures) => {
    setChannelFeatures((prev) => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        [feature]: !prev[channelId][feature]
      }
    }));
  };
  // Fonction pour épingler/désépingler un canal
  const handleTogglePin = (channelId: string | number) => {
    setPinnedChannels((prev) => {
      if (prev.includes(channelId)) {
        return prev.filter((id) => id !== channelId);
      } else {
        return [...prev, channelId];
      }
    });
  };
  // Fonction pour démarrer l'enregistrement audio
  const startRecording = (channelId: number | string) => {
    // Vérifier si l'utilisateur peut envoyer des messages vocaux (Pro ou Admin uniquement)
    if (!isProUser && !isAdminUser) {
      alert(
        'Les messages vocaux sont une fonctionnalité Pro. Passez à Pro pour débloquer cette fonctionnalité.'
      );
      return;
    }
    setIsRecording(true);
    setRecordingChannelId(channelId);
    setRecordingTime(0);
    // Démarrer le timer
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    // Ici, vous ajouteriez la logique réelle d'enregistrement audio
    console.log(`Démarrage de l'enregistrement pour le canal ${channelId}`);
  };
  // Fonction pour arràªter l'enregistrement audio
  const stopRecording = () => {
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    // Ici, vous ajouteriez la logique pour sauvegarder l'audio
    console.log(`Arrêt de l'enregistrement après ${recordingTime} secondes`);
    // Réinitialiser
    setRecordingChannelId(null);
    setRecordingTime(0);
  };
  // Formater le temps d'enregistrement (mm:ss)
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  // État pour gérer les canaux en mode édition
  const [editingChannel, setEditingChannel] = useState<string | number | null>(null);
  // Fonction pour naviguer vers le canal sélectionné
  const handleChannelClick = (channelId: number | string) => {
    // Utiliser la fonction optimisée du contexte ChannelDataContext
    navigateToChannel(String(channelId), navigate);
    console.log(`Navigation vers le canal ${channelId}`);
  };
  // Fonction pour afficher/masquer la liste des utilisateurs
  const toggleChannelUsers = (channelId: number | string) => {
    if (selectedChannelId === channelId && showChannelUsers) {
      setShowChannelUsers(false);
      setSelectedChannelId(null);
    } else {
      setShowChannelUsers(true);
      setSelectedChannelId(channelId);
    }
  };
  // Fonction pour créer un nouveau canal avec persistance
  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      alert('Veuillez entrer un nom pour le canal');
      return;
    }
    setIsCreatingChannel(true);
    try {
      const createdChannelId = await addChannel({
        name: newChannelName.trim(),
        description: newChannelDescription.trim(),
        premium: newChannelIsPremium,
        subscriptionPrice: 0
      });
      // Réinitialiser le formulaire
      setNewChannelName('');
      setNewChannelDescription('');
      setNewChannelIsPremium(false);
      setShowCreateChannelModal(false);
      // Rediriger vers le nouveau canal après sa création
      setTimeout(() => {
        if (createdChannelId) {
          navigateToChannel(createdChannelId, navigate);
        }
      }, 500);
    } catch (err) {
      console.error('Erreur lors de la création du canal:', err);
      alert('Erreur lors de la création du canal. Veuillez réessayer.');
    } finally {
      setIsCreatingChannel(false);
    }
  };
  // Sauvegarder les canaux épinglés dans localStorage
  useEffect(() => {
    localStorage.setItem('pinnedChannels', JSON.stringify(pinnedChannels));
  }, [pinnedChannels]);
  // Charger les canaux épinglés depuis localStorage
  useEffect(() => {
    const savedPinnedChannels = localStorage.getItem('pinnedChannels');
    if (savedPinnedChannels) {
      try {
        setPinnedChannels(JSON.parse(savedPinnedChannels));
      } catch (error) {
        console.error('Erreur lors du chargement des canaux épinglés:', error);
      }
    }
  }, []);


  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Canaux</h2>
        {/* Bouton de création de canal - visible uniquement pour les utilisateurs Pro et Admin */}
        {(isProUser || isAdminUser) &&
        <button
          className="p-2 rounded-full bg-green-600 text-white"
          onClick={() => setShowCreateChannelModal(true)}
          title="Créer un nouveau canal">

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
              d="M12 4v16m8-8H4" />

            </svg>
          </button>
        }
      </div>
      {/* Bannière Pro pour les utilisateurs standard */}
      {!isProUser && !isAdminUser &&
      <div className="mb-6 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-start mb-3 md:mb-0">
              <div className="flex-shrink-0 pt-0.5">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-500"
                viewBox="0 0 20 20"
                fill="currentColor">

                  <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd" />

                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Passez à Pro pour créer vos propres canaux
                </h3>
                <div className="mt-1 text-xs text-yellow-700 dark:text-yellow-400">
                  <p>
                    Les utilisateurs Pro peuvent créer des canaux et monétiser
                    leurs pronostics.
                  </p>
                </div>
              </div>
            </div>
            <button
            onClick={() => navigate('/compare-accounts')}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-md transition-colors">

              Passer à Pro
            </button>
          </div>
        </div>
      }
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex space-x-4 overflow-x-auto pb-1">
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === 'all' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500'}`}
              onClick={() => setActiveTab('all')}>

              Tous
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === 'premium' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500'}`}
              onClick={() => setActiveTab('premium')}>

              Premium
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === 'free' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500'}`}
              onClick={() => setActiveTab('free')}>

              Gratuits
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === 'joined' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500'}`}
              onClick={() => setActiveTab('joined')}>

              Rejoints
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === 'pinned' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500'}`}
              onClick={() => setActiveTab('pinned')}>

              Épinglés
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredChannels.map((channel: UIChannel) =>
          <div key={channel.id} className="relative">
              {/* Header du canal - affiche les utilisateurs au clic */}
              <div
              className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                toggleChannelUsers(channel.id);
              }}>

                <div className="flex items-center">
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {channel.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {channel.members} membres
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-2">
                    {channel.users.slice(0, 3).map((user: User, index: number) =>
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-700 overflow-hidden">

                        <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover" />

                      </div>
                  )}
                    {channel.users.length > 3 &&
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 border-2 border-white dark:border-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                        +{channel.users.length - 3}
                      </div>
                  }
                  </div>
                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${showChannelUsers && selectedChannelId === channel.id ? 'transform rotate-180' : ''}`}
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
              {/* Liste des utilisateurs du canal */}
              {showChannelUsers && selectedChannelId === channel.id &&
            <div className="p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
                  <div className="max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {channel.users.map((user: User, index: number) =>
                  <div
                    key={index}
                    className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">

                          <div className="relative">
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover" />

                            </div>
                            {user.online &&
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      }
                          </div>
                          <div className="ml-3">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {user.name}
                              </p>
                              {user.role &&
                        <span
                          className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : user.role === 'moderator' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : ''}`}>

                                  {user.role === 'admin' ?
                          'Admin' :
                          user.role === 'moderator' ?
                          'Mod' :
                          ''}
                                </span>
                        }
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.lastActive}
                            </p>
                            {user.bio &&
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                {user.bio}
                              </p>
                      }
                          </div>
                        </div>
                  )}
                    </div>
                  </div>
                </div>
            }
              {/* Contenu du canal */}
              <div
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => handleChannelClick(channel.id)}>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800/30 flex items-center justify-center text-green-600 dark:text-green-400 mr-4 flex-shrink-0">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">

                      <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />

                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium truncate flex items-center">
                        {channel.name}
                        {channel.premium &&
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300">
                            Premium
                          </span>
                      }
                        {pinnedChannels.includes(channel.id) &&
                      <span className="ml-2 text-yellow-500">
                            <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">

                              <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />

                            </svg>
                          </span>
                      }
                      </h3>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                          12:45
                        </span>
                        <button
                        onClick={(e) => {
                          e.stopPropagation(); // Empàªcher la navigation vers le canal
                          handleTogglePin(channel.id);
                        }}
                        className={`text-gray-500 hover:text-yellow-500 mr-2 ${pinnedChannels.includes(channel.id) ? 'text-yellow-500' : ''}`}
                        title={
                        pinnedChannels.includes(channel.id) ?
                        'Désépingler' :
                        'Épingler'
                        }>

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
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />

                          </svg>
                        </button>
                        <button
                        onClick={(e) => {
                          e.stopPropagation(); // Empecher la navigation vers le canal
                          setEditingChannel(
                            editingChannel === channel.id ? null : channel.id
                          );
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Options du canal">

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
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />

                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {channel.lastMessage}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {channel.members.toLocaleString()} membres
                      </span>
                      <div className="flex items-center space-x-2">
                        {channelFeatures[channel.id]?.comments &&
                      <>
                            {/* Bouton pour envoyer une image */}
                            <label
                          className="cursor-pointer text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                          onClick={(e) => e.stopPropagation()} // Empecher la navigation vers le canal
                        >
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
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />

                              </svg>
                              <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            title="Choisir une image"
                            onClick={(e) => e.stopPropagation()} // Empàªcher la navigation vers le canal
                          />
                            </label>
                            {/* Bouton pour enregistrer un message vocal */}
                            {isRecording &&
                        recordingChannelId === channel.id ?
                        <button
                          className="text-red-500 hover:text-red-700 flex items-center"
                          onClick={(e) => {
                            e.stopPropagation(); // Empàªcher la navigation vers le canal
                            stopRecording();
                          }}>

                                <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 animate-pulse"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">

                                  <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

                                  <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />

                                </svg>
                                <span className="ml-1 text-xs">
                                  {formatRecordingTime(recordingTime)}
                                </span>
                              </button> :

                        <button
                          className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation(); // Empêcher la navigation vers le canal
                            startRecording(channel.id);
                          }}
                          disabled={isRecording}
                          title="Enregistrer un message vocal">

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
                              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />

                                </svg>
                              </button>
                        }
                          </>
                      }
                        {channel.joined ?
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Rejoint
                          </span> :

                      <button
                        className="px-3 py-1 rounded-full bg-green-600 text-white text-xs font-medium"
                        onClick={(e) => {
                          e.stopPropagation(); // Empêcher la navigation vers le canal
                          // Logique pour rejoindre le canal
                        }}>

                            Rejoindre
                          </button>
                      }
                      </div>
                    </div>
                    {/* Fonctionnalités du canal - visible uniquement si le canal est en mode édition */}
                    {editingChannel === channel.id &&
                  <div
                    className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    onClick={(e) => e.stopPropagation()} // Empêcher la navigation vers le canal
                  >
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Fonctionnalités du canal
                        </h4>
                        <div className="space-y-2">
                          {/* Messages vocaux - disponible uniquement pour les utilisateurs Pro et Admin */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Messages vocaux
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Permettre les messages vocaux
                              </p>
                            </div>
                            <label
                          className={`relative inline-block w-10 h-6 cursor-pointer ${!isProUser && !isAdminUser ? 'opacity-50' : ''}`}>

                              <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={
                            channelFeatures[channel.id]?.voiceMessages ||
                            false
                            }
                            onChange={() => {
                              if (isProUser || isAdminUser) {
                                handleFeatureToggle(
                                  channel.id,
                                  'voiceMessages'
                                );
                              } else {
                                alert(
                                  'Cette fonctionnalité est réservée aux utilisateurs Pro et Admin'
                                );
                              }
                            }}
                            disabled={!isProUser && !isAdminUser}
                            title="Messages vocaux" />

                              <div className="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                            </label>
                          </div>
                          {/* Commentaires */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Commentaires
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Permettre les commentaires
                              </p>
                            </div>
                            <label className="relative inline-block w-10 h-6 cursor-pointer">
                              <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={
                            channelFeatures[channel.id]?.comments || false
                            }
                            onChange={() =>
                            handleFeatureToggle(channel.id, 'comments')
                            }
                            title="Commentaires" />

                              <div className="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                            </label>
                          </div>
                          {/* Coupons payants - disponible uniquement pour les utilisateurs Pro et Admin */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Coupons payants
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Activer les coupons payants
                              </p>
                            </div>
                            <label
                          className={`relative inline-block w-10 h-6 cursor-pointer ${!isProUser && !isAdminUser ? 'opacity-50' : ''}`}>

                              <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={
                            channelFeatures[channel.id]?.paidCoupons ||
                            false
                            }
                            onChange={() => {
                              if (isProUser || isAdminUser) {
                                handleFeatureToggle(
                                  channel.id,
                                  'paidCoupons'
                                );
                              } else {
                                alert(
                                  'Cette fonctionnalité est réservée aux utilisateurs Pro et Admin'
                                );
                              }
                            }}
                            disabled={!isProUser && !isAdminUser}
                            title="Coupons payants" />

                              <div className="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                            </label>
                          </div>
                        </div>
                        {/* Configuration des coupons payants - visible uniquement si activé */}
                        {channelFeatures[channel.id]?.paidCoupons && (
                    isProUser || isAdminUser) &&
                    <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600">
                              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Configuration des coupons payants
                              </h5>
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Prix par coupon (â‚¬)
                                  </label>
                                  <input
                            type="number"
                            min="0.50"
                            step="0.50"
                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Ex: 5.00" />

                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Durée de validité (jours)
                                  </label>
                                  <select 
                                    title="Durée de validité"
                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    <option value="1">1 jour</option>
                                    <option value="3">3 jours</option>
                                    <option value="7">7 jours</option>
                                    <option value="30">30 jours</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                    }
                        <div className="mt-3 flex justify-end">
                          <button
                        className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-md"
                        onClick={(e) => {
                          e.stopPropagation(); // Empêcher la navigation vers le canal
                          setEditingChannel(null);
                        }}>

                            Enregistrer
                          </button>
                        </div>
                      </div>
                  }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modal de création de canal */}
      {showCreateChannelModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Créer un nouveau canal
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom du canal *
                </label>
                <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Ex: Pronostics Ligue 1"
                required />

              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                value={newChannelDescription}
                onChange={(e) => setNewChannelDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Décrivez votre canal en quelques mots..."
                rows={3} />

              </div>
              <div className="flex items-center">
                <input
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
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                <div className="flex items-start">
                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

                  </svg>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Votre canal sera créé avec 10 abonnés simulés pour vous
                    aider à tester les fonctionnalités.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
              onClick={() => setShowCreateChannelModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              disabled={isCreatingChannel}>

                Annuler
              </button>
              <button
              onClick={handleCreateChannel}
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
                    Création...
                  </> :

              'Créer le canal'
              }
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

};
export default Channels;