import React from 'react';
import { Channel } from '../../types/chat';

interface ChannelListItemProps {
  channel: Channel;
  currentUserId: string | number;
  isPro: boolean;
  onOpen: (id: string | number) => void;
  onTogglePin: (id: string | number) => void;
  onJoin: (channel: Channel) => void;
  isProcessingJoin: boolean;
  isEditing: boolean;
  onToggleEdit: (id: string | number) => void;
  channelFeatures: Record<string | number, unknown>;
  onFeatureToggle: (id: string | number, feature: string) => void;
}

export const ChannelListItem: React.FC<ChannelListItemProps> = ({
  channel,
  currentUserId,
  isPro,
  onOpen,
  onTogglePin,
  onJoin,
  isProcessingJoin,
  isEditing,
  onToggleEdit,
  channelFeatures,
  onFeatureToggle
}) => {
  const [showEnlargedAvatar, setShowEnlargedAvatar] = React.useState(false);
  const features = (channelFeatures[channel.id] || {}) as Record<string, boolean>;
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
      onClick={() => onOpen(channel.id)}
    >
      {/* ── Top Header: Avatar + Channel Info + Win Rate ─────────── */}
      <div className="flex items-start gap-3 sm:gap-3.5">
        {/* Avatar */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowEnlargedAvatar(true);
          }}
          className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-700/80 bg-slate-850 cursor-pointer hover:opacity-90 transition-opacity shadow-inner"
          title="Agrandir la photo"
        >
          <img
            src={channel.avatar}
            alt={channel.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=10b981&color=fff&size=512`;
            }}
          />
        </div>

        {/* Name + Badges + Subtitle */}
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

            {channel.owner && String(channel.owner.id) === String(currentUserId) && (
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0">
                Propriétaire
              </span>
            )}

            {/* Pin badge indicator */}
            {channel.pinned && (
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

        {/* Win Rate (Top Right) */}
        {hasWinRate && (
          <div className="text-right shrink-0 pl-2">
            <span className={`text-xl sm:text-2xl font-black tabular-nums ${winRateColor}`}>
              {rateValue}%
            </span>
            <p className="text-[10px] text-slate-400 -mt-0.5 font-medium">réussite</p>
          </div>
        )}
      </div>

      {/* ── Middle: Last Won Prono or Last Message ───────────────────── */}
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

      {/* ── Bottom: Action Button + Pin Toggle ───────────────────── */}
      <div className="mt-3.5 flex items-center gap-2">
        {channel.joined ? (
          <button
            className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(channel.id);
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
              onJoin(channel);
            }}
            disabled={isProcessingJoin}
          >
            {isProcessingJoin ? 'Traitement...' : `Rejoindre — ${(channel.price || 0) > 0 ? `${channel.price}€/mois` : 'Premium'}`}
          </button>
        ) : (
          <button
            className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-green hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onJoin(channel);
            }}
            disabled={isProcessingJoin}
          >
            {isProcessingJoin ? 'Traitement...' : 'Rejoindre'}
          </button>
        )}

        {/* Pin toggle button */}
        <button
          className={`p-2.5 rounded-xl border transition-all shrink-0 ${
            channel.pinned
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(channel.id);
          }}
          title={channel.pinned ? 'Désépingler' : 'Épingler'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={channel.pinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      {/* Enlarged Avatar Modal */}
      {showEnlargedAvatar && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm cursor-default"
          onClick={(e) => {
            e.stopPropagation();
            setShowEnlargedAvatar(false);
          }}
        >
          <div
            className="relative max-w-sm w-full bg-slate-900 rounded-2xl overflow-hidden p-3 shadow-2xl border border-slate-800 flex flex-col items-center animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEnlargedAvatar(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full z-10 transition"
              title="Fermer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-full aspect-square rounded-xl overflow-hidden shadow-inner mb-3 bg-slate-950 flex items-center justify-center">
              <img
                src={channel.avatar}
                alt={channel.name}
                className="max-w-full max-h-full object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=10b981&color=fff&size=512`;
                }}
              />
            </div>
            <div className="text-center py-2 px-4 w-full">
              <h3 className="text-lg font-bold text-white truncate">
                {channel.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {(channel.members || 0).toLocaleString()} membres
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
