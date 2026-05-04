import { useEffect, useState } from 'react';
import MatchCard from '../components/MatchCard';

// Static data defined outside component — stable references, no useEffect dep warnings
const FIFA_LEAGUE_IMPORTANCE = [
  'Champions League', 'Premier League', 'La Liga', 'Bundesliga',
  'Serie A', 'Ligue 1', 'Europa League', 'Conference League',
];

const MATCHES = [
  { id: 1, league: 'Ligue 1', homeTeam: 'PSG', awayTeam: 'Marseille', homeScore: 3, awayScore: 1, status: 'FT', date: '2023-06-18T20:00:00', stadium: 'Parc des Princes', homeOdds: 1.45, drawOdds: 4.5, awayOdds: 7.25, homeTeamLogo: 'https://via.placeholder.com/30', awayTeamLogo: 'https://via.placeholder.com/30' },
  { id: 2, league: 'Premier League', homeTeam: 'Manchester City', awayTeam: 'Arsenal', homeScore: 2, awayScore: 2, status: 'FT', date: '2023-06-18T17:30:00', stadium: 'Etihad Stadium', homeOdds: 1.95, drawOdds: 3.5, awayOdds: 4.1, homeTeamLogo: 'https://via.placeholder.com/30', awayTeamLogo: 'https://via.placeholder.com/30' },
  { id: 3, league: 'La Liga', homeTeam: 'Barcelona', awayTeam: 'Real Madrid', homeScore: 0, awayScore: 0, status: 'Live', date: '2023-06-19T21:00:00', stadium: 'Camp Nou', homeOdds: 2.25, drawOdds: 3.25, awayOdds: 3.5, homeTeamLogo: 'https://via.placeholder.com/30', awayTeamLogo: 'https://via.placeholder.com/30' },
  { id: 4, league: 'Bundesliga', homeTeam: 'Bayern Munich', awayTeam: 'Dortmund', homeScore: null, awayScore: null, status: 'Scheduled', date: '2023-06-20T19:30:00', stadium: 'Allianz Arena', homeOdds: 1.65, drawOdds: 4.0, awayOdds: 5.5, homeTeamLogo: 'https://via.placeholder.com/30', awayTeamLogo: 'https://via.placeholder.com/30' },
  { id: 5, league: 'Serie A', homeTeam: 'Inter', awayTeam: 'Juventus', homeScore: null, awayScore: null, status: 'Scheduled', date: '2023-06-21T20:45:00', stadium: 'San Siro', homeOdds: 2.1, drawOdds: 3.25, awayOdds: 3.75, homeTeamLogo: 'https://via.placeholder.com/30', awayTeamLogo: 'https://via.placeholder.com/30' },
  { id: 6, league: 'Ligue 1', homeTeam: 'Lyon', awayTeam: 'Monaco', homeScore: null, awayScore: null, status: 'Scheduled', date: '2023-06-22T19:00:00', stadium: 'Groupama Stadium', homeOdds: 2.4, drawOdds: 3.3, awayOdds: 3.1, homeTeamLogo: 'https://via.placeholder.com/30', awayTeamLogo: 'https://via.placeholder.com/30' },
  { id: 7, league: 'Champions League', homeTeam: 'Liverpool', awayTeam: 'AC Milan', homeScore: null, awayScore: null, status: 'Scheduled', date: '2023-06-19T20:00:00', stadium: 'Anfield', homeOdds: 1.8, drawOdds: 3.6, awayOdds: 4.5, homeTeamLogo: 'https://via.placeholder.com/30', awayTeamLogo: 'https://via.placeholder.com/30' },
  { id: 8, league: 'Europa League', homeTeam: 'Sevilla', awayTeam: 'Roma', homeScore: null, awayScore: null, status: 'Scheduled', date: '2023-06-20T18:45:00', stadium: 'Ramón Sánchez Pizjuán', homeOdds: 2.2, drawOdds: 3.2, awayOdds: 3.4, homeTeamLogo: 'https://via.placeholder.com/30', awayTeamLogo: 'https://via.placeholder.com/30' },
  { id: 9, league: 'Champions League', homeTeam: 'Manchester United', awayTeam: 'PSG', homeScore: 2, awayScore: 1, status: 'FT', date: '2023-06-18T20:00:00', stadium: 'Old Trafford', homeOdds: 2.1, drawOdds: 3.5, awayOdds: 3.25, homeTeamLogo: 'https://via.placeholder.com/30', awayTeamLogo: 'https://via.placeholder.com/30' },
  { id: 10, league: 'Premier League', homeTeam: 'Liverpool', awayTeam: 'Chelsea', homeScore: 1, awayScore: 1, status: 'Live', date: '2023-06-19T17:30:00', stadium: 'Anfield', homeOdds: 1.85, drawOdds: 3.5, awayOdds: 4.3, homeTeamLogo: 'https://via.placeholder.com/30', awayTeamLogo: 'https://via.placeholder.com/30' },
];

