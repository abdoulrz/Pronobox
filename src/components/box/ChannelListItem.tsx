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
      className={`rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden p-3.5 sm:p-5 shadow-lg ${
        channel.premium
          ? 'bg-gradient-to-b from-amber-950/20 via-[#131724] to-[#0D111D] border-amber-500/35 hover:border-amber-500/60 shadow-amber-500/5'
          : 'bg-[#0D111D]/95 border-slate-800/90 hover:border-slate-700/90 shadow-slate-950/50'
      }`}
      onClick={() => onOpen(channel.id)}
    >
      {/* ── Row 1: Top Header (Avatar + Name & Badges + Win Rate / Pas encore certifié) ── */}
      <div className="flex items-start justify-between gap-2.5 sm:gap-3.5">
        {/* Left: Avatar + Title & Meta */}
        <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          {/* Avatar */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowEnlargedAvatar(true);
            }}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border border-slate-700/80 bg-slate-850 cursor-pointer hover:opacity-90 transition-opacity shadow-inner"
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
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-[140px] xs:max-w-[170px] sm:max-w-none">
                {channel.name}
              </h3>

              {/* Gold Star ★ for Certified Tipster */}
              {channel.owner?.isCertified && (
                <span className="text-amber-400 text-sm font-bold shrink-0" title="Tipster Certifié">
                  ★
                </span>
              )}

              {/* Blue OFFICIEL badge for Admin */}
              {channel.owner?.role === 'admin' && (
                <span className="inline-flex items-center bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                  OFFICIEL
                </span>
              )}

              {/* Premium / Gratuit badge */}
              {channel.premium ? (
                <span className="inline-flex items-center bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                  PREMIUM
                </span>
              ) : (
                <span className="inline-flex items-center bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                  GRATUIT
                </span>
              )}

              {/* Propriétaire badge */}
              {channel.owner && String(channel.owner.id) === String(currentUserId) && (
                <span className="bg-slate-800/90 text-slate-300 border border-slate-700/80 text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0">
                  Propriétaire
                </span>
              )}
            </div>

            {/* Members + Owner */}
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 truncate">
              {(channel.members || 0).toLocaleString()} membres
              {channel.owner?.username && (
                <> · <span className="text-slate-300 font-medium">{channel.owner.username}</span></>
              )}
            </p>
          </div>
        </div>

        {/* Right: Win Rate or Pas encore certifié */}
        <div className="shrink-0 pl-1 text-right">
          {hasWinRate ? (
            <div>
              <span className={`text-base sm:text-2xl font-black tabular-nums ${winRateColor}`}>
                {rateValue}%
              </span>
              <p className="text-[8px] sm:text-[10px] text-slate-400 -mt-0.5 font-medium">réussite</p>
            </div>
          ) : (
            <div className="leading-tight">
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium block">
                Pas encore<br />certifié
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Middle Prono Preview ───────────────────── */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs text-slate-400">
        {(() => {
          const cleanTeamName = (name: string): string => {
            if (!name) return '';
            return name
              .replace(/^.*?RÉSULTAT\s+DU\s+PRONOSTIC\s*:\s*/gi, '')
              .replace(/^.*?PRONOSTIC\s*:\s*/gi, '')
              .replace(/[⚽🎯🏆💡]/g, '')
              .split('(')[0]
              .trim();
          };

          // Priority 1: channel.lastProno from API
          if (channel.lastProno) {
            const home = cleanTeamName(channel.lastProno.home);
            const away = cleanTeamName(channel.lastProno.away);
            const isWon = channel.lastProno.status === 'won';
            const isLost = channel.lastProno.status === 'lost';
            const icon = isWon ? '✓' : isLost ? '✗' : '⏳';
            const iconColor = isWon ? 'text-emerald-400' : isLost ? 'text-rose-400' : 'text-amber-400';
            const rawPred = channel.lastProno.prediction || '';
            const prediction = isWon ? `Victoire ${home}` : isLost ? 'Défaite' : cleanTeamName(rawPred);

            return (
              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm truncate">
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`shrink-0 font-bold ${iconColor}`}>{icon}</span>
                  <span className="truncate">
                    <strong className="text-white font-semibold">{home} vs {away}</strong>
                    {prediction && (
                      <span className="text-slate-300 font-normal"> — {prediction}</span>
                    )}
                  </span>
                </div>
                {channel.lastProno.score && (
                  <span className="shrink-0 font-bold text-emerald-400 text-xs sm:text-sm ml-2">
                    {channel.lastProno.score}
                  </span>
                )}
              </div>
            );
          }

          // Priority 2: channel.lastWonProno
          if (channel.lastWonProno) {
            const home = cleanTeamName(channel.lastWonProno.home);
            const away = cleanTeamName(channel.lastWonProno.away);
            const score = channel.lastWonProno.result && channel.lastWonProno.result !== 'Gagné' ? channel.lastWonProno.result : '';

            return (
              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm truncate">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="shrink-0 font-bold text-emerald-400">✓</span>
                  <span className="truncate">
                    <strong className="text-white font-semibold">{home} vs {away}</strong>
                    <span className="text-slate-300 font-normal"> — Victoire {home}</span>
                  </span>
                </div>
                {score && (
                  <span className="shrink-0 font-bold text-emerald-400 text-xs sm:text-sm ml-2">
                    {score}
                  </span>
                )}
              </div>
            );
          }

          // Priority 3: Fallback parsing from lastMessage
          const msg = channel.lastMessage || '';
          if (msg.includes(' vs ') || msg.includes('PRONOSTIC')) {
            const isWon = msg.includes('✅') || msg.toLowerCase().includes('gagné') || msg.toLowerCase().includes('victoire');
            const isLost = msg.includes('❌') || msg.toLowerCase().includes('perdu') || msg.toLowerCase().includes('défaite');
            const icon = isWon ? '✓' : isLost ? '✗' : '⏳';
            const iconColor = isWon ? 'text-emerald-400' : isLost ? 'text-rose-400' : 'text-amber-400';

            let home = '';
            let away = '';
            if (msg.includes(' vs ')) {
              const vsParts = msg.split(' vs ');
              const rawA = vsParts[0].split(':').pop() || vsParts[0];
              home = cleanTeamName(rawA.split('\n').pop() || '');
              away = cleanTeamName(vsParts[1].split(/\s{2,}|\n|—|-|\(/)[0] || '');
            }

            const prediction = isWon ? `Victoire ${home}` : isLost ? 'Défaite' : 'En attente';

            return (
              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm truncate">
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`shrink-0 font-bold ${iconColor}`}>{icon}</span>
                  <span className="truncate">
                    <strong className="text-white font-semibold">{home} vs {away}</strong>
                    <span className="text-slate-300 font-normal"> — {prediction}</span>
                  </span>
                </div>
              </div>
            );
          }

          if (msg) {
            return (
              <p className="flex items-center gap-1.5 text-slate-300 truncate">
                <span className="shrink-0 text-slate-400">💬</span>
                <span className="truncate">{msg}</span>
              </p>
            );
          }

          return (
            <p className="text-slate-500 italic">
              Aucun pronostic publié pour le moment
            </p>
          );
        })()}
      </div>

      {/* ── Row 3: Bottom Action Button (Full Width) + Pin ─────────────── */}
      <div className="mt-3 flex items-center gap-2">
        {/* Main Action Button */}
        {channel.joined ? (
          <button
            className="flex-1 h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-950/25 border border-emerald-500/50 hover:bg-emerald-950/45 hover:border-emerald-500 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(channel.id);
            }}
          >
            <span>✓ Membre — Accéder</span>
          </button>
        ) : channel.premium ? (
          <button
            className="flex-1 h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-[#F59E0B] hover:bg-[#D97706] shadow-md shadow-amber-500/20 transition-all flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onJoin(channel);
            }}
            disabled={isProcessingJoin}
          >
            <span>{isProcessingJoin ? '...' : `Rejoindre${(channel.price || 0) > 0 ? ` · ${channel.price}€` : ''}`}</span>
          </button>
        ) : (
          <button
            className="flex-1 h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-green hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onJoin(channel);
            }}
            disabled={isProcessingJoin}
          >
            <span>{isProcessingJoin ? '...' : 'Rejoindre'}</span>
          </button>
        )}

        {/* Pin Button */}
        <button
          className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl border transition-all shrink-0 flex items-center justify-center ${
            channel.pinned
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-400'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30'
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
