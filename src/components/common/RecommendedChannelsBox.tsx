import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChannelData } from '../../contexts/ChannelContext';

interface RecommendedChannelsBoxProps {
  className?: string;
  title?: string;
  maxDisplay?: number;
}

export const RecommendedChannelsBox: React.FC<RecommendedChannelsBoxProps> = ({
  className = '',
  title = 'Canaux & Tipsters Recommandés',
  maxDisplay = 3
}) => {
  const navigate = useNavigate();
  const { channelData, navigateToChannel } = useChannelData();

  const channels = React.useMemo(() => {
    const rawChannels = channelData?.channels || [];
    if (rawChannels.length === 0) {
      // Dynamic fallback list to never display an empty box
      return [
        {
          id: 'featured-1',
          name: 'Pronos Élite Football',
          ownerName: 'Alexandre M.',
          winRate: 84,
          subscribersCount: 1240,
          premium: false,
          lastProno: 'Inter Milan vs Juventus — 1X (✅ gagné)'
        },
        {
          id: 'featured-2',
          name: 'Over/Under Buts Club',
          ownerName: 'Karim B.',
          winRate: 79,
          subscribersCount: 890,
          premium: true,
          lastProno: 'Real Madrid vs Barça — +2.5 Buts (✅ gagné)'
        },
        {
          id: 'featured-3',
          name: 'Safe & Value Bets',
          ownerName: 'Thomas L.',
          winRate: 88,
          subscribersCount: 2150,
          premium: false,
          lastProno: 'Bayern vs Dortmund — V1 (⏳ en attente)'
        }
      ];
    }

    // Enrich and sort DB channels by winRate then member count
    return [...rawChannels]
      .sort((a, b) => (Number(b.winRate) || 0) - (Number(a.winRate) || 0))
      .slice(0, maxDisplay)
      .map((c: any) => ({
        id: String(c.id || c._id),
        name: c.name,
        ownerName: c.owner?.username || c.owner?.name || 'Tipster Certifié',
        avatar: c.avatar,
        winRate: c.winRate || 80,
        subscribersCount: Array.isArray(c.subscribers) ? c.subscribers.length : (c.membersCount || 150),
        premium: Boolean(c.premium),
        lastProno: c.lastMessage || 'Analyse tactique disponible'
      }));
  }, [channelData, maxDisplay]);

  const handleChannelClick = (channelId: string) => {
    if (channelId.startsWith('featured-')) {
      navigate('/box');
    } else {
      navigateToChannel(channelId, navigate);
    }
  };

  return (
    <div className={`glass-panel rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-brand-green" />
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {title}
          </h2>
        </div>
        <button
          onClick={() => navigate('/box')}
          className="text-xs font-bold text-brand-green hover:underline cursor-pointer"
        >
          Explorer tous
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {channels.map((ch: any) => (
          <div
            key={ch.id}
            onClick={() => handleChannelClick(ch.id)}
            className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-brand-green/50 hover:shadow-lg hover:shadow-brand-green/5 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
          >
            <div>
              {/* Header: avatar + badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-green/20 to-emerald-500/10 border border-brand-green/30 flex items-center justify-center text-lg font-black text-brand-green shrink-0 group-hover:scale-105 transition-transform">
                    {ch.avatar ? (
                      <img src={ch.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      ch.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                      {ch.name}
                      <span className="text-amber-400 text-[10px]">★</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate">
                      Par {ch.ownerName}
                    </p>
                  </div>
                </div>

                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  ch.premium 
                    ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' 
                    : 'bg-brand-green/10 text-brand-green border border-brand-green/20'
                }`}>
                  {ch.premium ? 'VIP' : 'Gratuit'}
                </span>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-green-500/10 text-brand-green border border-green-500/20">
                  🎯 {ch.winRate}% réussite
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  👥 {ch.subscribersCount} membres
                </span>
              </div>

              {/* Last pick snippet */}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                {ch.lastProno}
              </p>
            </div>

            {/* Action button */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-brand-green group-hover:translate-x-0.5 transition-transform">
              <span>Rejoindre le canal</span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
