import React from 'react';
import SafeImage from './common/SafeImage';

export interface Match {
  id: number;
  leagueId: number;
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
  leagueCountry: string;
  leagueLogo: string;
  onTv?: boolean;
}

interface MatchCardProps {
  match: Match;
  isLast?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  showLeague?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  isLast = false, 
  isFavorite = false, 
  onToggleFavorite,
  onClick,
  showLeague = false
}) => {
  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      onClick={onClick}
      className={`flex flex-col transition-colors cursor-pointer group hover:bg-slate-50 dark:hover:bg-brand-navy-2 ${!isLast ? 'border-b border-slate-100 dark:border-brand-slate/50' : ''}`}
    >
      {showLeague && (
        <div className="text-[10px] text-slate-400 dark:text-slate-500 px-4 pt-2 pb-0.5 flex items-center gap-1.5 font-bold uppercase tracking-wider">
          <span>{match.leagueCountry} - {match.league}</span>
        </div>
      )}
      
      <div className="flex items-center justify-between py-2.5 px-4">
        {/* Status (Far Left) */}
        <div className="w-8 flex-shrink-0 flex items-center justify-start">
          {match.status === 'Live' ? (
            <span className="text-brand-red font-bold text-[10px] animate-pulse">Live</span>
          ) : match.status === 'FT' ? (
            <span className="text-slate-400 dark:text-brand-text-3 font-medium text-[10px]">FT</span>
          ) : null}
        </div>

        {/* Face to Face Layout */}
        <div className="flex-1 flex items-center justify-center gap-1 sm:gap-3 min-w-0">
          {/* Home Team */}
          <div className="flex-1 flex justify-end items-center gap-1.5 sm:gap-3 min-w-0">
            <span className={`text-[12px] sm:text-[13px] truncate ${match.homeScore !== null && match.homeScore > (match.awayScore || 0) ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
              {match.homeTeam}
            </span>
            <SafeImage src={match.homeTeamLogo} alt={match.homeTeam} className="w-4 h-4 sm:w-5 sm:h-5 object-contain flex-shrink-0" />
          </div>

          {/* Center: Score or Time */}
          <div className="w-16 flex-shrink-0 flex justify-center items-center">
            {match.status === 'Scheduled' ? (
              <span className="text-slate-500 dark:text-brand-text-2 font-medium text-[13px] bg-slate-100 dark:bg-brand-navy-1 px-2 py-0.5 rounded">
                {formatTime(match.date)}
              </span>
            ) : (
              <div className="flex items-center gap-1.5 font-bold text-[14px]">
                <span className={match.status === 'Live' ? 'text-brand-red' : 'text-slate-900 dark:text-white'}>
                  {match.homeScore}
                </span>
                <span className={match.status === 'Live' ? 'text-brand-red' : 'text-slate-400 dark:text-brand-slate'}>-</span>
                <span className={match.status === 'Live' ? 'text-brand-red' : 'text-slate-900 dark:text-white'}>
                  {match.awayScore}
                </span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex justify-start items-center gap-1.5 sm:gap-3 min-w-0">
            <SafeImage src={match.awayTeamLogo} alt={match.awayTeam} className="w-4 h-4 sm:w-5 sm:h-5 object-contain flex-shrink-0" />
            <span className={`text-[12px] sm:text-[13px] truncate ${match.awayScore !== null && match.awayScore > (match.homeScore || 0) ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
              {match.awayTeam}
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Star / TV icon */}
        <div className="w-12 flex-shrink-0 flex justify-end items-center gap-2">
           {match.onTv && (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" title="Diffusé en TV">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
             </svg>
           )}
           <button 
             onClick={onToggleFavorite}
             className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-brand-navy-1 transition-colors"
             title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
           >
             <svg 
               xmlns="http://www.w3.org/2000/svg" 
               className={`h-4 w-4 transition-colors ${isFavorite ? 'text-brand-green fill-brand-green' : 'text-slate-300 dark:text-brand-text-3 hover:text-brand-green'}`} 
               viewBox="0 0 24 24" 
               stroke="currentColor"
             >
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isFavorite ? 1 : 1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
             </svg>
           </button>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;