const Matches = () => {
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [leagueOrder, setLeagueOrder] = useState<string[]>([]);
  const [isCustomOrder, setIsCustomOrder] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const uniqueDates = [...new Set(MATCHES.map((m) => m.date.split('T')[0]))].sort();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateDay = new Date(date);
    dateDay.setHours(0, 0, 0, 0);
    if (dateDay.getTime() === today.getTime()) return "Aujourd'hui";
    if (dateDay.getTime() === tomorrow.getTime()) return 'Demain';
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  useEffect(() => {
    const uniqueLeagues = Array.from(new Set(MATCHES.map((m) => m.league)));
    const sorted = [...uniqueLeagues].sort((a, b) => {
      const ia = FIFA_LEAGUE_IMPORTANCE.indexOf(a);
      const ib = FIFA_LEAGUE_IMPORTANCE.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
    setLeagueOrder(sorted);
    const today = new Date().toISOString().split('T')[0];
    const dates = [...new Set(MATCHES.map((m) => m.date.split('T')[0]))].sort();
    setSelectedDate(dates.includes(today) ? today : dates[0] ?? null);
  }, []); // MATCHES and FIFA_LEAGUE_IMPORTANCE are module-level constants — stable references

  const filteredMatches = selectedDate ? MATCHES.filter((m) => m.date.startsWith(selectedDate)) : MATCHES;

  const groupedByLeague = filteredMatches.reduce((groups, match) => {
    if (!groups[match.league]) groups[match.league] = [];
    groups[match.league].push(match);
    return groups;
  }, {} as Record<string, typeof MATCHES>);

  const sortedLeagues = Object.keys(groupedByLeague).sort((a, b) => {
    const ia = leagueOrder.indexOf(a);
    const ib = leagueOrder.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  const moveLeague = (league: string, direction: 'up' | 'down') => {
    const idx = leagueOrder.indexOf(league);
    if (direction === 'up' && idx <= 0) return;
    if (direction === 'down' && idx >= leagueOrder.length - 1) return;
    const newOrder = [...leagueOrder];
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];
    setLeagueOrder(newOrder);
    setIsCustomOrder(true);
  };

  const resetToFifaOrder = () => {
    const uniqueLeagues = Array.from(new Set(MATCHES.map((m) => m.league)));
    const sorted = [...uniqueLeagues].sort((a, b) => {
      const ia = FIFA_LEAGUE_IMPORTANCE.indexOf(a);
      const ib = FIFA_LEAGUE_IMPORTANCE.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
    setLeagueOrder(sorted);
    setIsCustomOrder(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Matchs</h2>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-brand-green hover:bg-brand-green/10 transition-colors"
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            title="Recherche avancée"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
          <button
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-brand-green hover:bg-brand-green/10 transition-colors"
            onClick={() => setShowOrderModal(!showOrderModal)}
            title="Organiser les ligues"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Advanced Search */}
      {showAdvancedSearch && (
        <div className="card p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Équipe</label>
              <input type="text" placeholder="Rechercher une équipe..." className="input-dark" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Statut</label>
              <select className="input-dark" title="Filtrer par statut de match" aria-label="Statut du match">
                <option value="">Tous</option>
                <option value="Live">En direct</option>
                <option value="FT">Terminé</option>
                <option value="Scheduled">À venir</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button className="btn-primary text-sm">Appliquer les filtres</button>
          </div>
        </div>
      )}

      {/* Date Bar */}
      <div className="mb-6 overflow-x-auto pb-1">
        <div className="flex gap-2 py-1 min-w-max">
          {uniqueDates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                selectedDate === date
                  ? 'bg-brand-green text-white shadow-[0_2px_12px_rgba(34,197,94,0.4)]'
                  : 'bg-brand-navy-3 text-brand-text-2 border border-brand-slate hover:border-brand-green/40 hover:text-brand-text-1'
              }`}
            >
              {formatDate(date)}
            </button>
          ))}
          <button
            onClick={() => setSelectedDate(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedDate === null
                ? 'bg-brand-green text-white shadow-[0_2px_12px_rgba(34,197,94,0.4)]'
                : 'bg-brand-navy-3 text-brand-text-2 border border-brand-slate hover:border-brand-green/40 hover:text-brand-text-1'
            }`}
          >
            Tous les matchs
          </button>
        </div>
      </div>

      {/* League Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="card w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Organiser les ligues</h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                aria-label="Fermer"
                title="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {leagueOrder.map((league) => (
                <div key={league} className="flex items-center justify-between bg-slate-50 dark:bg-brand-navy-2 border border-slate-200 dark:border-brand-slate p-3 rounded-lg">
                  <span className="font-medium text-slate-800 dark:text-brand-text-1 text-sm">{league}</span>
                  <div className="flex gap-1">
                    <button onClick={() => moveLeague(league, 'up')} className="p-1 text-slate-400 hover:text-brand-green transition-colors" title="Monter">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button onClick={() => moveLeague(league, 'down')} className="p-1 text-brand-text-3 hover:text-brand-green transition-colors" title="Descendre">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <button onClick={resetToFifaOrder} className="btn-ghost text-sm">
                Réinitialiser (ordre FIFA)
              </button>
              <button onClick={() => setShowOrderModal(false)} className="btn-primary text-sm">
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No matches */}
      {sortedLeagues.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400 dark:text-slate-500">Aucun match disponible pour cette date.</p>
        </div>
      )}

      {/* Matches by league */}
      {sortedLeagues.map((league) => (
        <div key={league} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{league}</h3>
            {isCustomOrder && (
              <span className="text-[10px] font-semibold bg-brand-green/15 text-brand-green border border-brand-green/30 px-2 py-0.5 rounded-full">
                Ordre personnalisé
              </span>
            )}
          </div>
          <div className="space-y-3">
            {groupedByLeague[league].map((match: typeof MATCHES[0]) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Matches;