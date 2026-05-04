import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
interface BetHistory {
  id: string;
  match: string;
  prediction: string;
  stake: number;
  odds: number;
  result: 'win' | 'loss' | 'pending';
  date: Date;
}
interface UserStats {
  totalBets: number;
  winRate: number;
  profitLoss: number;
  bestStreak: number;
  favoriteLeague: string;
  averageOdds: number;
}
interface SubscribedChannel {
  id: number;
  name: string;
  avatar: string;
  premium: boolean;
  members: number;
  lastActivity: Date;
}
const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'stats'>(
    'overview'
  );
  const [betHistory, setBetHistory] = useState<BetHistory[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [subscribedChannels, setSubscribedChannels] = useState<
    SubscribedChannel[]>(
    []);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      // Données fictives pour la démonstration
      const mockBetHistory: BetHistory[] = [
      {
        id: '1',
        match: 'PSG vs Manchester City',
        prediction: 'PSG Victoire',
        stake: 20,
        odds: 2.1,
        result: 'win',
        date: new Date(2023, 9, 19)
      },
      {
        id: '2',
        match: 'Lyon vs Marseille',
        prediction: 'Plus de 2.5 buts',
        stake: 15,
        odds: 1.85,
        result: 'win',
        date: new Date(2023, 9, 17)
      },
      {
        id: '3',
        match: 'Real Madrid vs Barcelone',
        prediction: 'Les deux équipes marquent',
        stake: 25,
        odds: 1.75,
        result: 'loss',
        date: new Date(2023, 9, 15)
      },
      {
        id: '4',
        match: 'Bayern Munich vs Dortmund',
        prediction: 'Bayern Victoire',
        stake: 30,
        odds: 1.6,
        result: 'win',
        date: new Date(2023, 9, 12)
      },
      {
        id: '5',
        match: 'Liverpool vs Manchester United',
        prediction: 'Match nul',
        stake: 15,
        odds: 3.5,
        result: 'loss',
        date: new Date(2023, 9, 10)
      },
      {
        id: '6',
        match: 'Inter Milan vs Juventus',
        prediction: 'Moins de 2.5 buts',
        stake: 20,
        odds: 2.0,
        result: 'pending',
        date: new Date(2023, 9, 22)
      }];

      const mockStats: UserStats = {
        totalBets: 42,
        winRate: 64.3,
        profitLoss: 127.5,
        bestStreak: 6,
        favoriteLeague: 'Ligue 1',
        averageOdds: 1.92
      };
      // Données fictives pour les canaux auxquels l'utilisateur est abonné
      const mockSubscribedChannels: SubscribedChannel[] = [
      {
        id: 1,
        name: 'PronosBox Officiel',
        avatar:
        'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        premium: false,
        members: 15420,
        lastActivity: new Date(2023, 10, 5)
      },
      {
        id: 3,
        name: 'Communauté Ligue 1',
        avatar:
        'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        premium: false,
        members: 8750,
        lastActivity: new Date(2023, 10, 3)
      },
      {
        id: 4,
        name: 'Experts Premier League',
        avatar:
        'https://images.unsplash.com/photo-1577223625816-7546f13df25d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        premium: true,
        members: 12300,
        lastActivity: new Date(2023, 10, 4)
      }];

      setBetHistory(mockBetHistory);
      setStats(mockStats);
      setSubscribedChannels(mockSubscribedChannels);
      setIsLoading(false);
    }, 1000);
  }, []);
  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Vous devez être connecté pour voir votre profil.
        </p>
      </div>);

  }
  // Date d'inscription fictive (pour la démonstration)
  const registrationDate = new Date(2022, 3, 15); // 15 avril 2022
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* En-tête du profil */}
        <div
          className={`p-6 ${user.isPro ? 'bg-gradient-to-r from-green-500 to-green-600' : user.role === 'admin' ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}>

          <div className="flex flex-col md:flex-row items-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white mb-4 md:mb-0 md:mr-6">
              <img
                src={
                user.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
                }
                alt={user.username}
                className="w-full h-full object-cover" />

            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {user.username}
              </h1>
              <p className="text-white/80 mt-1">{user.email}</p>
              {/* Date d'inscription */}
              <p className="text-white/70 text-sm mt-1">
                Membre depuis le{' '}
                {registrationDate.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start mt-3 space-x-2">
                {user.isPro &&
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pro
                  </span>
                }
                {user.role === 'admin' &&
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Admin
                  </span>
                }
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-green-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

                  </svg>
                  {user.walletBalance?.toFixed(2) || '0.00'}€
                </span>
              </div>
              {!user.isPro &&
              <button
                onClick={() => navigate('/compare-accounts')}
                className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-md transition-colors">

                  Passer à Pro
                </button>
              }
            </div>
          </div>
        </div>
        {/* Navigation par onglets */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('overview')}>

              Aperçu
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'history' ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('history')}>

              Historique des paris
            </button>
            {(user.isPro || user.role === 'admin') &&
            <button
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'stats' ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('stats')}>

                Statistiques
              </button>
            }
          </nav>
        </div>
        {/* Contenu de l'onglet */}
        <div className="p-6">
          {isLoading ?
          <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div> :

          <>
              {/* Aperçu */}
              {activeTab === 'overview' &&
            <div>
                  {/* Bannière Pro pour les utilisateurs standard */}
                  {!user.isPro && user.role !== 'admin' &&
              <div className="mb-6 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start">
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
                            Passez à Pro pour débloquer toutes les
                            fonctionnalités
                          </h3>
                          <div className="mt-1 text-xs text-yellow-700 dark:text-yellow-400">
                            <p>
                              Créez vos propres canaux et monétisez vos
                              pronostics.
                            </p>
                          </div>
                          <div className="mt-2">
                            <button
                        onClick={() => navigate('/compare-accounts')}
                        className="text-xs font-medium text-yellow-800 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-200">

                              Voir les avantages →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
              }
                  {/* Statistiques simplifiées - pour tous les utilisateurs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 mr-4">
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
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />

                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Taux de réussite
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {stats?.winRate}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 mr-4">
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
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />

                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Profit/Perte
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {(stats?.profitLoss ?? 0) > 0 ? '+' : ''}
                            {stats?.profitLoss}€
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300 mr-4">
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
                          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />

                            <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />

                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Paris placés
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {stats?.totalBets}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Actions spécifiques par type de compte */}
                  {(user.isPro || user.role === 'admin') &&
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="flex items-center justify-center p-3 bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/60 transition-colors">
                        <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor">

                          <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 11-16 0 8 8 0 0116 0zm1-11a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd" />

                        </svg>
                        Créer un canal
                      </button>
                      <button
                  className="flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors"
                  onClick={() => navigate('/transactions')}>

                        <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor">

                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path
                      fillRule="evenodd"
                      d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 100 2v2a1 1 0 100-2h-1a1 1 0 01-1-1z"
                      clipRule="evenodd" />

                        </svg>
                        Effectuer un retrait
                      </button>
                    </div>
              }
                  {/* Canaux auxquels l'utilisateur est abonné */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Mes canaux
                      </h3>
                      <button
                    onClick={() => navigate('/channels')}
                    className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">

                        Voir tous les canaux →
                      </button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                      {subscribedChannels.length > 0 ?
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {subscribedChannels.map((channel) =>
                    <div
                      key={channel.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => navigate(`/channel/${channel.id}`)}>

                              <div className="flex items-center">
                                <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                                  <img
                            src={channel.avatar}
                            alt={channel.name}
                            className="w-full h-full object-cover" />

                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-medium truncate flex items-center">
                                      {channel.name}
                                      {channel.premium &&
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300">
                                          Premium
                                        </span>
                              }
                                    </h4>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {channel.lastActivity.toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {channel.members.toLocaleString()} membres
                                  </p>
                                </div>
                              </div>
                            </div>
                    )}
                        </div> :

                  <div className="p-6 text-center">
                          <p className="text-gray-500 dark:text-gray-400">
                            Vous n'êtes abonné à aucun canal pour le moment.
                          </p>
                          <button
                      onClick={() => navigate('/channels')}
                      className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors">

                            Découvrir des canaux
                          </button>
                        </div>
                  }
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Derniers paris
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Match
                          </th>
                          <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Pronostic
                          </th>
                          <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Mise
                          </th>
                          <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Cote
                          </th>
                          <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Résultat
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {betHistory.slice(0, 3).map((bet) =>
                    <tr key={bet.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                              {bet.match}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {bet.prediction}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {bet.stake}€
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {bet.odds}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${bet.result === 'win' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                                ${bet.result === 'loss' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                                ${bet.result === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                              `}>

                                {bet.result === 'win' && 'Gagné'}
                                {bet.result === 'loss' && 'Perdu'}
                                {bet.result === 'pending' && 'En attente'}
                              </span>
                            </td>
                          </tr>
                    )}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 text-right">
                    <button
                  className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                  onClick={() => setActiveTab('history')}>

                      Voir tout l'historique →
                    </button>
                  </div>
                </div>
            }
              {/* Historique des paris */}
              {activeTab === 'history' &&
            <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Historique complet des paris
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Date
                          </th>
                          <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Match
                          </th>
                          <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Pronostic
                          </th>
                          <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Mise
                          </th>
                          <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Cote
                          </th>
                          <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Potentiel
                          </th>
                          <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                            Résultat
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {betHistory.map((bet) =>
                    <tr key={bet.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {bet.date.toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                              {bet.match}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {bet.prediction}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {bet.stake}€
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {bet.odds}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {(bet.stake * bet.odds).toFixed(2)}€
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${bet.result === 'win' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                                ${bet.result === 'loss' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                                ${bet.result === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                              `}>

                                {bet.result === 'win' && 'Gagné'}
                                {bet.result === 'loss' && 'Perdu'}
                                {bet.result === 'pending' && 'En attente'}
                              </span>
                            </td>
                          </tr>
                    )}
                      </tbody>
                    </table>
                  </div>
                  {/* Fonctionnalités Pro exclusives */}
                  {!user.isPro && user.role !== 'admin' &&
              <div className="mt-6 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-yellow-500"
                      viewBox="0 0 20 20"
                      fill="currentColor">

                            <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd" />

                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Fonctionnalités Pro exclusives
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Passez à Pro pour accéder à des statistiques
                            avancées, exporter vos données et plus encore.
                          </p>
                        </div>
                        <div className="ml-auto">
                          <button
                      onClick={() => navigate('/compare-accounts')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">

                            Passer à Pro
                          </button>
                        </div>
                      </div>
                    </div>
              }
                </div>
            }
              {/* Statistiques - uniquement pour Pro et Admin */}
              {activeTab === 'stats' && (
            user.isPro || user.role === 'admin') &&
            <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                          Statistiques générales
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Paris totaux
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {stats?.totalBets}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Taux de réussite
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {stats?.winRate}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Profit/Perte
                            </span>
                            <span
                        className={`text-sm font-medium ${(stats?.profitLoss ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>

                              {(stats?.profitLoss ?? 0) > 0 ? '+' : ''}
                              {stats?.profitLoss}€
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Meilleure série
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {stats?.bestStreak} victoires
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Cote moyenne
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {stats?.averageOdds}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Ligue favorite
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {stats?.favoriteLeague}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                          Répartition par résultat
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Victoires
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                64%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div className="bg-green-500 h-2.5 rounded-full w-[64%]"></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Défaites
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                32%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div className="bg-red-500 h-2.5 rounded-full w-[32%]"></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                En attente
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                4%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div className="bg-yellow-500 h-2.5 rounded-full w-[4%]"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                          Types de paris préférés
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Résultat du match
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                45%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div className="bg-blue-500 h-2.5 rounded-full w-[45%]"></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Plus/Moins
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                30%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div className="bg-purple-500 h-2.5 rounded-full w-[30%]"></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Les deux équipes marquent
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                15%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div className="bg-indigo-500 h-2.5 rounded-full w-[15%]"></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Autres
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                10%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div className="bg-gray-500 h-2.5 rounded-full w-[10%]"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Statistiques avancées */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Analyse avancée des performances
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Statistiques avancées réservées aux utilisateurs Pro.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Performances par jour de la semaine
                          </h5>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Lundi</span>
                                <span>72%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full w-[72%]"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Mardi</span>
                                <span>58%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full w-[58%]"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Mercredi</span>
                                <span>64%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full w-[64%]"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Jeudi</span>
                                <span>53%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full w-[53%]"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Vendredi</span>
                                <span>68%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full w-[68%]"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Samedi</span>
                                <span>75%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full w-[75%]"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Dimanche</span>
                                <span>61%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full w-[61%]"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Performance par cote
                          </h5>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>1.01 - 1.50</span>
                                <span>92%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full w-[92%]"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>1.51 - 2.00</span>
                                <span>78%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full w-[78%]"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>2.01 - 3.00</span>
                                <span>45%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full w-[45%]"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>3.01 - 5.00</span>
                                <span>32%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full w-[32%]"></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>5.01+</span>
                                <span>18%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full w-[18%]"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 text-right">
                        <button className="text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">
                          Exporter les statistiques (CSV) →
                        </button>
                      </div>
                    </div>
                  </div>
            }
            </>
          }
        </div>
      </div>
    </div>);

};
export default Profile;