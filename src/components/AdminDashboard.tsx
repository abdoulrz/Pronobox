import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DynamicWidthBar } from './common/DynamicWidthBar';
const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('statistics');
  
  // State for mock users to allow actions
  const [users, setUsers] = useState([
    { id: 1, name: 'Jean Dupont', email: 'jean.dupont@example.com', role: 'Pro', status: 'Actif', date: '15/04/2023', initials: 'JD', color: 'blue' },
    { id: 2, name: 'Marie Lambert', email: 'marie.lambert@example.com', role: 'Standard', status: 'Actif', date: '02/05/2023', initials: 'ML', color: 'green' },
    { id: 3, name: 'Pierre Blanc', email: 'pierre.blanc@example.com', role: 'Standard', status: 'Banni', date: '10/03/2023', initials: 'PB', color: 'red' }
  ]);

  // State for mock channels
  const [adminChannels, setAdminChannels] = useState([
    { id: 1, name: 'PronosBox Officiel', owner: 'Admin', type: 'Officiel', members: '15.4k', initials: 'PO', color: 'green' },
    { id: 2, name: 'Pronos Premium', owner: 'Jean Dupont', type: 'Premium', members: '5.2k', initials: 'PP', color: 'yellow' },
    { id: 3, name: 'Foot Expert', owner: 'Marie Lambert', type: 'Gratuit', members: '1.8k', initials: 'FE', color: 'blue' }
  ]);

  const handleBanUser = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Banni' ? 'Actif' : 'Banni' } : u));
  };

  const handleDeleteChannel = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce canal ?')) {
      setAdminChannels(adminChannels.filter(c => c.id !== id));
    }
  };

  // Mock data for statistics
  const siteStatistics = {
    users: {
      total: 8547,
      active: 3250,
      premium: 1840,
      newToday: 28
    },
    channels: {
      total: 124,
      premium: 45,
      free: 79,
      mostActive: 'Pronos Premium'
    },
    revenue: {
      total: 28450,
      thisMonth: 4850,
      subscriptions: 3750,
      channelFees: 1100
    },
    content: {
      totalPronos: 1240,
      publishedToday: 15,
      successRate: 68,
      pendingReview: 8
    }
  };
  if (!isAdmin) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-red-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />

          </svg>
          <h3 className="text-lg font-medium text-red-800">Accès refusé</h3>
        </div>
        <p className="text-sm text-red-700 mt-2">
          Vous n'avez pas les droits d'administrateur nécessaires pour accéder à
          cette page.
        </p>
      </div>);

  }
  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">
        Tableau de bord administrateur
      </h2>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'statistics' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('statistics')}>

              Statistiques
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'users' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('users')}>

              Utilisateurs
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'channels' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('channels')}>

              Canaux
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium ${activeTab === 'content' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('content')}>

              IA PRONOS
            </button>
          </nav>
        </div>
        <div className="p-6">
          {activeTab === 'statistics' &&
          <div>
              <h3 className="text-lg font-medium mb-4">
                Statistiques globales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-green-800">
                      Utilisateurs
                    </h4>
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">

                      <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />

                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {siteStatistics.users.total.toLocaleString()}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-green-600">Premium</span>
                    <span className="text-xs font-medium text-green-700">
                      {siteStatistics.users.premium.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-blue-800">
                      Canaux
                    </h4>
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600"
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
                  <p className="text-2xl font-bold text-blue-700">
                    {siteStatistics.channels.total}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-blue-600">Premium</span>
                    <span className="text-xs font-medium text-blue-700">
                      {siteStatistics.channels.premium}
                    </span>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-purple-800">
                      Revenus
                    </h4>
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">

                      <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    {siteStatistics.revenue.total.toLocaleString()}€
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-purple-600">Ce mois</span>
                    <span className="text-xs font-medium text-purple-700">
                      {siteStatistics.revenue.thisMonth.toLocaleString()}€
                    </span>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-yellow-800">
                      Pronostics
                    </h4>
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-600"
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
                  <p className="text-2xl font-bold text-yellow-700">
                    {siteStatistics.content.totalPronos.toLocaleString()}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-yellow-600">
                      Taux de réussite
                    </span>
                    <span className="text-xs font-medium text-yellow-700">
                      {siteStatistics.content.successRate}%
                    </span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-medium mb-4">Activité récente</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h4 className="text-sm font-medium">
                    Dernières inscriptions
                  </h4>
                </div>
                <div className="p-4">
                  <ul className="divide-y divide-gray-200">
                    <li className="py-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                          <span className="text-xs font-medium">JD</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Jean Dupont</p>
                          <p className="text-xs text-gray-500">
                            jean.dupont@example.com
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        Il y a 2 heures
                      </span>
                    </li>
                    <li className="py-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                          <span className="text-xs font-medium">ML</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Marie Lambert</p>
                          <p className="text-xs text-gray-500">
                            marie.lambert@example.com
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        Il y a 4 heures
                      </span>
                    </li>
                    <li className="py-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                          <span className="text-xs font-medium">PB</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Pierre Blanc</p>
                          <p className="text-xs text-gray-500">
                            pierre.blanc@example.com
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        Il y a 6 heures
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          }
          {activeTab === 'users' &&
          <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  Gestion des utilisateurs
                </h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />

                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
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
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
                    Exporter
                  </button>
                </div>
              </div>
              <div className="mb-4 flex space-x-2">
                <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm">
                  Tous
                </button>
                <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm">
                  Premium
                </button>
                <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm">
                  Pros
                </button>
                <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm">
                  Certifiés
                </button>
                <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm">
                  Bannis
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Utilisateur
                      </th>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Email
                      </th>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Statut
                      </th>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Inscription
                      </th>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id} className={u.status === 'Banni' ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full bg-${u.color}-100 flex items-center justify-center text-${u.color}-600 mr-3`}>
                              <span className="text-xs font-medium">{u.initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{u.name}</p>
                              <div className="flex items-center">
                                <span className={`text-xs bg-${u.role === 'Pro' ? 'green' : 'gray'}-100 text-${u.role === 'Pro' ? 'green' : 'gray'}-800 px-1.5 py-0.5 rounded-full mr-1`}>
                                  {u.role}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">Voir</button>
                            <button className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Modifier</button>
                            <button 
                              onClick={() => handleBanUser(u.id)}
                              className={`px-2 py-1 rounded text-xs ${u.status === 'Banni' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                            >
                              {u.status === 'Banni' ? 'Débannir' : 'Bannir'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          }
          {activeTab === 'channels' &&
          <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Gestion des canaux</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <input
                    type="text"
                    placeholder="Rechercher un canal..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />

                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
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
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
                    Nouveau canal
                  </button>
                </div>
              </div>
              <div className="mb-4 flex space-x-2">
                <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm">
                  Tous
                </button>
                <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm">
                  Premium
                </button>
                <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm">
                  Gratuits
                </button>
                <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm">
                  Officiels
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Canal
                      </th>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Propriétaire
                      </th>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Type
                      </th>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Membres
                      </th>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adminChannels.map((c) => (
                      <tr key={c.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full bg-${c.color}-100 flex items-center justify-center text-${c.color}-600 mr-3`}>
                              <span className="text-xs font-medium">{c.initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{c.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {c.owner}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.type === 'Officiel' ? 'bg-purple-100 text-purple-800' : c.type === 'Premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                            {c.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {c.members}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">Voir</button>
                            <button className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Stats</button>
                            <button 
                              onClick={() => handleDeleteChannel(c.id)}
                              className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          }
          {activeTab === 'content' &&
          <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  Gestion des pronostics IA
                </h3>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
                    Nouveau pronostic
                  </button>
                </div>
              </div>
              <div className="mb-4 flex space-x-2">
                <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm">
                  Tous
                </button>
                <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm">
                  Publiés
                </button>
                <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm">
                  En attente
                </button>
                <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm">
                  Brouillons
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Match
                      </th>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Prédiction
                      </th>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Confiance
                      </th>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Date
                      </th>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Statut
                      </th>
                      <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        PSG vs Marseille
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        PSG Victoire
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <DynamicWidthBar
                              progress={85}
                              className="bg-green-600 h-2.5 rounded-full"
                            />
                          </div>
                          <span className="ml-2 text-xs text-gray-500">
                            85%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        25/06/2023
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          En attente
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                            Publier
                          </button>
                          <button className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                            Modifier
                          </button>
                          <button className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Lyon vs Monaco
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Plus de 2.5 buts
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-yellow-500 h-2.5 rounded-full w-[78%]"
                            >
                            </div>
                          </div>
                          <span className="ml-2 text-xs text-gray-500">
                            78%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        24/06/2023
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Publié
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                            Modifier
                          </button>
                          <button className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Manchester City vs Arsenal
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Match nul
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-red-500 h-2.5 rounded-full w-[62%]"
                            >
                            </div>
                          </div>
                          <span className="ml-2 text-xs text-gray-500">
                            62%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        26/06/2023
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Brouillon
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                            Publier
                          </button>
                          <button className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                            Modifier
                          </button>
                          <button className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      </div>
    </div>);

};
export default AdminDashboard;