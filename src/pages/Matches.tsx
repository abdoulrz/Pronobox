import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchCard from '../components/MatchCard';
import type { Match } from '../components/MatchCard';
import LeagueSidebar from '../components/matches/LeagueSidebar';
import NewsSidebar from '../components/matches/NewsSidebar';
import DateNavigator from '../components/matches/DateNavigator';
import SafeImage from '../components/common/SafeImage';

// Static data defined outside component — stable references, no useEffect dep warnings

const COUNTRY_TRANSLATIONS: Record<string, string> = {
  'IVORY-COAST': "Côte d'Ivoire",
  'IVORY COAST': "Côte d'Ivoire",
  'SPAIN': 'Espagne',
  'ENGLAND': 'Angleterre',
  'GERMANY': 'Allemagne',
  'ITALY': 'Italie',
  'FRANCE': 'France',
  'BRAZIL': 'Brésil',
  'ARGENTINA': 'Argentine',
  'WORLD': 'Monde',
};

const PRIORITY_COUNTRIES = ['FRANCE', 'ESPAGNE', 'ANGLETERRE', 'ALLEMAGNE', 'ITALIE']; // Top European nations first

const getUserCountry = (): string => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) {
      if (timezone.includes('Paris')) return 'FRANCE';
      if (timezone.includes('Madrid')) return 'ESPAGNE';
      if (timezone.includes('London')) return 'ANGLETERRE';
      if (timezone.includes('Berlin')) return 'ALLEMAGNE';
      if (timezone.includes('Rome')) return 'ITALIE';
      if (timezone.includes('Brussels')) return 'BELGIQUE';
      if (timezone.includes('Zurich')) return 'SUISSE';
      if (timezone.includes('Dakar')) return 'SENEGAL';
      if (timezone.includes('Abidjan')) return "COTE D'IVOIRE";
      if (timezone.includes('Casablanca')) return 'MAROC';
      if (timezone.includes('Tunis')) return 'TUNISIE';
      if (timezone.includes('Algiers')) return 'ALGERIE';
      if (timezone.includes('Montreal') || timezone.includes('Toronto') || timezone.includes('Vancouver')) return 'CANADA';
    }
    
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith('fr')) return 'FRANCE';
    if (lang.startsWith('es')) return 'ESPAGNE';
    if (lang.startsWith('it')) return 'ITALIE';
    if (lang.startsWith('de')) return 'ALLEMAGNE';
    if (lang.startsWith('en')) return 'ANGLETERRE';
  } catch (e) {
    console.error('Error detecting user country:', e);
  }
  return 'FRANCE'; // Default fallback
};



