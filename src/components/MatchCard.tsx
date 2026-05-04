import React from 'react';

interface Match {
  id: number;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  date: string;
  stadium: string;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  homeTeamLogo: string;
  awayTeamLogo: string;
}

interface MatchCardProps {
  match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Live':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-brand-red/15 text-brand-red border border-brand-red/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red inline-block" />
            Live
          </span>
        );
      case 'FT':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
            Terminé
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700">
            {formatTime(match.date)}
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-brand-navy-3 rounded-xl border border-slate-200 dark:border-brand-slate shadow-sm hover:shadow-md dark:hover:border-brand-green/30 transition-all duration-200">

      {/* Header: league + status + stadium */}
      <div className="flex justify-between items-center px-4 py-2.5 border-b border-slate-100 dark:border-brand-slate/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-brand-text-2 uppercase tracking-wide">
            {match.league}
          </span>
          {getStatusBadge(match.status)}
        </div>
        <span className="text-xs text-slate-400 dark:text-brand-text-3">{match.stadium}</span>
      </div>

      {/* Teams + Score */}
      <div className="flex items-center justify-between px-4 py-4">
        {/* Home */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-brand-slate bg-slate-50 dark:bg-brand-navy-2 flex-shrink-0">
            <img src={match.homeTeamLogo} alt={match.homeTeam} className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-brand-text-1 text-sm">{match.homeTeam}</span>
        </div>

        {/* Score / VS */}
        <div className="flex-shrink-0 px-4">
          {match.homeScore !== null && match.awayScore !== null ? (
            <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {match.homeScore} <span className="text-slate-400 dark:text-brand-text-3 mx-0.5">-</span> {match.awayScore}
            </div>
          ) : (
            <div className="text-sm font-bold text-slate-400 dark:text-brand-text-3 px-2">VS</div>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="font-semibold text-slate-800 dark:text-brand-text-1 text-sm">{match.awayTeam}</span>
          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-brand-slate bg-slate-50 dark:bg-brand-navy-2 flex-shrink-0">
            <img src={match.awayTeamLogo} alt={match.awayTeam} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Odds */}
      <div className="grid grid-cols-3 gap-2 px-4 pb-3">
        {[
          { label: '1', value: match.homeOdds },
          { label: 'X', value: match.drawOdds },
          { label: '2', value: match.awayOdds },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-slate-50 dark:bg-brand-navy-2 border border-slate-200 dark:border-brand-slate/60 rounded-lg p-2 text-center hover:border-brand-green/40 hover:bg-brand-green/5 transition-colors cursor-pointer"
          >
            <div className="text-[10px] font-semibold text-slate-400 dark:text-brand-text-3 uppercase mb-1">{label}</div>
            <div className="text-sm font-bold text-slate-700 dark:text-brand-text-1">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchCard;