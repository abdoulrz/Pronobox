import { useState, useEffect, useCallback } from 'react';
import { WS_EVENTS } from '../services/WebSocketService';
import { useWebSocket } from '../hooks/useWebSocket';
import { getUsers, updateUserByAdmin, getAdminTransactions, getAdminWithdrawals, getSupportMessages, updateWithdrawalStatus, sendAdminSupportMessage } from '../services/api';
import { UserData, SupportMessage, Transaction, WithdrawalRequest } from './settings/SettingsAdminUser';
import { useAuth } from '../contexts/AuthContext';
import { useChannelData } from '../contexts/ChannelContext';
import MarkdownEditor from './MarkdownEditor';
import { markdownToHtml } from '../utils/markdownToHtml';
import { getProno6Options } from './predictions/CreatePronoModal';
const parseErrorResponse = async (res: Response): Promise<{ error: string; details?: string }> => {
  try {
    const errorData = await res.json();
    return {
      error: errorData.error || errorData.message || 'Erreur inconnue',
      details: errorData.details
    };
  } catch {
    try {
      const text = await res.text();
      return {
        error: `Erreur serveur (${res.status})`,
        details: text.substring(0, 200) + (text.length > 200 ? '...' : '')
      };
    } catch {
      return { error: `Erreur serveur (${res.status})` };
    }
  }
};

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const { refreshChannels } = useChannelData();
  const [activeTab, setActiveTab] = useState('statistics');

  const { connected, subscribe } = useWebSocket();
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [usersData, setUsersData] = useState<UserData[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userActionMenuOpen, setUserActionMenuOpen] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showWithdrawalDetailsModal, setShowWithdrawalDetailsModal] = useState(false);

  const [showSupportChat, setShowSupportChat] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [activeUserTypeFilter, setActiveUserTypeFilter] = useState('all');

  const [activeTransactionsTab, setActiveTransactionsTab] = useState('historique');

  const [realStats, setRealStats] = useState<any>(null);

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try { 
      const response = await getUsers() as UserData[]; 
      setUsersData(response); 
    } catch (error) {
      console.error(error);
    } finally { 
      setIsLoadingUsers(false); 
    }
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await getAdminTransactions();
      setTransactions(response);
    } catch (error) {
      console.error(error);
    }
  };

  const loadWithdrawalRequests = async () => {
    try { 
      const response = await getAdminWithdrawals(); 
      setWithdrawalRequests(response); 
    } catch (error) {
      console.error(error);
    }
  };

  const loadSupportMessages = async () => {
    try { 
      const response = await getSupportMessages(); 
      setSupportMessages(response); 
    } catch (error) {
      console.error(error);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRealStats(data);
      }
    } catch (error) {
      console.error("Error loading admin stats:", error);
    }
  };

  useEffect(() => { 
    loadUsers(); 
    loadTransactions(); 
    loadWithdrawalRequests(); 
    loadSupportMessages(); 
    loadStats();
  }, [loadUsers]);

  useEffect(() => {
    if (connected) {
      const unsubscribeSupportMessage = subscribe(WS_EVENTS.ADMIN_NEW_SUPPORT_MESSAGE, (payload: any) => {
        setSupportMessages(prev => [...prev, { 
          id: prev.length + 1, 
          sender: 'user', 
          message: payload.message, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          userType: payload.userType, 
          userId: payload.userId, 
          username: payload.username 
        }]);
      });
      const unsubscribeWithdrawal = subscribe(WS_EVENTS.ADMIN_WITHDRAWAL_REQUEST, (payload: any) => {
        setWithdrawalRequests(prev => [payload, ...prev]);
      });
      const unsubscribeUserUpdate = subscribe(WS_EVENTS.ADMIN_USER_UPDATED, (payload: any) => {
        setUsersData(prev => prev.map(u => u.id === payload.id ? { ...u, ...payload } : u));
      });
      const unsubscribeTransaction = subscribe(WS_EVENTS.TRANSACTION_COMPLETE, (payload: any) => {
        setTransactions(prev => [payload, ...prev]);
      });
      return () => { 
        unsubscribeSupportMessage(); 
        unsubscribeWithdrawal(); 
        unsubscribeUserUpdate(); 
        unsubscribeTransaction(); 
      };
    }
  }, [connected, subscribe]);

  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => setUserSearchQuery(e.target.value);
  const handleEditUser = (user: UserData) => { setSelectedUser(user); setShowUserModal(true); };
  
  const handleBanUserAction = async (id: string, ban: boolean) => {
    try { 
      await updateUserByAdmin(id, { status: ban ? 'banned' : 'active', isBanned: ban }); 
      setUsersData(prev => prev.map(u => u.id === id ? { ...u, status: ban ? 'banned' : 'active', isBanned: ban } : u)); 
    } catch (error) {
      console.error(error);
    }
  };
  
  const handlePromoteUser = async (id: string) => {
    try { 
      await updateUserByAdmin(id, { isPro: true }); 
      setUsersData(prev => prev.map(u => u.id === id ? { ...u, isPro: true } : u)); 
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleSaveUserChanges = async () => {
    if (!selectedUser) return;
    try { 
      await updateUserByAdmin(selectedUser.id, selectedUser); 
      setUsersData(prev => prev.map(u => u.id === selectedUser.id ? selectedUser : u)); 
      setShowUserModal(false); 
    } catch (error) {
      console.error(error);
    }
  };

  const handleProcessWithdrawal = async (id: string, approved: boolean) => {
    try { 
      await updateWithdrawalStatus(id, approved ? 'approved' : 'rejected'); 
      setWithdrawalRequests(prev => prev.map(w => w.id === id ? { ...w, status: approved ? 'approved' : 'rejected' } : w)); 
      setShowWithdrawalDetailsModal(false); 
      setSelectedWithdrawal(null); 
    } catch (error) {
      console.error(error);
    }
  };

  const handleSupportMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim() || !selectedUser) return;
    try { 
      const newMsg = await sendAdminSupportMessage({ userId: selectedUser.id, message: supportMessage }); 
      setSupportMessages(prev => [...prev, newMsg]); 
      setSupportMessage(''); 
    } catch (error) {
      console.error(error);
    }
  };

  const handleReplyToSupportMessage = (userId: string, username: string, userType: any) => {
    setSelectedUser({ id: userId, username, isPro: userType === 'pro' } as any);
    setShowSupportChat(true);
  };
  
  const filteredUsers = usersData.filter(u => 
    u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    (u.email && u.email.toLowerCase().includes(userSearchQuery.toLowerCase()))
  );

  // Real channel state fetched from API
  const [adminChannels, setAdminChannels] = useState<any[]>([]);
  const [showChannelForm, setShowChannelForm] = useState(false);
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);
  const [channelForm, setChannelForm] = useState({ name: '', description: '', premium: false, subscriptionPrice: 0, avatar: '' });

  const fetchAdminChannels = async () => {
    try {
      const res = await fetch('/api/channels');
      const data = await res.json();
      setAdminChannels(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAdminChannels(); }, []);

  const handleDeleteChannel = async (id: string) => {
    if (!window.confirm('Supprimer ce canal ?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/channels/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAdminChannels();
      refreshChannels();
    } catch (err) { console.error(err); }
  };

  const handleChannelFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingChannelId ? `/api/channels/${editingChannelId}` : '/api/channels';
      const method = editingChannelId ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...channelForm, allowComments: true })
      });
      setShowChannelForm(false);
      setEditingChannelId(null);
      setChannelForm({ name: '', description: '', premium: false, subscriptionPrice: 0, avatar: '' });
      fetchAdminChannels();
      refreshChannels();
    } catch (err) { console.error(err); }
  };

  const handleEditChannel = (c: any) => {
    setChannelForm({ name: c.name, description: c.description, premium: c.premium, subscriptionPrice: c.subscriptionPrice || 0, avatar: c.avatar || '' });
    setEditingChannelId(c.id || c._id);
    setShowChannelForm(true);
  };


  // Real stats data with fallback to mock data
  const siteStatistics = realStats || {
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
              { id: 'transactions', label: 'Transactions', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg> },
              { id: 'support', label: 'Support', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg> },
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
                      {usersData.slice(0, 3).map(u => (
                        <li key={u.id} className="p-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-brand-navy-3/30 transition-colors rounded-xl">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green mr-3 shadow-inner">
                              <span className="text-xs font-bold">{u.username ? u.username.charAt(0).toUpperCase() : '?'}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-white">{u.username}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-brand-navy-3 px-2 py-1 rounded-full uppercase">{u.joinDate ? new Date(u.joinDate).toLocaleDateString() : 'N/A'}</span>
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
                    <input type="text" value={userSearchQuery} onChange={handleUserSearch} placeholder="Rechercher..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-brand-navy-3 border border-slate-200 dark:border-brand-slate rounded-lg text-xs focus:ring-2 focus:ring-brand-green/30 outline-none" />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <button onClick={loadUsers} className="p-2 rounded-lg bg-slate-100 dark:bg-brand-navy-3 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-brand-slate hover:bg-slate-200 dark:hover:bg-brand-navy-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </button>
                </div>
              </div>

              {isLoadingUsers ? (
                <div className="flex justify-center items-center py-12">
                  <svg className="animate-spin h-8 w-8 text-brand-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-brand-slate rounded-xl overflow-x-auto shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-brand-slate/30">
                    <thead className="bg-slate-50 dark:bg-brand-navy-3">
                      <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Utilisateur</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Solde</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-brand-navy-2 divide-y divide-slate-100 dark:divide-brand-slate/30">
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">Aucun utilisateur trouvé</td></tr>
                      ) : filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-brand-navy-3/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-9 h-9 rounded-full overflow-hidden bg-brand-green/10 flex items-center justify-center text-brand-green mr-3 border border-slate-200 dark:border-brand-slate shadow-inner">
                                {u.avatar ? <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" /> : <span className="text-xs font-black">{u.username ? u.username.charAt(0).toUpperCase() : '?'}</span>}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-slate-800 dark:text-white">{u.username}</p>
                                  {u.isPro && <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-brand-gold/10 text-brand-gold border border-brand-gold/20">Pro</span>}
                                  {u.role === 'admin' && <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">Admin</span>}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-green font-bold">{(u.walletBalance || 0).toFixed(2)}€</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${u.isBanned || u.status === 'banned' ? 'bg-red-500/10 text-red-500' : u.status === 'suspended' ? 'bg-orange-500/10 text-orange-500' : 'bg-brand-green/10 text-brand-green'}`}>
                              {u.isBanned || u.status === 'banned' ? 'Banni' : u.status === 'suspended' ? 'Suspendu' : 'Actif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right relative">
                            <button onClick={() => setUserActionMenuOpen(userActionMenuOpen === u.id ? null : u.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-brand-navy-3 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                            </button>
                            {userActionMenuOpen === u.id && (
                              <div className="absolute right-6 top-10 mt-1 w-48 bg-white dark:bg-brand-navy-3 rounded-xl shadow-lg z-50 border border-slate-200 dark:border-brand-slate py-1">
                                <button onClick={() => { handleEditUser(u); setUserActionMenuOpen(null); }} className="block w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-brand-navy-2">Éditer</button>
                                {!u.isPro && <button onClick={() => { handlePromoteUser(u.id); setUserActionMenuOpen(null); }} className="block w-full text-left px-4 py-2 text-xs font-bold text-brand-gold hover:bg-slate-50 dark:hover:bg-brand-navy-2">Promouvoir en Pro</button>}
                                {u.isBanned || u.status === 'banned' ? 
                                  <button onClick={() => { handleBanUserAction(u.id, false); setUserActionMenuOpen(null); }} className="block w-full text-left px-4 py-2 text-xs font-bold text-brand-green hover:bg-slate-50 dark:hover:bg-brand-navy-2">Réactiver</button>
                                  : <button onClick={() => { handleBanUserAction(u.id, true); setUserActionMenuOpen(null); }} className="block w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-slate-50 dark:hover:bg-brand-navy-2">Bannir</button>
                                }
                                <button onClick={() => { handleReplyToSupportMessage(u.id, u.username, u.isPro ? 'pro' : 'standard'); setUserActionMenuOpen(null); }} className="block w-full text-left px-4 py-2 text-xs font-bold text-blue-500 hover:bg-slate-50 dark:hover:bg-brand-navy-2">Envoyer message</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Transactions & Retraits</h3>
                <div className="flex bg-slate-100 dark:bg-brand-navy-3 p-1 rounded-lg">
                  <button onClick={() => setActiveTransactionsTab('historique')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTransactionsTab === 'historique' ? 'bg-white dark:bg-brand-navy-2 text-brand-green shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Historique</button>
                  <button onClick={() => setActiveTransactionsTab('retraits')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeTransactionsTab === 'retraits' ? 'bg-white dark:bg-brand-navy-2 text-brand-green shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                    Demandes de retrait
                    {withdrawalRequests.filter(w => w.status === 'pending').length > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{withdrawalRequests.filter(w => w.status === 'pending').length}</span>}
                  </button>
                </div>
              </div>

              {activeTransactionsTab === 'historique' && (
                <div className="border border-slate-200 dark:border-brand-slate rounded-xl overflow-x-auto shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-brand-slate/30">
                    <thead className="bg-slate-50 dark:bg-brand-navy-3">
                      <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Utilisateur</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Type</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Montant</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Statut</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-brand-navy-2 divide-y divide-slate-100 dark:divide-brand-slate/30">
                      {transactions.map(tr => (
                        <tr key={tr.id} className="hover:bg-slate-50 dark:hover:bg-brand-navy-3/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-white">{tr.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${tr.type === 'recharge' ? 'bg-brand-green/10 text-brand-green' : tr.type === 'withdrawal' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>{tr.type}</span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-black ${tr.type === 'recharge' ? 'text-brand-green' : 'text-red-500'}`}>{tr.type === 'recharge' ? '+' : '-'}{tr.amount.toFixed(2)}€</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${tr.status === 'completed' ? 'bg-brand-green/10 text-brand-green' : tr.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>{tr.status}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">{new Date(tr.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {transactions.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">Aucune transaction</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTransactionsTab === 'retraits' && (
                <div className="border border-slate-200 dark:border-brand-slate rounded-xl overflow-x-auto shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-brand-slate/30">
                    <thead className="bg-slate-50 dark:bg-brand-navy-3">
                      <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Utilisateur</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Montant</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Méthode</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-brand-navy-2 divide-y divide-slate-100 dark:divide-brand-slate/30">
                      {withdrawalRequests.map(w => (
                        <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-brand-navy-3/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-white">{w.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-800 dark:text-white">{w.amount.toFixed(2)}€</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-slate-100 dark:bg-brand-navy-1 text-slate-600 dark:text-slate-300">{w.method}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">{new Date(w.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {w.status === 'pending' ? (
                              <button onClick={() => { setSelectedWithdrawal(w); setShowWithdrawalDetailsModal(true); }} className="btn-primary text-xs px-3 py-1">Examiner</button>
                            ) : (
                              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${w.status === 'approved' ? 'bg-brand-green/10 text-brand-green' : 'bg-red-500/10 text-red-500'}`}>{w.status}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {withdrawalRequests.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">Aucune demande</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Support Client</h3>
              <div className="bg-white dark:bg-brand-navy-2 rounded-2xl border border-slate-200 dark:border-brand-slate overflow-hidden shadow-sm flex flex-col h-[500px]">
                <div className="p-4 border-b border-slate-200 dark:border-brand-slate flex gap-2">
                  <button onClick={() => setActiveUserTypeFilter('all')} className={`px-3 py-1 text-xs font-bold rounded-lg ${activeUserTypeFilter === 'all' ? 'bg-brand-green/10 text-brand-green' : 'bg-slate-100 dark:bg-brand-navy-3 text-slate-500'}`}>Tous</button>
                  <button onClick={() => setActiveUserTypeFilter('pro')} className={`px-3 py-1 text-xs font-bold rounded-lg ${activeUserTypeFilter === 'pro' ? 'bg-brand-gold/10 text-brand-gold' : 'bg-slate-100 dark:bg-brand-navy-3 text-slate-500'}`}>Pro</button>
                  <button onClick={() => setActiveUserTypeFilter('standard')} className={`px-3 py-1 text-xs font-bold rounded-lg ${activeUserTypeFilter === 'standard' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-100 dark:bg-brand-navy-3 text-slate-500'}`}>Standard</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {supportMessages.filter(m => activeUserTypeFilter === 'all' || m.userType === activeUserTypeFilter).map(msg => (
                    <div key={msg.id} className={`flex flex-col max-w-2xl ${msg.sender === 'agent' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{msg.sender === 'agent' ? 'Support (Vous)' : msg.username || 'Utilisateur'}</span>
                        <span className="text-[9px] text-slate-400">{msg.time}</span>
                        {msg.sender === 'user' && <button onClick={() => handleReplyToSupportMessage(msg.userId || '', msg.username || '', msg.userType)} className="text-[10px] text-brand-green hover:underline">Répondre</button>}
                      </div>
                      <div className={`p-3 rounded-2xl ${msg.sender === 'agent' ? 'bg-brand-green text-white rounded-tr-sm' : msg.sender === 'system' ? 'bg-slate-100 dark:bg-brand-navy-3 text-slate-600 dark:text-slate-300' : 'bg-slate-100 dark:bg-brand-navy-3 text-slate-800 dark:text-white rounded-tl-sm border border-slate-200 dark:border-brand-slate'}`}>
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                  {supportMessages.length === 0 && <div className="text-center py-10 text-slate-500">Aucun message de support</div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Gestion des canaux</h3>
                <button
                  onClick={() => { setShowChannelForm(!showChannelForm); setEditingChannelId(null); setChannelForm({ name: '', description: '', premium: false, subscriptionPrice: 0, avatar: '' }); }}
                  className="btn-primary px-4 py-2 text-xs font-bold shadow-lg shadow-brand-green/20"
                >
                  {showChannelForm ? 'Annuler' : '+ Nouveau canal'}
                </button>
              </div>

              {showChannelForm && (
                <form onSubmit={handleChannelFormSubmit} className="bg-slate-50 dark:bg-brand-navy-3 rounded-2xl border border-slate-100 dark:border-brand-slate/50 p-6 space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest text-brand-green">{editingChannelId ? 'Modifier le canal' : 'Nouveau canal'}</h4>

                  {/* Image upload */}
                  <div className="flex items-center gap-5">
                    <label className="cursor-pointer group" title="Choisir une image">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 dark:border-brand-slate/70 group-hover:border-brand-green overflow-hidden flex items-center justify-center bg-white dark:bg-brand-navy-2 transition-all">
                        {channelForm.avatar ? (
                          <img src={channelForm.avatar} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        )}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => setChannelForm({...channelForm, avatar: ev.target?.result as string});
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                    <div className="text-sm">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Image du canal</p>
                      <p className="text-xs text-slate-400 mt-0.5">Cliquez pour importer (JPG, PNG)</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nom du canal</label>
                      <input required type="text" placeholder="Ex: PronosBox Officiel" value={channelForm.name} onChange={e => setChannelForm({...channelForm, name: e.target.value})} className="w-full bg-white dark:bg-brand-navy-2 border border-slate-200 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Prix abonnement (€)</label>
                      <input type="number" step="0.01" value={channelForm.subscriptionPrice} onChange={e => setChannelForm({...channelForm, subscriptionPrice: parseFloat(e.target.value)||0})} className="w-full bg-white dark:bg-brand-navy-2 border border-slate-200 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Description</label>
                    <textarea required rows={2} placeholder="Description du canal..." value={channelForm.description} onChange={e => setChannelForm({...channelForm, description: e.target.value})} className="w-full bg-white dark:bg-brand-navy-2 border border-slate-200 dark:border-brand-slate/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all"></textarea>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="channel-premium" checked={channelForm.premium} onChange={e => setChannelForm({...channelForm, premium: e.target.checked})} className="w-4 h-4 accent-amber-500 cursor-pointer" />
                    <label htmlFor="channel-premium" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">Canal Premium (accès payant)</label>
                  </div>
                  <button type="submit" className="w-full btn-primary py-3 font-black uppercase tracking-widest rounded-xl">
                    {editingChannelId ? 'Mettre à jour' : 'Créer le canal'}
                  </button>
                </form>
              )}

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
                    {adminChannels.map((c: any) => (
                      <tr key={c.id || c._id} className="hover:bg-slate-50 dark:hover:bg-brand-navy-3/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {c.avatar ? (
                              <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-brand-slate" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-brand-green/10 flex items-center justify-center border border-slate-200 dark:border-brand-slate">
                                <span className="text-xs font-black text-brand-green">{c.name?.slice(0,2).toUpperCase()}</span>
                              </div>
                            )}
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{c.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-medium">{c.owner?.username || 'Admin'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${c.premium ? 'bg-amber-500/10 text-amber-500' : 'bg-brand-green/10 text-brand-green'}`}>
                            {c.premium ? 'Premium' : 'Gratuit'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-medium">{c.members?.length || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditChannel(c)} className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-500/10 transition-colors" title="Modifier">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            </button>
                            <button onClick={() => handleDeleteChannel(c.id || c._id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors" title="Supprimer">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {adminChannels.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Aucun canal créé</td></tr>
                    )}
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
        

      {/* Edit User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-navy-2 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-brand-slate animate-scale-up">
            <div className="p-4 border-b border-slate-200 dark:border-brand-slate flex justify-between items-center bg-slate-50 dark:bg-brand-navy-3">
              <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Modifier l'utilisateur</h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nom d'utilisateur</label>
                <input type="text" value={selectedUser.username} onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})} className="w-full bg-slate-50 dark:bg-brand-navy-3 border border-slate-200 dark:border-brand-slate rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email</label>
                <input type="email" value={selectedUser.email || ''} onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})} className="w-full bg-slate-50 dark:bg-brand-navy-3 border border-slate-200 dark:border-brand-slate rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Solde (€)</label>
                <input type="number" value={selectedUser.walletBalance || 0} onChange={(e) => setSelectedUser({...selectedUser, walletBalance: parseFloat(e.target.value)})} className="w-full bg-slate-50 dark:bg-brand-navy-3 border border-slate-200 dark:border-brand-slate rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none" />
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-brand-slate/50">
                <input type="checkbox" id="isPro" checked={selectedUser.isPro} onChange={(e) => setSelectedUser({...selectedUser, isPro: e.target.checked})} className="rounded text-brand-green focus:ring-brand-green" />
                <label htmlFor="isPro" className="text-sm font-bold text-slate-700 dark:text-slate-300">Compte Premium (Pro)</label>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-brand-navy-3 border-t border-slate-200 dark:border-brand-slate flex justify-end gap-3">
              <button onClick={() => setShowUserModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700">Annuler</button>
              <button onClick={handleSaveUserChanges} className="btn-primary px-6 py-2 text-xs">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Details Modal */}
      {showWithdrawalDetailsModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-navy-2 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-brand-slate animate-scale-up">
            <div className="p-4 border-b border-slate-200 dark:border-brand-slate flex justify-between items-center bg-slate-50 dark:bg-brand-navy-3">
              <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Détails du retrait</h3>
              <button onClick={() => setShowWithdrawalDetailsModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-brand-navy-3 rounded-xl border border-slate-200 dark:border-brand-slate">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Montant demandé</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{selectedWithdrawal.amount.toFixed(2)}€</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Méthode</p>
                  <span className="inline-block px-2 py-1 bg-slate-200 dark:bg-brand-navy-1 rounded-md text-xs font-bold">{selectedWithdrawal.method}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-brand-slate pb-2">Informations du compte</h4>
                {selectedWithdrawal.accountInfo ? (
                  <div className="bg-slate-50 dark:bg-brand-navy-3 p-4 rounded-xl space-y-2 text-sm border border-slate-200 dark:border-brand-slate">
                    {Object.entries(selectedWithdrawal.accountInfo).map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-500 capitalize">{key}:</span>
                        <span className="font-bold text-slate-800 dark:text-white">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Aucune information détaillée fournie.</p>
                )}
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-brand-navy-3 border-t border-slate-200 dark:border-brand-slate flex justify-end gap-3">
              <button onClick={() => handleProcessWithdrawal(selectedWithdrawal.id, false)} className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">Rejeter</button>
              <button onClick={() => handleProcessWithdrawal(selectedWithdrawal.id, true)} className="btn-primary px-6 py-2 text-xs">Approuver & Payer</button>
            </div>
          </div>
        </div>
      )}

      {/* Support Chat Reply Modal */}
      {showSupportChat && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-navy-2 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-brand-slate animate-scale-up flex flex-col h-[60vh]">
            <div className="p-4 border-b border-slate-200 dark:border-brand-slate flex justify-between items-center bg-slate-50 dark:bg-brand-navy-3">
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Support: {selectedUser.username}</h3>
                <p className="text-[10px] text-brand-green font-bold uppercase">{selectedUser.isPro ? 'Premium' : 'Standard'}</p>
              </div>
              <button onClick={() => setShowSupportChat(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-brand-navy-3/30 border border-slate-200 dark:border-brand-slate">
              {supportMessages.filter(m => m.userId === selectedUser.id || (!m.userId && m.sender === 'system')).map(msg => (
                <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.sender === 'agent' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                  <div className={`p-3 rounded-2xl ${msg.sender === 'agent' ? 'bg-brand-green text-white rounded-tr-sm' : 'bg-white dark:bg-brand-navy-2 text-slate-800 dark:text-white rounded-tl-sm shadow-sm'}`}>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1">{msg.time}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSupportMessageSubmit} className="p-4 bg-white dark:bg-brand-navy-2 border-t border-slate-200 dark:border-brand-slate flex gap-2">
              <input type="text" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} placeholder="Votre réponse..." className="flex-1 bg-slate-50 dark:bg-brand-navy-3 border border-slate-200 dark:border-brand-slate rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none" />
              <button type="submit" disabled={!supportMessage.trim()} className="btn-primary px-4 py-2 rounded-xl disabled:opacity-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
              </button>
            </form>
          </div>
        </div>
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
  const [selectedOptionId, setSelectedOptionId] = useState('V1');
  const [formData, setFormData] = useState({
    matchId: '',
    homeTeamName: '',
    awayTeamName: '',
    homeLogo: '',
    awayLogo: '',
    league: '',
    matchDate: '',
    freeExpectedResult: '',
    freeConfidence: 0,
    freeObservation: '',
    premiumExpectedResult: '',
    premiumOdds: 0,
    premiumConfidence: 0,
    premiumObservation: ''
  });

  // Verification State
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyingAll, setVerifyingAll] = useState(false);
  const [verifyResults, setVerifyResults] = useState<any[] | null>(null);

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
        homeLogo: formData.homeLogo,
        awayLogo: formData.awayLogo,
        league: formData.league,
        matchDate: formData.matchDate,
        freeExpectedResult: formData.freeExpectedResult,
        freeConfidence: formData.freeConfidence,
        freeObservation: formData.freeObservation,
        premiumExpectedResult: formData.premiumExpectedResult,
        premiumOdds: formData.premiumOdds,
        premiumConfidence: formData.premiumConfidence,
        premiumObservation: formData.premiumObservation
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
          matchId: '', homeTeamName: '', awayTeamName: '', homeLogo: '', awayLogo: '', league: '', matchDate: '',
          freeExpectedResult: '', freeConfidence: 0, freeObservation: '',
          premiumExpectedResult: '', premiumOdds: 0, premiumConfidence: 0, premiumObservation: ''
        });
        fetchPronos();
      } else {
        const errorData = await parseErrorResponse(res);
        alert(`Échec de l'enregistrement : ${errorData.error}${errorData.details ? ' (' + errorData.details + ')' : ''}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (prono: any) => {
    setFormData({
      matchId: prono.matchId?.toString() || '',
      homeTeamName: prono.homeTeamName || '',
      awayTeamName: prono.awayTeamName || '',
      homeLogo: prono.homeLogo || '',
      awayLogo: prono.awayLogo || '',
      league: prono.league || '',
      matchDate: prono.matchDate ? new Date(prono.matchDate).toISOString() : '',
      freeExpectedResult: prono.freeExpectedResult || '',
      freeConfidence: prono.freeConfidence || 0,
      freeObservation: prono.freeObservation || '',
      premiumExpectedResult: prono.premiumExpectedResult || '',
      premiumOdds: prono.premiumOdds || 0,
      premiumConfidence: prono.premiumConfidence || 0,
      premiumObservation: prono.premiumObservation || ''
    });
    setEditingId(prono._id || prono.id);
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

  const handleVerifySingle = async (id: string) => {
    setVerifyingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/pronos/${id}/verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        fetchPronos();
        if (data.needsManualReview) {
          alert(`Score enregistré (${data.prono?.actualResult}), mais le résultat n'a pas pu être déterminé automatiquement. Veuillez vérifier manuellement.`);
        }
      } else {
        const errorData = await parseErrorResponse(res);
        alert(`Erreur de vérification : ${errorData.error}${errorData.details ? ' (' + errorData.details + ')' : ''}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erreur de connexion');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleVerifyAll = async () => {
    setVerifyingAll(true);
    setVerifyResults(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/pronos/verify-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVerifyResults(data.results || []);
        fetchPronos();
      } else {
        const errorData = await parseErrorResponse(res);
        alert(`Erreur de vérification : ${errorData.error}${errorData.details ? ' (' + errorData.details + ')' : ''}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erreur de connexion');
    } finally {
      setVerifyingAll(false);
    }
  };

  const handleStatusOverride = async (id: string, type: 'free' | 'premium', status: string) => {
    try {
      const token = localStorage.getItem('token');
      const body = type === 'free' ? { freeStatus: status } : { premiumStatus: status };
      const res = await fetch(`/api/pronos/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        fetchPronos();
      } else {
        const errorData = await parseErrorResponse(res);
        alert(`Erreur : ${errorData.error}${errorData.details ? ' (' + errorData.details + ')' : ''}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Gestion des Pronostics</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleVerifyAll}
            disabled={verifyingAll}
            className={`py-2.5 px-5 text-sm font-bold rounded-xl transition-all shadow-lg ${
              verifyingAll 
                ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed' 
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
            }`}
            title="Vérifier automatiquement tous les pronostics dont le match est terminé"
          >
            {verifyingAll ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Vérification...
              </span>
            ) : 'Vérifier tout'}
          </button>
          <button 
            onClick={() => { setIsAdding(!isAdding); setEditingId(null); }} 
            className="w-full sm:w-auto btn-primary py-2.5 px-6 text-sm font-bold shadow-lg shadow-brand-green/20"
          >
            {isAdding ? 'Annuler' : 'Nouveau Pronostic'}
          </button>
        </div>
      </div>

      {/* Batch verification results toast */}
      {verifyResults && verifyResults.length > 0 && (
        <div className="bg-white dark:bg-brand-navy-2 rounded-xl border border-slate-200 dark:border-brand-slate p-4 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Résultats de la vérification</h4>
            <button onClick={() => setVerifyResults(null)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Fermer</button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
            {verifyResults.map((r: any, i: number) => (
              <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold ${
                r.status === 'won' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                r.status === 'lost' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                r.status === 'manual_review' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                r.status === 'skipped' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' :
                'bg-red-500/10 text-red-500'
              }`}>
                <span>{r.match}</span>
                <span className="uppercase">
                  {r.status === 'won' ? `✅ Gagné (${r.actualResult})` :
                   r.status === 'lost' ? `❌ Perdu (${r.actualResult})` :
                   r.status === 'manual_review' ? `⚠️ Revue manuelle (${r.actualResult})` :
                   r.status === 'skipped' ? `⏭️ ${r.reason}` :
                   `❗ ${r.reason}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
                        awayTeamName: match.teams.away.name,
                        homeLogo: match.teams.home.logo,
                        awayLogo: match.teams.away.logo,
                        league: match.league.name,
                        matchDate: match.fixture.date
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
          
          <div className="p-4 bg-slate-50 dark:bg-brand-navy-3 rounded-2xl border border-slate-100 dark:border-brand-slate/50 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-green flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                Section GRATUIT
              </h4>
              <span className="text-[10px] text-brand-green font-bold bg-brand-green/10 px-2 py-0.5 rounded border border-brand-green/20">
                6 Choix Automatisés (100% Vérifiables)
              </span>
            </div>

            {/* 1. 6-Option Selection Grid */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2">
                Sélection du pronostic
              </label>
              {(() => {
                const currentMatchTitle = (formData.homeTeamName && formData.awayTeamName) 
                  ? `${formData.homeTeamName} vs ${formData.awayTeamName}` 
                  : 'Équipe 1 vs Équipe 2';
                const opts6 = getProno6Options(currentMatchTitle);

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                    {opts6.map((opt) => {
                      const isSelected = selectedOptionId === opt.id || formData.freeExpectedResult === opt.fullPick;
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => {
                            setSelectedOptionId(opt.id);
                            setFormData(prev => ({ ...prev, freeExpectedResult: opt.fullPick }));
                          }}
                          className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-brand-green/15 border-brand-green shadow-sm'
                              : 'bg-white dark:bg-brand-navy-2 border-slate-200 dark:border-brand-slate/50 hover:border-brand-green/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider ${
                              isSelected ? 'bg-brand-green text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {opt.badge}
                            </span>
                            {isSelected && <span className="text-brand-green font-black text-xs">✓</span>}
                          </div>
                          <div className="text-[11px] font-bold leading-tight text-slate-800 dark:text-white truncate">
                            {opt.title}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              <div className="space-y-1">
                <label htmlFor="prono-freeExpectedResult" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Intitulé du pronostic
                </label>
                <input
                  id="prono-freeExpectedResult"
                  type="text"
                  placeholder="Ex: V1 - Victoire Real Madrid"
                  value={formData.freeExpectedResult}
                  onChange={e => setFormData({ ...formData, freeExpectedResult: e.target.value })}
                  className="w-full bg-white dark:bg-brand-navy-2 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all font-semibold text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* 2. Confiance (Stars + %) & Observation */}

            {/* 3. Confiance (Stars + %) & Observation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Confiance ({formData.freeConfidence <= 5 ? (formData.freeConfidence || 4) : Math.round(formData.freeConfidence / 20)}/5 ★ &nbsp;|&nbsp; {formData.freeConfidence <= 5 ? (formData.freeConfidence || 4) * 20 : formData.freeConfidence}%)
                </label>
                <div className="flex items-center gap-1.5 p-2.5 bg-white dark:bg-brand-navy-2 border border-slate-100 dark:border-brand-slate/50 rounded-xl">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const currentStars = formData.freeConfidence <= 5 
                      ? (formData.freeConfidence || 4)
                      : Math.round(formData.freeConfidence / 20);
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormData({ ...formData, freeConfidence: star * 20 })}
                        className={`text-2xl transition-transform hover:scale-125 ${
                          star <= currentStars ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      >
                        ★
                      </button>
                    );
                  })}
                  <span className="ml-auto text-xs font-black text-brand-green px-2.5 py-1 rounded-lg bg-brand-green/10">
                    {formData.freeConfidence <= 5 ? (formData.freeConfidence || 4) * 20 : formData.freeConfidence}%
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="prono-freeObservation" className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Courte Observation
                </label>
                <textarea
                  id="prono-freeObservation"
                  rows={2}
                  placeholder="Courte description pour le public gratuit..."
                  value={formData.freeObservation}
                  onChange={e => setFormData({ ...formData, freeObservation: e.target.value })}
                  className="w-full bg-white dark:bg-brand-navy-2 border border-slate-100 dark:border-brand-slate/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-green/30 outline-none transition-all resize-none text-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <h4 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l0 .001c.023.023.054.045.085.068.106.079.256.173.435.267.356.188.852.41 1.411.602 1.119.383 2.508.683 4.02.683a1 1 0 010 2c-1.282 0-2.483-.243-3.46-.566-.487-.16-.91-.341-1.25-.526a4.896 4.896 0 01-.482-.295c-.066-.046-.118-.088-.152-.116l-.014-.01a1 1 0 01-1.298-1.416l-.001-.001c-.023-.023-.054-.045-.085-.068-.106-.079-.256-.173-.435-.267-.356-.188-.852-.41-1.411-.602C10.51 3.559 9.121 3.259 7.61 3.259a1 1 0 010-2c1.282 0 2.483.243 3.46.566.487.16.91.341 1.25.526.178.098.342.198.482.295.066.046.118.088.152.116l.014.01A1 1 0 0112 2zM7.61 17.259c1.51 0 2.899-.3 4.019-.683.56-.192 1.055-.414 1.411-.602.179-.094.329-.188.435-.267.031-.023.062-.045.085-.068l.001-.001a1 1 0 011.416 1.416l-.01.014c-.028.034-.07.086-.116.152-.097.14-.197.304-.295.482-.185.34-.366.763-.526 1.25-.323.977-.566 2.178-.566 3.46a1 1 0 01-2 0c0-1.512-.3-2.901-.683-4.02-.192-.56-.414-1.055-.602-1.411a7.712 7.712 0 00-.267-.435c-.023-.031-.045-.062-.068-.085l-.001-.001a1 1 0 01-1.416-1.416l.01-.014c.034-.028.086-.07.152-.116.14-.097.304-.197.482-.295.34-.185.763-.366 1.25-.526.977-.323 2.178-.566 3.46-.566a1 1 0 010 2z" clipRule="evenodd" /></svg>
              Section PREMIUM
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-1.5">
                <label htmlFor="prono-premiumExpectedResult" className="block text-[10px] font-black uppercase text-amber-500/80 tracking-widest ml-1">Résultat Attendu</label>
                <input id="prono-premiumExpectedResult" type="text" placeholder="Ex: Alcaraz en 4 sets" value={formData.premiumExpectedResult} onChange={e => setFormData({...formData, premiumExpectedResult: e.target.value})} className="w-full bg-white dark:bg-brand-navy-2 border border-amber-500/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500/30 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="prono-premiumOdds" className="block text-[10px] font-black uppercase text-amber-500/80 tracking-widest ml-1">Cote</label>
                <input id="prono-premiumOdds" type="number" step="0.01" value={formData.premiumOdds} onChange={e => setFormData({...formData, premiumOdds: parseFloat(e.target.value) || 0})} className="w-full bg-white dark:bg-brand-navy-2 border border-amber-500/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500/30 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="prono-premiumConfidence" className="block text-[10px] font-black uppercase text-amber-500/80 tracking-widest ml-1">Confiance (%)</label>
                <input id="prono-premiumConfidence" type="number" min="0" max="100" value={formData.premiumConfidence} onChange={e => setFormData({...formData, premiumConfidence: parseInt(e.target.value) || 0})} className="w-full bg-white dark:bg-brand-navy-2 border border-amber-500/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500/30 outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500/80 ml-1 mb-1">Observation Détaillée</h4>
              <MarkdownEditor
                id="prono-premiumObservation"
                label="Observation Détaillée"
                placeholder="**Analyse** réservée aux membres Pro...&#10;- Argument 1&#10;- Argument 2"
                rows={5}
                value={formData.premiumObservation}
                onChange={val => setFormData({...formData, premiumObservation: val})}
              />
            </div>
          </div>

          <button type="submit" className="w-full btn-primary py-4 font-black uppercase tracking-widest shadow-xl shadow-brand-green/30 transition-all hover:scale-[1.01] active:scale-[0.99] rounded-2xl">
            {editingId ? 'Mettre à jour le Pronostic' : 'Publier le Pronostic'}
          </button>
        </form>
      )}

      <div className="bg-white dark:bg-brand-navy-2 rounded-xl border border-slate-200 dark:border-brand-slate overflow-x-auto shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-brand-slate/30">
          <thead className="bg-slate-50 dark:bg-brand-navy-3">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Match</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Choix</th>
              <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Statut</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-brand-navy-2 divide-y divide-slate-100 dark:divide-brand-slate/30">
            {pronos.map((p: any) => (
              <tr key={p._id || p.id} className="hover:bg-slate-50 dark:hover:bg-brand-navy-3/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{p.homeTeamName} vs {p.awayTeamName}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">ID Match: {p.matchId}</span>
                    {p.actualResult && (
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">Score: {p.actualResult}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {p.freeExpectedResult && (
                      <span className="px-2 py-0.5 rounded text-brand-green bg-brand-green/10 text-[10px] font-black uppercase inline-block w-max">
                        Gratuit: {p.freeExpectedResult} ({p.freeConfidence}%)
                      </span>
                    )}
                    {p.premiumExpectedResult && (
                      <span className="px-2 py-0.5 rounded text-amber-500 bg-amber-500/10 text-[10px] font-black uppercase inline-block w-max">
                        Premium: {p.premiumExpectedResult} ({p.premiumConfidence}%)
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex flex-col items-center gap-2">
                    {/* Free Status */}
                    {p.freeExpectedResult && (
                      <div className="flex items-center gap-2 w-full max-w-[120px]">
                        <span className="text-[9px] font-black uppercase text-slate-400 w-8 text-left">GRATUIT</span>
                        <select
                          value={p.freeStatus || 'pending'}
                          onChange={(e) => handleStatusOverride(p._id || p.id, 'free', e.target.value)}
                          className={`flex-1 text-[9px] border rounded-lg px-1.5 py-1 outline-none cursor-pointer font-bold transition-colors ${
                            p.freeStatus === 'won' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                            p.freeStatus === 'lost' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                            'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          }`}
                          title="Statut Gratuit"
                        >
                          <option value="pending">⏳ Attente</option>
                          <option value="won">✅ Gagné</option>
                          <option value="lost">❌ Perdu</option>
                        </select>
                      </div>
                    )}
                    
                    {/* Premium Status */}
                    {p.premiumExpectedResult && (
                      <div className="flex items-center gap-2 w-full max-w-[120px]">
                        <span className="text-[9px] font-black uppercase text-slate-400 w-8 text-left">PREMIUM</span>
                        <select
                          value={p.premiumStatus || 'pending'}
                          onChange={(e) => handleStatusOverride(p._id || p.id, 'premium', e.target.value)}
                          className={`flex-1 text-[9px] border rounded-lg px-1.5 py-1 outline-none cursor-pointer font-bold transition-colors ${
                            p.premiumStatus === 'won' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                            p.premiumStatus === 'lost' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                            'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          }`}
                          title="Statut Premium"
                        >
                          <option value="pending">⏳ Attente</option>
                          <option value="won">✅ Gagné</option>
                          <option value="lost">❌ Perdu</option>
                        </select>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    {(p.status === 'pending' || p.freeStatus === 'pending' || p.premiumStatus === 'pending') && (
                      <button 
                        onClick={() => handleVerifySingle(p._id || p.id)} 
                        disabled={verifyingId === (p._id || p.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          verifyingId === (p._id || p.id)
                            ? 'text-slate-400 cursor-not-allowed'
                            : 'text-amber-500 hover:bg-amber-500/10'
                        }`}
                        title="Vérifier ce pronostic"
                      >
                        {verifyingId === (p._id || p.id) ? (
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        )}
                      </button>
                    )}
                    <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-500/10 transition-colors" title="Modifier">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(p._id || p.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors" title="Supprimer">
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