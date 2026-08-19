import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChannelData } from '../contexts/ChannelContext';
import { Channel } from '../types/channel';

const Channels = () => {
  const { user, isTipster: isTipsterAuth } = useAuth();
  const navigate = useNavigate();
  const { channelData, navigateToChannel, addChannel } = useChannelData();

  const [activeTab, setActiveTab] = useState('all');

  // Joined channels (persisted in localStorage for optimistic UI)
  const [joinedChannels, setJoinedChannels] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('joinedChannels') || '[]'); }
    catch { return []; }
  });

  // Pinned channels (persisted in localStorage)
  const [pinnedChannels, setPinnedChannels] = useState<(string | number)[]>(() => {
    try { return JSON.parse(localStorage.getItem('pinnedChannels') || '[]'); }
    catch { return []; }
  });

  // Create channel modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [newChannelIsPremium, setNewChannelIsPremium] = useState(false);
  const [newChannelAvatar, setNewChannelAvatar] = useState('');
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);

  // Derived permission flags
  const isTipsterUser = isTipsterAuth || user?.accountType === 'tipster' || user?.isPro || false;
  const isAdminUser = user?.role === 'admin' || false;
  const canCreateChannel = isTipsterUser || isAdminUser;

  // ─── Map channels from context ──────────────────────────────────────
  const channels: Channel[] = (channelData?.channels || []).map((ch) => ({
    ...ch,
    joined: joinedChannels.includes(String(ch.id)) || ch.joined || false,
  }));

  // ─── Filter & sort ──────────────────────────────────────────────────
  const filteredChannels = channels
    .filter((ch) => {
      switch (activeTab) {
        case 'premium': return ch.premium;
        case 'free': return !ch.premium;
        case 'top_rated': return (ch.winRate || 0) >= 50;
        case 'joined': return ch.joined;
        case 'pinned': return pinnedChannels.includes(ch.id);
        case 'mine': return ch.owner?.id === user?.id;
        default: return true; // 'all'
      }
    })
    .sort((a, b) => {
      // Pinned channels always first
      const aPinned = pinnedChannels.includes(a.id) ? 1 : 0;
      const bPinned = pinnedChannels.includes(b.id) ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      // Then sort by winRate descending (null = no evaluated pronos → last)
      const aRate = a.winRate ?? -1;
      const bRate = b.winRate ?? -1;
      return bRate - aRate;
    });

  // ─── Handlers ───────────────────────────────────────────────────────
  const handleChannelClick = (channelId: string | number) => {
    navigateToChannel(String(channelId), navigate);
  };

  const handleJoinChannel = async (channelId: string | number) => {
    const idStr = String(channelId);
    setJoinedChannels((prev) => {
      const updated = [...prev, idStr];
      localStorage.setItem('joinedChannels', JSON.stringify(updated));
      return updated;
    });
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/channels/${channelId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Erreur lors de la jonction au canal:', err);
    }
  };

  const handleTogglePin = (channelId: string | number) => {
    setPinnedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    setIsCreatingChannel(true);
    try {
      const newChannelId = await addChannel({
        name: newChannelName,
        description: newChannelDescription,
        premium: newChannelIsPremium,
        avatar: newChannelAvatar || 'https://via.placeholder.com/150',
      });
      setNewChannelName('');
      setNewChannelDescription('');
      setNewChannelIsPremium(false);
      setNewChannelAvatar('');
      setShowCreateModal(false);
      setTimeout(() => {
        if (newChannelId) navigateToChannel(newChannelId, navigate);
      }, 500);
    } catch (err) {
      console.error('Erreur lors de la création du canal:', err);
    } finally {
      setIsCreatingChannel(false);
    }
  };

  // Persist pinned channels
  useEffect(() => {
    localStorage.setItem('pinnedChannels', JSON.stringify(pinnedChannels));
  }, [pinnedChannels]);

  // ─── Tab definitions ────────────────────────────────────────────────
  const tabs = [
    { key: 'all', label: 'Tous' },
    { key: 'premium', label: 'Premium' },
    { key: 'free', label: 'Gratuits' },
    { key: 'top_rated', label: 'Les mieux notés' },
    { key: 'joined', label: 'Rejoints' },
    { key: 'pinned', label: 'Épinglés' },
    { key: 'mine', label: 'Mes canaux' },
  ];

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-2.5 sm:px-4 py-6 max-w-3xl">

      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Canaux
        </h2>
        {canCreateChannel && (
          <button
            className="p-2.5 rounded-xl bg-brand-green hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all"
            onClick={() => setShowCreateModal(true)}
            title="Créer un nouveau canal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Filter Tabs ───────────────────────────────────────────── */}
      <div className="mb-5 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-2 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-brand-green text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-200 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Channel Cards ─────────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredChannels.length === 0 && (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm font-medium">Aucun canal trouvé</p>
            <p className="text-xs mt-1">Essayez un autre filtre ou créez votre propre canal.</p>
          </div>
        )}

        {filteredChannels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            isPinned={pinnedChannels.includes(channel.id)}
            onNavigate={() => handleChannelClick(channel.id)}
            onJoin={() => handleJoinChannel(channel.id)}
            onTogglePin={() => handleTogglePin(channel.id)}
          />
        ))}
      </div>

      {/* ── Create Channel Modal ──────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-md border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Créer un nouveau canal
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nom du canal <span className="text-brand-green">*</span>
                </label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  placeholder="Ex: Pronostics Ligue 1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  placeholder="Décrivez votre canal en quelques mots..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Image du canal
                </label>
                <div className="flex items-center gap-3">
                  {newChannelAvatar && (
                    <img src={newChannelAvatar} alt="Aperçu" className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 dark:border-slate-600" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setNewChannelAvatar(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-green/10 file:text-brand-green hover:file:bg-brand-green/20 transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="premium-channel"
                  checked={newChannelIsPremium}
                  onChange={(e) => setNewChannelIsPremium(e.target.checked)}
                  className="h-4 w-4 accent-brand-green rounded border-slate-400"
                />
                <label htmlFor="premium-channel" className="text-sm text-slate-700 dark:text-slate-300">
                  Canal premium (contenu payant)
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                disabled={isCreatingChannel}
              >
                Annuler
              </button>
              <button
                onClick={handleCreateChannel}
                className="px-4 py-2 text-sm font-bold text-white bg-brand-green hover:bg-emerald-600 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all"
                disabled={isCreatingChannel || !newChannelName.trim()}
              >
                {isCreatingChannel ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Création...
                  </>
                ) : (
                  'Créer le canal'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Channel Card Component ───────────────────────────────────────────
interface ChannelCardProps {
  channel: Channel;
  isPinned: boolean;
  onNavigate: () => void;
  onJoin: () => void;
  onTogglePin: () => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isPinned,
  onNavigate,
  onJoin,
  onTogglePin,
}) => {
  const hasWinRate = channel.winRate !== null && channel.winRate !== undefined && !isNaN(Number(channel.winRate));
  const rateValue = hasWinRate ? Number(channel.winRate) : null;
  const winRateColor = (rateValue || 0) >= 50 ? 'text-brand-green' : 'text-amber-500';

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden p-4 sm:p-5 shadow-lg ${
        channel.premium
          ? 'bg-gradient-to-b from-amber-950/20 via-[#131724] to-[#0D111D] border-amber-500/35 hover:border-amber-500/60 shadow-amber-500/5'
          : 'bg-[#0D111D]/95 border-slate-800/90 hover:border-slate-700/90 shadow-slate-950/50'
      }`}
      onClick={onNavigate}
    >
      {/* ── Top Header: Avatar + Channel Info + Win Rate ─────────── */}
      <div className="flex items-start gap-3 sm:gap-3.5">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-700/80 bg-slate-850 shadow-inner">
          {channel.avatar ? (
            <img
              src={channel.avatar}
              alt={channel.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-green text-lg font-bold">
              {channel.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name + Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sm sm:text-base text-white truncate">
              {channel.name}
            </h3>

            {/* Premium / Gratuit badge */}
            {channel.premium ? (
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                ★ PREMIUM
              </span>
            ) : (
              <span className="inline-flex items-center bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                GRATUIT
              </span>
            )}

            {/* Pin indicator */}
            {isPinned && (
              <span className="text-amber-400 shrink-0" title="Épinglé">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </span>
            )}
          </div>

          {/* Members + Owner */}
          <p className="text-xs text-slate-400 mt-1">
            {(channel.members || 0).toLocaleString()} membres
            {channel.owner?.username && (
              <> · <span className="text-slate-300 font-medium">{channel.owner.username}</span></>
            )}
          </p>
        </div>

        {/* Win Rate (right side) */}
        {hasWinRate && (
          <div className="text-right shrink-0 pl-2">
            <span className={`text-xl sm:text-2xl font-black tabular-nums ${winRateColor}`}>
              {rateValue}%
            </span>
            <p className="text-[10px] text-slate-400 -mt-0.5 font-medium">réussite</p>
          </div>
        )}
      </div>

      {/* ── Middle: Last Won Prono Preview ───────────────────── */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        {channel.lastWonProno ? (
          <p className="flex items-center gap-1.5 text-slate-300">
            <span className="text-brand-green font-bold">✓</span>
            <span>
              Dernier prono gagné · <strong className="text-white font-semibold">{channel.lastWonProno.home} vs {channel.lastWonProno.away}</strong>
              {channel.lastWonProno.result && <> — <span className="text-emerald-300 font-medium">{channel.lastWonProno.result}</span></>}
            </span>
          </p>
        ) : channel.lastMessage && (channel.lastMessage.includes(' vs ') || channel.lastMessage.includes('PRONOSTIC')) ? (
          <p className="flex items-center gap-1.5 text-slate-300 truncate">
            <span className="text-brand-green font-bold">✓</span>
            <span className="truncate">{channel.lastMessage}</span>
          </p>
        ) : channel.lastMessage ? (
          <p className="flex items-center gap-1.5 text-slate-300 truncate">
            <span className="text-slate-400">💬</span>
            <span className="truncate">{channel.lastMessage}</span>
          </p>
        ) : (
          <p className="text-slate-500 italic">
            Aucun message publié pour le moment
          </p>
        )}
      </div>

      {/* ── Bottom: Action Button + Pin Toggle ───────────────── */}
      <div className="mt-3.5 flex items-center gap-2">
        {channel.joined ? (
          <button
            className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Membre — Accéder
          </button>
        ) : channel.premium ? (
          <button
            className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-[#F59E0B] hover:bg-[#D97706] shadow-md shadow-amber-500/20 transition-all flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onJoin();
            }}
          >
            Rejoindre — {(channel.price || 0) > 0 ? `${channel.price}€/mois` : 'Premium'}
          </button>
        ) : (
          <button
            className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-green hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onJoin();
            }}
          >
            Rejoindre
          </button>
        )}

        {/* Pin toggle */}
        <button
          className={`p-2.5 rounded-xl border transition-all shrink-0 ${
            isPinned
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          title={isPinned ? 'Désépingler' : 'Épingler'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={isPinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Channels;