const Matches = () => {
  const navigate = useNavigate();
  const [favoriteLeagues, setFavoriteLeagues] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('favoriteLeagues');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [favoriteMatches, setFavoriteMatches] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('favoriteMatches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('favoriteLeagues', JSON.stringify(favoriteLeagues));
  }, [favoriteLeagues]);

  useEffect(() => {
    localStorage.setItem('favoriteMatches', JSON.stringify(favoriteMatches));
  }, [favoriteMatches]);
  const [collapsedLeagues, setCollapsedLeagues] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveOnly, setLiveOnly] = useState(false);
  const [showAllLeagues, setShowAllLeagues] = useState(false);
  const [availableLeagues, setAvailableLeagues] = useState<{id: number, name: string, logo: string, country: string}[]>([]);
  const [mobileView, setMobileView] = useState<'ligues' | 'matchs' | 'actualites'>('matchs');
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchMatches(selectedDate);
    }
  }, [selectedDate]);

  const fetchMatches = async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/football/matches?date=${date}`);
      const data = await response.json();
      
      if (data && data.response) {
        const mappedMatches: Match[] = data.response.map((item: any) => ({
          id: item.fixture.id,
          leagueId: item.league.id,
          league: item.league.name,
          homeTeam: item.teams.home.name,
          awayTeam: item.teams.away.name,
          homeScore: item.goals.home,
          awayScore: item.goals.away,
          status: mapStatus(item.fixture.status.short),
          date: item.fixture.date,
          stadium: item.fixture.venue?.name || 'N/A',
          homeOdds: 0,
          drawOdds: 0,
          awayOdds: 0,
          homeTeamLogo: item.teams.home.logo,
          awayTeamLogo: item.teams.away.logo,
          leagueCountry: item.league.country,
          leagueLogo: item.league.logo,
        }));
        setMatches(mappedMatches);
        
        // Extract unique leagues with logos for the sidebar, keyed by ID to avoid name collisions
        const leaguesMap = new Map<number, {id: number, name: string, logo: string, country: string}>();
        data.response.forEach((item: any) => {
          leaguesMap.set(item.league.id, {id: item.league.id, name: item.league.name, logo: item.league.logo, country: item.league.country});
        });
        setAvailableLeagues(Array.from(leaguesMap.values()));
        
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const mapStatus = (status: string): string => {
    switch (status) {
      case 'NS': return 'Scheduled';
      case '1H':
      case '2H':
      case 'HT':
      case 'ET':
      case 'P':
      case 'BT':
      case 'LIVE': return 'Live';
      case 'FT':
      case 'AET':
      case 'PEN': return 'FT';
      default: return 'Scheduled';
    }
  };

  const filteredMatches = matches.filter((m) => {
    const matchesSearch = searchQuery 
      ? m.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.league.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesLive = liveOnly ? m.status === 'Live' : true;
    
    return matchesSearch && matchesLive;
  });

  const groupedByLeague = filteredMatches.reduce((groups, match) => {
    const normalizedCountry = match.leagueCountry.toUpperCase();
    const displayCountry = COUNTRY_TRANSLATIONS[normalizedCountry] || match.leagueCountry;
    const key = `${displayCountry} - ${match.league}`;
    
    if (!groups[key]) {
      groups[key] = {
        id: match.leagueId,
        name: match.league,
        country: displayCountry,
        logo: match.leagueLogo,
        matches: []
      };
    }
    groups[key].matches.push(match);
    return groups;
  }, {} as Record<string, { id: number; name: string; country: string; logo: string; matches: Match[] }>);

  const favoriteMatchesList = filteredMatches.filter(m => favoriteMatches.includes(m.id));

  const sortedLeagues = Object.keys(groupedByLeague).sort((a, b) => {
    // 1. Check favorite leagues
    const idA = groupedByLeague[a].id;
    const idB = groupedByLeague[b].id;
    const isFavA = favoriteLeagues.includes(idA);
    const isFavB = favoriteLeagues.includes(idB);
    if (isFavA && !isFavB) return -1;
    if (!isFavA && isFavB) return 1;

    // 2. Check importance of top leagues (Meilleures ligues)
    const TOP_LEAGUE_IDS = [1, 2, 4, 39, 140, 135, 78, 3, 61, 45];
    const idxA = TOP_LEAGUE_IDS.indexOf(idA);
    const idxB = TOP_LEAGUE_IDS.indexOf(idB);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;

    const countryA = groupedByLeague[a].country.toUpperCase();
    const countryB = groupedByLeague[b].country.toUpperCase();
    const userCountry = getUserCountry();

    // 3. User National Country matches first
    const isNationalA = countryA === userCountry;
    const isNationalB = countryB === userCountry;
    if (isNationalA && !isNationalB) return -1;
    if (!isNationalA && isNationalB) return 1;

    // 4. Other Priority countries
    const pidxA = PRIORITY_COUNTRIES.indexOf(countryA);
    const pidxB = PRIORITY_COUNTRIES.indexOf(countryB);
    if (pidxA !== -1 && pidxB !== -1) return pidxA - pidxB;
    if (pidxA !== -1) return -1;
    if (pidxB !== -1) return 1;

    // 5. Alphabetical fallback
    return a.localeCompare(b);
  });

  const handleToggleFavorite = (e: React.MouseEvent, matchId: number) => {
    e.stopPropagation();
    setFavoriteMatches(prev => 
      prev.includes(matchId) ? prev.filter(id => id !== matchId) : [...prev, matchId]
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 flex flex-col xl:flex-row gap-6 justify-center animate-fade-in pb-12 pt-6">
      
      {/* Mobile Toggle */}
      <div className="flex xl:hidden p-1 bg-slate-100 dark:bg-brand-navy-2 rounded-xl w-full sm:max-w-md mx-auto mb-2">
        <button
          onClick={() => setMobileView('ligues')}
          className={`flex-1 py-2 px-2 sm:px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
            mobileView === 'ligues'
              ? 'bg-white dark:bg-brand-navy-1 text-brand-green shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          🏆 Ligues
        </button>
        <button
          onClick={() => setMobileView('matchs')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
            mobileView === 'matchs'
              ? 'bg-white dark:bg-brand-navy-1 text-brand-green shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          ⚽ Matchs
        </button>
        <button
          onClick={() => setMobileView('actualites')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
            mobileView === 'actualites'
              ? 'bg-white dark:bg-brand-navy-1 text-brand-green shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          📰 Actus
        </button>
      </div>

      {/* Left Sidebar */}
      <LeagueSidebar 
        leagues={availableLeagues} 
        className={mobileView === 'ligues' ? 'block' : 'hidden xl:block'}
        favoriteLeagues={favoriteLeagues}
        onToggleFavorite={(leagueId) => {
          setFavoriteLeagues(prev => 
            prev.includes(leagueId) ? prev.filter(id => id !== leagueId) : [...prev, leagueId]
          );
        }}
      />

      {/* Main Content (Center) */}
      <div className={`flex-1 w-full max-w-[700px] mx-auto min-w-0 ${mobileView === 'matchs' ? 'block' : 'hidden xl:block'}`}>
        
        {/* Date Navigator */}
        <DateNavigator selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {/* Filters Bar */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          <button 
            onClick={() => setLiveOnly(!liveOnly)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors whitespace-nowrap ${
              liveOnly 
                ? 'bg-brand-green text-white border border-brand-green' 
                : 'bg-slate-100 dark:bg-brand-navy-2 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-brand-slate hover:bg-slate-200 dark:hover:bg-brand-navy-1'
            }`}
          >
            En direct
          </button>
          <button className="px-4 py-1.5 rounded-full text-[13px] font-bold bg-slate-100 dark:bg-brand-navy-2 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-brand-slate hover:bg-slate-200 dark:hover:bg-brand-navy-1 transition-colors whitespace-nowrap">
            En TV
          </button>
          <button className="px-4 py-1.5 rounded-full text-[13px] font-bold bg-slate-100 dark:bg-brand-navy-2 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-brand-slate hover:bg-slate-200 dark:hover:bg-brand-navy-1 transition-colors whitespace-nowrap">
            Par horaire
          </button>
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Filtre" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[116px] bg-slate-100 dark:bg-brand-navy-2 border border-slate-200 dark:border-brand-slate rounded-full py-1.5 pl-8 pr-3 text-[13px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-green focus:bg-white dark:focus:bg-brand-navy-1 transition-colors"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            
            <button 
              onClick={() => {
                if (collapsedLeagues.length === sortedLeagues.length) {
                  setCollapsedLeagues([]);
                } else {
                  setCollapsedLeagues(sortedLeagues);
                }
              }}
              className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-brand-navy-2 transition-colors border border-slate-200 dark:border-brand-slate"
              title={collapsedLeagues.length === sortedLeagues.length ? "Développer tout" : "Réduire tout"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${collapsedLeagues.length === sortedLeagues.length ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto"></div>
            <p className="text-slate-400 dark:text-slate-500 mt-4">Chargement des matchs...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        )}

        {/* No matches */}
        {!loading && !error && sortedLeagues.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400 dark:text-slate-500">Aucun match disponible pour cette date.</p>
          </div>
        )}

        {/* Matches by league */}
        {!loading && !error && (
          <div className="space-y-4">
            {/* Favoris Section */}
            {favoriteMatchesList.length > 0 && (
              <div className="card overflow-hidden mb-6 border border-brand-green/30">
                <div className="flex items-center gap-3 px-3 py-2 bg-brand-green/10 border-b border-brand-green/20">
                  <span className="text-brand-green text-lg">⭐</span>
                  <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Matchs Favoris</h3>
                </div>
                <div className="flex flex-col">
                  {favoriteMatchesList.map((match, index) => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      isLast={index === favoriteMatchesList.length - 1}
                      isFavorite={true}
                      onToggleFavorite={(e) => handleToggleFavorite(e, match.id)}
                      onClick={() => navigate(`/match/${match.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {(showAllLeagues ? sortedLeagues : sortedLeagues.slice(0, 9)).map((leagueKey) => {
              const leagueData = groupedByLeague[leagueKey];
              return (
                <div key={leagueKey} className="card overflow-hidden">
                  {/* League Header */}
                  <div 
                    className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-brand-navy-2 border-b border-slate-100 dark:border-brand-slate/50 cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-brand-navy-1 transition-colors"
                    onClick={() => navigate(`/league/${leagueData.id}`)}
                  >
                    <div className="w-5 h-5 rounded-full bg-white dark:bg-brand-navy-1 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-brand-slate/50 p-0.5">
                      <SafeImage src={leagueData.logo} alt={leagueData.name} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">{leagueKey}</h3>
                    <div className="ml-auto flex items-center gap-2">
                      <button 
                        className="p-1 text-slate-400 hover:text-brand-green transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFavoriteLeagues(prev => 
                            prev.includes(leagueData.id) ? prev.filter(id => id !== leagueData.id) : [...prev, leagueData.id]
                          );
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${favoriteLeagues.includes(leagueData.id) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                      <button 
                        className="p-1 text-slate-400 hover:text-brand-green transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCollapsedLeagues(prev => 
                            prev.includes(leagueKey) ? prev.filter(l => l !== leagueKey) : [...prev, leagueKey]
                          );
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${collapsedLeagues.includes(leagueKey) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* Matches List */}
                  {!collapsedLeagues.includes(leagueKey) && (
                    <div className="flex flex-col">
                      {leagueData.matches.map((match: Match, index) => (
                        <MatchCard 
                          key={match.id} 
                          match={match} 
                          isLast={index === leagueData.matches.length - 1}
                          isFavorite={favoriteMatches.includes(match.id)}
                          onToggleFavorite={(e) => handleToggleFavorite(e, match.id)}
                          onClick={() => navigate(`/match/${match.id}`)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Show All / Hide All Button */}
            {sortedLeagues.length > 9 && (
              <div className="text-center mt-6">
                <button 
                  onClick={() => setShowAllLeagues(!showAllLeagues)}
                  className="px-6 py-2 bg-white dark:bg-brand-navy-2 border border-slate-200 dark:border-brand-slate rounded-full text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-brand-navy-1 transition-colors flex items-center gap-2 mx-auto"
                >
                  <span>{showAllLeagues ? 'Masquer tout' : 'Afficher tout'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showAllLeagues ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {!showAllLeagues && (
                  <p className="text-xs text-slate-500 mt-2">{sortedLeagues.length - 9} autres compétitions aujourd'hui</p>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Right Sidebar */}
      <NewsSidebar className={mobileView === 'actualites' ? 'block' : 'hidden xl:block'} />

    </div>
  );
};

export default Matches;