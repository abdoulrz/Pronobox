import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MarkdownEditor from './MarkdownEditor';
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
  const StatsView = ({ stats }: any) => (
  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div className="bg-slate-50 dark:bg-brand-navy-3 p-4 rounded-xl border border-slate-100 dark:border-brand-slate transition-all hover:border-brand-green/30">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Utilisateurs</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.users.total}</p>
          <p className="text-[10px] text-brand-green font-bold">+{stats.users.newToday} aujourd'hui</p>
        </div>
        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3.005 3.005 0 013.75-2.906z" /></svg>
        </div>
      </div>
    </div>
    <div className="bg-slate-50 dark:bg-brand-navy-3 p-4 rounded-xl border border-slate-100 dark:border-brand-slate transition-all hover:border-brand-green/30">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Canaux</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.channels.total}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{stats.channels.premium} Premium</p>
        </div>
        <div className="p-2 bg-brand-green/10 text-brand-green rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg>
        </div>
      </div>
    </div>
    <div className="bg-slate-50 dark:bg-brand-navy-3 p-4 rounded-xl border border-slate-100 dark:border-brand-slate transition-all hover:border-brand-green/30">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Revenus</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.revenue.thisMonth}€</p>
          <p className="text-[10px] text-brand-green font-bold">Ce mois-ci</p>
        </div>
        <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
        </div>
      </div>
    </div>
    <div className="bg-slate-50 dark:bg-brand-navy-3 p-4 rounded-xl border border-slate-100 dark:border-brand-slate transition-all hover:border-brand-green/30">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Pronos</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.content.successRate}%</p>
          <p className="text-[10px] text-brand-green font-bold">Taux de réussite</p>
        </div>
        <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" /></svg>
        </div>
      </div>
    </div>
  </div>
);
  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Tableau de bord</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Gestion globale de la plateforme PronosBox</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] font-black uppercase text-brand-green tracking-widest">Admin Session</span>
            <span className="text-xs font-bold text-slate-400">Dernière maj: {new Date().toLocaleTimeString()}</span>
          </div>
          <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-brand-navy-3 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-brand-slate shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-brand-navy-2 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-brand-slate overflow-hidden mb-8 transition-all">
        <div className="border-b border-slate-200 dark:border-brand-slate bg-slate-50/50 dark:bg-brand-navy-3/30">
          <nav className="flex overflow-x-auto no-scrollbar">
            {[
              { id: 'statistics', label: 'Stats', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg> },
              { id: 'users', label: 'Utilisateurs', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg> },
              { id: 'channels', label: 'Canaux', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg> },
              { id: 'pronos', label: 'Pronos', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" /></svg> },
              { id: 'bet-educ', label: 'BET-EDUC', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12V12.5a1 1 0 00.617.924l4.417 1.935a1 1 0 00.733 0l4.417-1.935A1 1 0 0016 12.5V10.12l1.69-.724a1 1 0 00.583-1.23l-1.02-3.06a1 1 0 00-1.23-.583l-3.06 1.02a1 1 0 00-.583 1.23l1.02 3.06z" /></svg> }
            ].map(tab => (
              <button
                key={tab.id}
                className={`py-4 px-6 text-sm font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-brand-green text-brand-green bg-white dark:bg-brand-navy-2 shadow-[0_-4px_12px_-4px_rgba(34,197,94,0.1)]' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'statistics' && (
            <div className="space-y-8">
              <StatsView stats={siteStatistics} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-brand-navy-2 rounded-2xl border border-slate-200 dark:border-brand-slate overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-200 dark:border-brand-slate bg-slate-50 dark:bg-brand-navy-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Dernières inscriptions</h4>
                  </div>
                  <div className="p-2">
                    <ul className="divide-y divide-slate-100 dark:divide-brand-slate/30">
                      {users.slice(0, 3).map(u => (
                        <li key={u.id} className="p-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-brand-navy-3/30 transition-colors rounded-xl">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full bg-${u.color}-100 dark:bg-${u.color}-900/30 flex items-center justify-center text-${u.color}-600 dark:text-${u.color}-400 mr-3 shadow-inner`}>
                              <span className="text-xs font-bold">{u.initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-white">{u.name}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-brand-navy-3 px-2 py-1 rounded-full uppercase">{u.date.split('/')[0]}/{u.date.split('/')[1]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-brand-navy-2 rounded-2xl border border-slate-200 dark:border-brand-slate overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-200 dark:border-brand-slate bg-slate-50 dark:bg-brand-navy-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Performances Pronostics</h4>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Total Pronos</span>
                      <span className="text-lg font-black text-slate-800 dark:text-white">{siteStatistics.content.totalPronos}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-brand-navy-3 h-2 rounded-full mb-6">
                      <div className="bg-brand-green h-full rounded-full" style={{ width: `${siteStatistics.content.successRate}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                      <span>Échecs</span>
                      <span className="text-brand-green">Succès {siteStatistics.content.successRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Gestion des utilisateurs</h3>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <input type="text" placeholder="Rechercher..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-brand-navy-3 border border-slate-200 dark:border-brand-slate rounded-lg text-xs focus:ring-2 focus:ring-brand-green/30 outline-none" />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <button className="p-2 rounded-lg bg-slate-100 dark:bg-brand-navy-3 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-brand-slate">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-brand-slate rounded-xl overflow-x-auto shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-brand-slate/30">
                  <thead className="bg-slate-50 dark:bg-brand-navy-3">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Utilisateur</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Email</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-brand-navy-2 divide-y divide-slate-100 dark:divide-brand-slate/30">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-brand-navy-3/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-9 h-9 rounded-full bg-${u.color}-100 dark:bg-${u.color}-900/30 flex items-center justify-center text-${u.color}-600 dark:text-${u.color}-400 mr-3 border border-slate-200 dark:border-brand-slate shadow-inner`}>
                              <span className="text-xs font-black">{u.initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-white">{u.name}</p>
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${u.role === 'Pro' ? 'bg-brand-green/10 text-brand-green' : 'bg-slate-100 dark:bg-brand-navy-1 text-slate-500'}`}>{u.role}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-medium">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${u.status === 'Actif' ? 'bg-brand-green/10 text-brand-green' : 'bg-red-500/10 text-red-500'}`}>{u.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-medium">{u.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleBanUser(u.id)} className={`p-1.5 rounded-lg transition-colors ${u.status === 'Banni' ? 'text-brand-green hover:bg-brand-green/10' : 'text-red-500 hover:bg-red-500/10'}`} title={u.status === 'Banni' ? 'Débannir' : 'Bannir'}>
                              {u.status === 'Banni' ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>}
                            </button>
                            <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-brand-navy-3 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Gestion des canaux</h3>
                <button className="btn-primary px-4 py-2 text-xs font-bold shadow-lg shadow-brand-green/20">Nouveau canal</button>
              </div>
              <div className="border border-slate-200 dark:border-brand-slate rounded-xl overflow-x-auto shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-brand-slate/30">
                  <thead className="bg-slate-50 dark:bg-brand-navy-3">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Canal</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Propriétaire</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Type</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Membres</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-brand-navy-2 divide-y divide-slate-100 dark:divide-brand-slate/30">
                    {adminChannels.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-brand-navy-3/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-9 h-9 rounded-full bg-${c.color}-100 dark:bg-${c.color}-900/30 flex items-center justify-center text-${c.color}-600 dark:text-${c.color}-400 mr-3 border border-slate-200 dark:border-brand-slate shadow-inner`}>
                              <span className="text-xs font-black">{c.initials}</span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{c.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-medium">{c.owner}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${c.type === 'Officiel' ? 'bg-purple-500/10 text-purple-500' : 'bg-brand-green/10 text-brand-green'}`}>{c.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-medium">{c.members}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleDeleteChannel(c.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors" title="Supprimer">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'pronos' && (
            <PronosManagement />
          )}

          {activeTab === 'bet-educ' && (
            <BetEducManagement />
          )}
        </div>
      </div>
    </div>
  );
};

const BetEducManagement = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingResource, setViewingResource] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'E-book',
    category: 'free',
    price: 0,
    image: '',
    contentType: 'link',
    content: '',
    description: ''
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  const [imageSource, setImageSource] = useState<'url' | 'file'>('url');
  const [contentSource, setContentSource] = useState<'url' | 'file'>('url');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleFileUpload = async (file: File, targetField: 'image' | 'content', setUploading: (u: boolean) => void) => {
    setUploading(true);
    try {
      const response = await fetch(`/api/upload-binary?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file // Browser streams the binary directly, 100% efficient!
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, [targetField]: data.url }));
      } else {
        const errorData = await response.json();
        alert(`Erreur de téléversement: ${errorData.message}`);
      }
    } catch (fetchErr) {
      console.error("Fetch upload error", fetchErr);
      alert("Erreur de téléversement : Problème réseau ou fichier trop volumineux.");
    } finally {
      setUploading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/beteduc');
      const data = await res.json();
      setResources(data);
    } catch (err) {
      console.error("Failed to fetch resources", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const getTypeIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('book') || lower.includes('livre')) return '📖';
    if (lower.includes('vidéo') || lower.includes('film') || lower.includes('video')) return '🎬';
    if (lower.includes('article') || lower.includes('texte')) return '📝';
    if (lower.includes('formation') || lower.includes('cours')) return '🎓';
    return '📄';
  };

  const getUnsplashDirectUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('unsplash.com') && !url.includes('images.unsplash.com')) {
      try {
        const urlObj = new URL(url);
        const segments = urlObj.pathname.split('/').filter(Boolean);
        if (segments.length > 0) {
          const lastSegment = segments[segments.length - 1];
          const idParts = lastSegment.split('-');
          const photoId = idParts[idParts.length - 1];
          if (photoId && photoId.length >= 8) {
            return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=800&q=80`;
          }
        }
      } catch (e) {
        console.error("Failed to parse Unsplash URL", e);
      }
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/beteduc/${editingId}` : '/api/beteduc';
    const method = editingId ? 'PUT' : 'POST';
    
    // Clean and normalize URLs prior to persistence
    const cleanedFormData = {
      ...formData,
      image: getUnsplashDirectUrl(formData.image)
    };
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cleanedFormData)
      });
      if (res.ok) {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ title: '', type: 'E-book', category: 'free', price: 0, image: '', contentType: 'link', content: '', description: '' });
        setImageSource('url');
        setContentSource('url');
        fetchResources();
      }
    } catch (err) {
      console.error("Failed to save resource", err);
    }
  };

  const handleEdit = (resource: any) => {
    setFormData({
      title: resource.title,
      type: resource.type,
      category: resource.category,
      price: resource.price || 0,
      image: resource.image,
      contentType: resource.contentType,
      content: resource.content,
      description: resource.description
    });
    setImageSource(resource.image && resource.image.startsWith('/uploads/') ? 'file' : 'url');
    setContentSource(resource.content && resource.content.startsWith('/uploads/') ? 'file' : 'url');
    setEditingId(resource.id || resource._id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette ressource ?')) return;
    try {
      const res = await fetch(`/api/beteduc/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) fetchResources();
    } catch (err) {
      console.error("Failed to delete resource", err);
    }
  };

  const filteredResources = resources.filter(res => 
    res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Gestion BET-EDUC</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input 
              type="text" 
              placeholder="Rechercher une ressource..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-brand-navy-3 border border-slate-200 dark:border-brand-slate/50 rounded-xl text-xs focus:ring-2 focus:ring-brand-green/30 outline-none transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <button 
            onClick={() => { setIsAdding(!isAdding); setEditingId(null); }}
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all shadow-lg ${isAdding ? 'bg-red-500 text-white rotate-45' : 'bg-brand-green text-white shadow-brand-green/20'}`}
            title={isAdding ? 'Annuler' : 'Ajouter'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-brand-navy-2 p-6 rounded-2xl border border-slate-200 dark:border-brand-slate shadow-xl shadow-slate-200/50 dark:shadow-none mb-8 animate-fade-in space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center text-brand-green">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
            </div>
            <h4 className="text-sm font-black uppercase text-slate-800 dark:text-white tracking-widest">{editingId ? 'Modifier la ressource' : 'Nouvelle Ressource'}</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="beteduc-title" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Titre de la ressource</label>
              <input 
                id="beteduc-title" type="text" required
                placeholder="Ex: Maîtriser les paris combinés"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-slate-50 dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="beteduc-type" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Type de contenu</label>
              <div className="relative">
                <select 
                  id="beteduc-type" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="E-book">E-book</option>
                  <option value="Vidéo">Vidéo</option>
                  <option value="Article">Article</option>
                  <option value="Formation">Formation</option>
                  <option value="Podcast">Podcast</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="beteduc-category" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Accès</label>
                <div className="relative">
                  <select 
                    id="beteduc-category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}
                    className="w-full bg-slate-50 dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="free">Gratuit</option>
                    <option value="premium">Premium</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="beteduc-price" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Prix (€)</label>
                <input 
                  id="beteduc-price" type="number" step="0.01" disabled={formData.category === 'free'}
                  value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className={`w-full bg-slate-50 dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all ${formData.category === 'free' ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Image de couverture</label>
                <div className="flex gap-1.5 bg-slate-100 dark:bg-brand-navy-3 p-0.5 rounded-lg border border-slate-200/50 dark:border-brand-slate/20">
                  <button
                    type="button"
                    onClick={() => setImageSource('url')}
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition-all ${imageSource === 'url' ? 'bg-white dark:bg-brand-navy-2 text-brand-green shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSource('file')}
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition-all ${imageSource === 'file' ? 'bg-white dark:bg-brand-navy-2 text-brand-green shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  >
                    Téléverser
                  </button>
                </div>
              </div>

              {imageSource === 'url' ? (
                <input 
                  id="beteduc-image" type="text" required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image} onChange={e => setFormData({...formData, image: getUnsplashDirectUrl(e.target.value)})}
                  className="w-full bg-slate-50 dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all"
                />
              ) : (
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col items-center justify-center w-full h-[46px] border-2 border-dashed border-slate-200 dark:border-brand-slate/50 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-brand-navy-3/30 transition-all">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {isUploadingImage ? 'Téléversement...' : formData.image ? 'Changer d\'image' : 'Sélectionner une image...'}
                    </span>
                    <input 
                      type="file" accept="image/*" className="hidden" 
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'image', setIsUploadingImage);
                      }} 
                    />
                  </label>
                  {formData.image && (
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-brand-navy-3 p-2 rounded-xl border border-slate-100 dark:border-brand-slate/30">
                      <img src={formData.image} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Aperçu de la couverture</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{formData.image}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, image: ''})} 
                        className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-500/10 transition-all text-xs font-black uppercase"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="beteduc-contenttype" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Format de délivrabilité</label>
              <div className="relative">
                <select 
                  id="beteduc-contenttype" value={formData.contentType} onChange={e => setFormData({...formData, contentType: e.target.value as any})}
                  className="w-full bg-slate-50 dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="link">Lien externe (Blog/Vidéo)</option>
                  <option value="file">Fichier (Download URL)</option>
                  <option value="text">Analyse détaillée (Texte/MD)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="beteduc-desc" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Description courte (Accroche)</label>
            <input 
              id="beteduc-desc" type="text" required
              placeholder="Une phrase courte pour donner envie de consulter la ressource..."
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-50 dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="beteduc-content" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Contenu (URL ou Analyse Markdown)</label>
            {formData.contentType === 'text' ? (
              <MarkdownEditor
                id="beteduc-content"
                label="Contenu éducatif"
                placeholder="## Pourquoi cette stratégie fonctionne ?&#10;&#10;Utilisez des **exemples réels**...&#10;&#10;- Astuce 1&#10;- Astuce 2"
                rows={8}
                value={formData.content}
                onChange={val => setFormData({...formData, content: val})}
              />
            ) : formData.contentType === 'file' ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Fichier de la ressource</span>
                  <div className="flex gap-1.5 bg-slate-100 dark:bg-brand-navy-3 p-0.5 rounded-lg border border-slate-200/50 dark:border-brand-slate/20">
                    <button
                      type="button"
                      onClick={() => setContentSource('url')}
                      className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition-all ${contentSource === 'url' ? 'bg-white dark:bg-brand-navy-2 text-brand-green shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentSource('file')}
                      className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition-all ${contentSource === 'file' ? 'bg-white dark:bg-brand-navy-2 text-brand-green shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                    >
                      Téléverser
                    </button>
                  </div>
                </div>

                {contentSource === 'url' ? (
                  <input 
                    id="beteduc-content" type="text" required
                    placeholder="URL de téléchargement du fichier (PDF, E-book...)..."
                    value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all"
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    <label className="flex flex-col items-center justify-center w-full h-[46px] border-2 border-dashed border-slate-200 dark:border-brand-slate/50 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-brand-navy-3/30 transition-all">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {isUploadingContent ? 'Téléversement...' : formData.content ? 'Changer de fichier' : 'Sélectionner un fichier...'}
                      </span>
                      <input 
                        type="file" className="hidden" 
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'content', setIsUploadingContent);
                        }} 
                      />
                    </label>
                    {formData.content && (
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-brand-navy-3 p-2.5 rounded-xl border border-slate-100 dark:border-brand-slate/30">
                        <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center text-brand-green text-xl font-bold">
                          📁
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Fichier téléversé</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{formData.content}</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setFormData({...formData, content: ''})} 
                          className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-500/10 transition-all text-xs font-black uppercase"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <input 
                id="beteduc-content" type="text" required
                placeholder="URL du lien de la ressource..."
                value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full bg-slate-50 dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all"
              />
            )}
          </div>

          <button 
            type="submit" 
            disabled={isUploadingImage || isUploadingContent}
            className={`w-full btn-primary py-4 font-black uppercase tracking-widest shadow-xl transition-all rounded-2xl ${
              isUploadingImage || isUploadingContent 
                ? 'opacity-50 cursor-not-allowed bg-slate-400' 
                : 'shadow-brand-green/30 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isUploadingImage || isUploadingContent 
              ? 'Téléversement en cours...' 
              : editingId 
                ? 'Mettre à jour la ressource' 
                : 'Publier la ressource'
            }
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">Synchronisation des ressources...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(res => {
            const resourceId = res.id || res._id;
            const hasImageError = !res.image || imageErrors[resourceId];
            return (
              <div key={resourceId} className="bg-white dark:bg-brand-navy-2 rounded-2xl border border-slate-200 dark:border-brand-slate overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300">
                <div className="h-44 relative overflow-hidden bg-slate-50 dark:bg-brand-navy-3 flex items-center justify-center">
                  {hasImageError ? (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-brand-navy-3 dark:to-brand-navy-2 flex flex-col items-center justify-center gap-2 border-b border-slate-100 dark:border-brand-slate/10">
                      <span className="text-4xl drop-shadow-md">{getTypeIcon(res.type)}</span>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Image non disponible</span>
                    </div>
                  ) : (
                    <img 
                      src={res.image} 
                      alt={res.title} 
                      onError={() => setImageErrors(prev => ({ ...prev, [resourceId]: true }))}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-lg backdrop-blur-md ${res.category === 'premium' ? 'bg-yellow-400/90 text-brand-navy-1' : 'bg-brand-green/90 text-white'}`}>
                    {res.category === 'premium' ? `PRO (${res.price}€)` : 'GRATUIT'}
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <span className="text-2xl drop-shadow-md">{getTypeIcon(res.type)}</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-wider bg-black/30 backdrop-blur-sm px-2 py-1 rounded">{res.type}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2 line-clamp-1 group-hover:text-brand-green transition-colors">{res.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">{res.description}</p>
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-brand-slate/30">
                    <button 
                      onClick={() => setViewingResource(res)}
                      className="flex-1 py-2 bg-slate-50 dark:bg-brand-navy-3 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase hover:bg-brand-green/10 hover:text-brand-green transition-all"
                    >
                      Aperçu
                    </button>
                    <button 
                      onClick={() => handleEdit(res)} 
                      className="p-2 bg-slate-50 dark:bg-brand-navy-3 text-yellow-500 rounded-xl hover:bg-yellow-500/10 transition-all"
                      title="Modifier"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(resourceId)} 
                      className="p-2 bg-slate-50 dark:bg-brand-navy-3 text-red-500 rounded-xl hover:bg-red-500/10 transition-all"
                      title="Supprimer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredResources.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-400 italic text-sm">Aucune ressource ne correspond à votre recherche.</p>
            </div>
          )}
        </div>
      )}

      {/* Quick View Modal */}
      {viewingResource && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-brand-navy-2 w-full max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-200 dark:border-brand-slate animate-scale-up">
            <div className="p-6 border-b border-slate-100 dark:border-brand-slate/30 flex justify-between items-center bg-slate-50 dark:bg-brand-navy-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTypeIcon(viewingResource.type)}</span>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{viewingResource.title}</h3>
                  <p className="text-[10px] font-black text-brand-green uppercase tracking-widest">{viewingResource.type}</p>
                </div>
              </div>
              <button onClick={() => setViewingResource(null)} className="p-2 rounded-xl bg-white dark:bg-brand-navy-2 text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 overflow-y-auto no-scrollbar flex-1 bg-white dark:bg-brand-navy-2">
              <p className="text-sm font-bold text-slate-800 dark:text-white mb-4 italic">"{viewingResource.description}"</p>
              <div className="p-4 bg-slate-50 dark:bg-brand-navy-3 rounded-2xl border border-slate-100 dark:border-brand-slate/50 mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contenu :</p>
                {viewingResource.contentType === 'text' ? (
                  <div className="prono-md text-sm text-slate-600 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: markdownToHtml(viewingResource.content) }} />
                ) : (
                  <a href={viewingResource.content} target="_blank" rel="noreferrer" className="text-brand-green font-bold hover:underline break-all">{viewingResource.content}</a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PronosManagement = () => {
  const [pronos, setPronos] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    matchId: '',
    homeTeamName: '',
    awayTeamName: '',
    freeChoice: 'home',
    freeOddsHome: 0,
    freeOddsDraw: 0,
    freeOddsAway: 0,
    keyInfos: '',
    premiumAnalysis: '',
    iaOpinion: ''
  });

  // Search Engine State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchMatches = async () => {
    if (!searchDate) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/football/matches?date=${searchDate}`);
      const data = await res.json();
      if (data && data.response) {
        setSearchResults(data.response);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchPronos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/pronos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPronos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPronos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        matchId: parseInt(formData.matchId),
        homeTeamName: formData.homeTeamName,
        awayTeamName: formData.awayTeamName,
        freePrediction: {
          choice: formData.freeChoice,
          odds: {
            home: formData.freeOddsHome,
            draw: formData.freeOddsDraw,
            away: formData.freeOddsAway
          }
        },
        keyInfos: formData.keyInfos.split('\n').filter(k => k.trim() !== ''),
        premiumAnalysis: formData.premiumAnalysis,
        iaOpinion: formData.iaOpinion
      };

      const url = editingId ? `/api/pronos/${editingId}` : '/api/pronos';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsAdding(false);
        setEditingId(null);
        setFormData({
          matchId: '', homeTeamName: '', awayTeamName: '', freeChoice: 'home',
          freeOddsHome: 0, freeOddsDraw: 0, freeOddsAway: 0,
          keyInfos: '', premiumAnalysis: '', iaOpinion: ''
        });
        fetchPronos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (prono: any) => {
    setFormData({
      matchId: prono.matchId.toString(),
      homeTeamName: prono.homeTeamName,
      awayTeamName: prono.awayTeamName,
      freeChoice: prono.freePrediction.choice,
      freeOddsHome: prono.freePrediction.odds.home,
      freeOddsDraw: prono.freePrediction.odds.draw,
      freeOddsAway: prono.freePrediction.odds.away,
      keyInfos: prono.keyInfos.join('\n'),
      premiumAnalysis: prono.premiumAnalysis,
      iaOpinion: prono.iaOpinion
    });
    setEditingId(prono.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer ce prono ?")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/pronos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPronos();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Gestion des Pronostics</h3>
        <button 
          onClick={() => { setIsAdding(!isAdding); setEditingId(null); }} 
          className="w-full sm:w-auto btn-primary py-2.5 px-6 text-sm font-bold shadow-lg shadow-brand-green/20"
        >
          {isAdding ? 'Annuler' : 'Nouveau Pronostic'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-brand-navy-2 p-6 rounded-xl border border-slate-200 dark:border-brand-slate mb-8 space-y-6 shadow-xl shadow-slate-200/50 dark:shadow-none animate-fade-in">
          {/* Match Search Engine */}
          <div className="p-4 bg-brand-green/5 dark:bg-brand-green/5 rounded-2xl border border-brand-green/20 mb-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-green mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
              Assistant de Recherche de Match
            </h4>
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="date" 
                className="bg-white dark:bg-brand-navy-3 border border-slate-200 dark:border-brand-slate/50 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-green/30 transition-all"
                value={searchDate}
                onChange={e => setSearchDate(e.target.value)}
              />
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Rechercher une équipe..." 
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-brand-navy-3 border border-slate-200 dark:border-brand-slate/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-green/30 transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <button 
                type="button"
                onClick={handleSearchMatches}
                disabled={isSearching}
                className="bg-brand-green text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-green-dark transition-all disabled:opacity-50"
              >
                {isSearching ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 max-h-48 overflow-y-auto space-y-2 no-scrollbar">
                {searchResults.filter(m => 
                  m.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  m.teams.away.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((match: any) => (
                  <div 
                    key={match.fixture.id}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        matchId: match.fixture.id.toString(),
                        homeTeamName: match.teams.home.name,
                        awayTeamName: match.teams.away.name
                      });
                      setSearchResults([]);
                      setSearchTerm('');
                    }}
                    className="flex justify-between items-center p-3 bg-white dark:bg-brand-navy-2 border border-slate-100 dark:border-brand-slate/30 rounded-xl cursor-pointer hover:border-brand-green/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <img src={match.teams.home.logo} alt="" className="w-5 h-5 object-contain" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{match.teams.home.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400">VS</span>
                      <div className="flex items-center gap-2">
                        <img src={match.teams.away.logo} alt="" className="w-5 h-5 object-contain" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{match.teams.away.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400">{match.league.name}</span>
                      <span className="text-[10px] font-black text-brand-green group-hover:underline">Sélectionner</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="prono-matchId" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">ID du Match (API)</label>
              <input id="prono-matchId" type="number" required placeholder="Ex: 103524" value={formData.matchId} onChange={e => setFormData({...formData, matchId: e.target.value})} className="w-full bg-slate-50 dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="prono-homeTeamName" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Équipe 1</label>
              <input id="prono-homeTeamName" type="text" required placeholder="Ex: Valencia" value={formData.homeTeamName} onChange={e => setFormData({...formData, homeTeamName: e.target.value})} className="w-full bg-slate-50 dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="prono-awayTeamName" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Équipe 2</label>
              <input id="prono-awayTeamName" type="text" required placeholder="Ex: Getafe" value={formData.awayTeamName} onChange={e => setFormData({...formData, awayTeamName: e.target.value})} className="w-full bg-slate-50 dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all" />
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-brand-navy-3 rounded-2xl border border-slate-100 dark:border-brand-slate/50">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-green mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-green"></span>
              Pronostic Gratuit
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="prono-freeChoice" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Choix (1X2)</label>
                <div className="relative">
                  <select id="prono-freeChoice" value={formData.freeChoice} onChange={e => setFormData({...formData, freeChoice: e.target.value})} className="w-full bg-white dark:bg-brand-navy-2 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all cursor-pointer appearance-none">
                    <option value="home">Équipe 1 (1)</option>
                    <option value="draw">Nul (X)</option>
                    <option value="away">Équipe 2 (2)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="prono-freeOddsHome" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Cote 1</label>
                <input id="prono-freeOddsHome" type="number" step="0.01" required value={formData.freeOddsHome} onChange={e => setFormData({...formData, freeOddsHome: parseFloat(e.target.value)})} className="w-full bg-white dark:bg-brand-navy-2 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="prono-freeOddsDraw" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Cote X</label>
                <input id="prono-freeOddsDraw" type="number" step="0.01" required value={formData.freeOddsDraw} onChange={e => setFormData({...formData, freeOddsDraw: parseFloat(e.target.value)})} className="w-full bg-white dark:bg-brand-navy-2 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="prono-freeOddsAway" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Cote 2</label>
                <input id="prono-freeOddsAway" type="number" step="0.01" required value={formData.freeOddsAway} onChange={e => setFormData({...formData, freeOddsAway: parseFloat(e.target.value)})} className="w-full bg-white dark:bg-brand-navy-2 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-green ml-1 mb-1">Perspectives du match (1 par ligne)</h4>
            <MarkdownEditor
              id="prono-keyInfos"
              label="Perspectives du match"
              placeholder="- **H2H** avantage Valencia&#10;- Valence *invaincu* à domicile depuis 5 matchs&#10;- ==Point crucial==: forme récente excellente"
              rows={4}
              value={formData.keyInfos}
              onChange={val => setFormData({...formData, keyInfos: val})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-green ml-1 mb-1">Analyse Premium</h4>
              <MarkdownEditor
                id="prono-premiumAnalysis"
                label="Analyse Premium"
                placeholder="**Analyse** réservée aux membres Pro...&#10;- Point clé 1&#10;- Point clé 2"
                rows={5}
                value={formData.premiumAnalysis}
                onChange={val => setFormData({...formData, premiumAnalysis: val})}
              />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-green ml-1 mb-1">L'Avis de l'IA</h4>
              <MarkdownEditor
                id="prono-iaOpinion"
                label="Avis IA"
                placeholder="==Recommandation principale==&#10;Résumé *concis* de l'IA..."
                rows={5}
                value={formData.iaOpinion}
                onChange={val => setFormData({...formData, iaOpinion: val})}
              />
            </div>
          </div>

          <button type="submit" className="w-full btn-primary py-4 font-black uppercase tracking-widest shadow-xl shadow-brand-green/30 transition-all hover:scale-[1.01] active:scale-[0.99] rounded-2xl">
            {editingId ? 'Mettre à jour le Pronostic' : 'Publier le Pronostic'}
          </button>
        </form>
      )}

      <div className="bg-white dark:bg-brand-navy-2 rounded-xl border border-slate-200 dark:border-brand-slate overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-brand-slate/30">
          <thead className="bg-slate-50 dark:bg-brand-navy-3">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Match</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Choix</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-brand-navy-2 divide-y divide-slate-100 dark:divide-brand-slate/30">
            {pronos.map((p: any) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-brand-navy-3/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{p.homeTeamName} vs {p.awayTeamName}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">ID Match: {p.matchId}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 rounded-lg bg-brand-green/10 text-brand-green text-[10px] font-black uppercase">
                    {p.freePrediction.choice === 'home' ? '1' : p.freePrediction.choice === 'draw' ? 'X' : '2'} @ {p.freePrediction.odds[p.freePrediction.choice as keyof typeof p.freePrediction.odds].toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-500/10 transition-colors" title="Modifier">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors" title="Supprimer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pronos.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">Aucun pronostic publié</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;