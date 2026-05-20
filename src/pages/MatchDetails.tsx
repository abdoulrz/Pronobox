import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MatchPronostics from '../components/matches/MatchPronostics';

const MatchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'resume' | 'compositions' | 'stats'>('resume');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [liveElapsed, setLiveElapsed] = useState<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const status = data?.fixture?.status?.short;

    if (data?.fixture?.date && status === 'NS') {
      // Pre-match countdown
      const matchDate = new Date(data.fixture.date).getTime();
      timer = setInterval(() => {
        const distance = matchDate - Date.now();
        if (distance < 0) { setCountdown('Le match commence !'); clearInterval(timer); return; }
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }, 1000);
    } else if (status === '1H' || status === '2H' || status === 'ET') {
      // Anchor to the API's elapsed minute — it already accounts for the halftime break.
      // We just count seconds forward from the moment we received this API snapshot.
      const apiElapsedMinutes = data?.fixture?.status?.elapsed ?? 0;
      const snapTimestamp = Date.now();
      const initialSeconds = apiElapsedMinutes * 60;
      setLiveElapsed(initialSeconds);
      timer = setInterval(() => {
        setLiveElapsed(initialSeconds + Math.floor((Date.now() - snapTimestamp) / 1000));
      }, 1000);
    }

    return () => { if (timer) clearInterval(timer); };
  }, [data]);

  // Eagerly compute initial countdown so it's visible immediately on render
  const initialCountdown = useMemo(() => {
    if (!data?.fixture?.date || data?.fixture?.status?.short !== 'NS') return '';
    const distance = new Date(data.fixture.date).getTime() - Date.now();
    if (distance <= 0) return 'Le match commence\u00a0!';
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [data]);

  const displayCountdown = countdown || initialCountdown;

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/football/match/${id}`);
        const json = await res.json();
        
        if (json.response && json.response.length > 0) {
          setData(json.response[0]);
        } else {
          setError("Aucune donnée disponible pour ce match.");
        }
      } catch (err) {
        setError("Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMatch();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 font-medium">{error || 'Erreur'}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-brand-green hover:underline">Retour</button>
      </div>
    );
  }

  const { fixture, league, teams, goals, events, lineups, statistics } = data;

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const formatTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString('fr-FR', options);
  };

  const getEventIcon = (type: string, detail: string) => {
    if (type === 'Goal') return '⚽';
    if (type === 'Card' && detail.includes('Yellow')) return '🟨';
    if (type === 'Card' && detail.includes('Red')) return '🟥';
    if (type === 'subst') return '🔄';
    return '•';
  };

  // Helper to extract a specific stat
  const getStat = (teamIndex: number, type: string) => {
    if (!statistics || !statistics[teamIndex]) return '0';
    const stat = statistics[teamIndex].statistics.find((s: any) => s.type === type);
    return stat ? (stat.value !== null ? stat.value : '0') : '0';
  };

  const renderStatsBar = (label: string, type: string) => {
    const homeValStr = getStat(0, type).toString().replace('%', '');
    const awayValStr = getStat(1, type).toString().replace('%', '');
    const homeVal = parseInt(homeValStr) || 0;
    const awayVal = parseInt(awayValStr) || 0;
    const total = homeVal + awayVal || 1; // avoid division by zero
    
    const homePercent = (homeVal / total) * 100;
    const awayPercent = (awayVal / total) * 100;

    return (
      <div className="mb-4">
        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
          <span>{homeValStr}{getStat(0, type).toString().includes('%') ? '%' : ''}</span>
          <span className="text-slate-400 font-medium uppercase tracking-wider">{label}</span>
          <span>{awayValStr}{getStat(1, type).toString().includes('%') ? '%' : ''}</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-brand-navy-3 gap-1">
          <div className="bg-brand-green h-full rounded-r-full" style={{ width: `${homePercent}%` }}></div>
          <div className="bg-yellow-400 h-full rounded-l-full" style={{ width: `${awayPercent}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 py-6 animate-fade-in">
      {/* Top Breadcrumb / Info */}
      <div className="flex items-center justify-between mb-6 text-sm">
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-brand-green transition-colors font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Matchs
        </button>
        <div className="text-slate-500 font-medium flex items-center gap-2">
          <img src={league.logo} alt={league.name} className="h-4 w-4" />
          <span>{league.name}</span>
        </div>
      </div>

      {/* Main Scoreboard Card */}
      <div className="bg-white dark:bg-brand-navy-2 rounded-2xl shadow-sm border border-slate-200 dark:border-brand-slate overflow-hidden mb-6">
        
        {/* Context Bar */}
        <div className="bg-slate-50 dark:bg-brand-navy-3/30 px-3 py-2 border-b border-slate-100 dark:border-brand-slate/50 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 md:gap-8 text-[10px] sm:text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {formatDate(fixture.date)}
          </div>
          <div className="flex items-center gap-1 hidden sm:flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {fixture.venue?.name || 'Stade inconnu'}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm">👨‍⚖️</span>
            <span className="hidden xs:inline">{fixture.referee ? fixture.referee.split(',')[0] : 'Arbitre'}</span>
          </div>
          
          <div className="flex items-center gap-1 relative group cursor-help text-brand-green hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <span className="hidden xs:inline uppercase font-black tracking-tighter">TV</span>
            
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-brand-navy-2/95 backdrop-blur-md border border-slate-200 dark:border-brand-slate shadow-2xl rounded-xl p-4 hidden group-hover:block z-50 min-w-[200px] animate-fade-in">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-brand-slate/30 pb-2">
                <span className="text-sm">📺</span>
                <p className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Où regarder</p>
              </div>
              
              <div className="grid gap-2">
                {[
                  { 
                    name: 'beIN SPORTS', 
                    url: 'https://www.beinsports.com/france/', 
                    logo: 'https://www.google.com/s2/favicons?domain=beinsports.com&sz=128',
                    bg: 'bg-white'
                  },
                  { 
                    name: 'DAZN', 
                    url: 'https://www.dazn.com/', 
                    logo: 'https://www.google.com/s2/favicons?domain=dazn.com&sz=128',
                    bg: 'bg-white'
                  },
                  { 
                    name: 'Canal+ Sport', 
                    url: 'https://www.canalplus.com/sport/', 
                    logo: 'https://www.google.com/s2/favicons?domain=canalplus.com&sz=128',
                    bg: 'bg-white'
                  }
                ].map((channel) => (
                  <a 
                    key={channel.name}
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-brand-navy-1 transition-all group/item border border-transparent hover:border-slate-200 dark:hover:border-brand-slate/50"
                  >
                    <div className={`w-8 h-8 ${channel.bg} rounded flex items-center justify-center p-1.5 shrink-0 shadow-sm border border-slate-100 dark:border-white/10 overflow-hidden`}>
                      <img 
                        src={channel.logo} 
                        alt={channel.name} 
                        className="w-full h-full object-contain" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=0B0F1A&color=22C55E&bold=true&font-size=0.5`;
                          target.onerror = null; // Prevent infinite loops
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-white leading-tight">{channel.name}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Voir le direct</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
              
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-brand-slate/30">
                <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center italic">Disponibilité selon votre abonnement</p>
              </div>
            </div>
          </div>
        </div>
        

        {/* Big Score */}
        <div className="p-4 sm:p-8 flex items-center justify-between gap-2">
          {/* Home Team */}
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-50 dark:bg-brand-navy-1 rounded-xl flex items-center justify-center p-2 sm:p-3 border border-slate-100 dark:border-brand-slate/50 mb-2 sm:mb-3 shadow-sm">
              <img src={teams.home?.logo} alt={teams.home?.name} className="max-w-full max-h-full object-contain" />
            </div>
            <h2 className="text-xs sm:text-lg font-bold text-slate-800 dark:text-white text-center truncate w-full">{teams.home?.name}</h2>
          </div>

          {/* Score / Time */}
          <div className="flex flex-col items-center justify-center px-2 sm:px-6 text-center shrink-0">
            {fixture.status.short === 'NS' ? (
              <>
                {/* Big kickoff time */}
                <div className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-wider tabular-nums">
                  {formatTime(fixture.date)}
                </div>
                {/* Countdown below */}
                <div className="mt-2 flex flex-col items-center gap-0.5">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">Commence dans</div>
                  <div className="text-base sm:text-xl font-black text-brand-green tabular-nums font-mono tracking-widest">
                    {displayCountdown}
                  </div>
                </div>
              </>
            ) : fixture.status.short === 'HT' ? (
              <>
                <div className="text-2xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-wider flex items-center gap-2 sm:gap-4">
                  <span>{goals.home !== null ? goals.home : '-'}</span>
                  <span className="text-slate-300 dark:text-slate-600">-</span>
                  <span>{goals.away !== null ? goals.away : '-'}</span>
                </div>
                <div className="mt-2 px-3 py-1 bg-amber-400/10 text-amber-500 text-xs font-black rounded-full border border-amber-400/20 uppercase tracking-wide">
                  Mi-temps
                </div>
              </>
            ) : fixture.status.short === 'FT' || fixture.status.short === 'AET' || fixture.status.short === 'PEN' ? (
              <>
                <div className="text-2xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-wider flex items-center gap-2 sm:gap-4">
                  <span>{goals.home !== null ? goals.home : '-'}</span>
                  <span className="text-slate-300 dark:text-slate-600">-</span>
                  <span>{goals.away !== null ? goals.away : '-'}</span>
                </div>
                <div className="mt-2 px-3 py-1 bg-slate-100 dark:bg-brand-navy-3 text-slate-500 dark:text-slate-400 text-xs font-black rounded-full uppercase tracking-wide">
                  {fixture.status.short === 'AET' ? 'Apr. Prol.' : fixture.status.short === 'PEN' ? 'Tab' : 'Terminé'}
                </div>
              </>
            ) : (
              /* Live: 1H, 2H, ET — score + big green MM:SS timer like FotMob */
              <>
                <div className="text-2xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-wider flex items-center gap-2 sm:gap-4">
                  <span>{goals.home !== null ? goals.home : '-'}</span>
                  <span className="text-slate-300 dark:text-slate-600">-</span>
                  <span>{goals.away !== null ? goals.away : '-'}</span>
                </div>
                {/* FotMob-style live elapsed timer */}
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green" />
                  </span>
                  <span className="text-lg sm:text-2xl font-black text-brand-green tabular-nums font-mono tracking-wider">
                    {(() => {
                      // API elapsed already gives the true match minute (halftime-aware).
                      // Just display MM:SS directly — no manual half offset needed.
                      const totalSecs = liveElapsed ?? (fixture.status.elapsed ?? 0) * 60;
                      const mm = Math.floor(totalSecs / 60).toString().padStart(2, '0');
                      const ss = (totalSecs % 60).toString().padStart(2, '0');
                      return `${mm}:${ss}`;
                    })()}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-50 dark:bg-brand-navy-1 rounded-xl flex items-center justify-center p-2 sm:p-3 border border-slate-100 dark:border-brand-slate/50 mb-2 sm:mb-3 shadow-sm">
              <img src={teams.away?.logo} alt={teams.away?.name} className="max-w-full max-h-full object-contain" />
            </div>
            <h2 className="text-xs sm:text-lg font-bold text-slate-800 dark:text-white text-center truncate w-full">{teams.away?.name}</h2>
          </div>
        </div>

        {/* Goal Events under score */}
        <div className="pb-6 px-8 text-xs text-slate-500 font-medium flex justify-between">
          <div className="flex-1 text-right border-r border-slate-100 dark:border-brand-slate/50 pr-4 flex flex-col gap-1">
            {events?.filter((e: any) => e.type === 'Goal' && e.team.id === teams.home.id).map((e: any, i: number) => (
              <span key={i}>{e.player.name} {e.time.elapsed}' {e.detail === 'Penalty' ? '(Pen)' : ''}</span>
            ))}
          </div>
          <div className="flex-1 text-left pl-4 flex flex-col gap-1">
            {events?.filter((e: any) => e.type === 'Goal' && e.team.id === teams.away.id).map((e: any, i: number) => (
              <span key={i}>{e.player.name} {e.time.elapsed}' {e.detail === 'Penalty' ? '(Pen)' : ''}</span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-2 sm:px-4 border-t border-slate-100 dark:border-brand-slate/50 overflow-x-auto no-scrollbar scroll-smooth">
          <button 
            className={`px-3 sm:px-4 py-3 sm:py-4 text-[13px] sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'resume' ? 'border-brand-green text-brand-green' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            onClick={() => setActiveTab('resume')}
          >
            Résumé
          </button>
          <button 
            className={`px-3 sm:px-4 py-3 sm:py-4 text-[13px] sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'compositions' ? 'border-brand-green text-brand-green' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            onClick={() => setActiveTab('compositions')}
          >
            Compositions
          </button>
          <button 
            className={`px-3 sm:px-4 py-3 sm:py-4 text-[13px] sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'stats' ? 'border-brand-green text-brand-green' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            onClick={() => setActiveTab('stats')}
          >
            Statistiques
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (Main Tab Content) */}
        <div className="col-span-12 lg:col-span-8 order-2 lg:order-1 space-y-6">
          
          {activeTab === 'resume' && (
            <div className="bg-white dark:bg-brand-navy-2 rounded-2xl shadow-sm border border-slate-200 dark:border-brand-slate p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Événements</h3>
              <div className="relative border-l-2 border-slate-100 dark:border-brand-slate ml-4 space-y-6">
                {events && events.length > 0 ? (
                  events.map((e: any, i: number) => {
                    const isHome = e.team.id === teams.home.id;
                    return (
                      <div key={i} className={`relative flex items-center gap-4 ${!isHome ? 'flex-row-reverse text-right ml-auto' : ''}`}>
                        <div className="absolute -left-[20px] sm:-left-[25px] w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-brand-navy-2 border-2 border-slate-100 dark:border-brand-slate flex items-center justify-center text-[10px] sm:text-sm shadow-sm z-10 font-bold">
                            {e.time.elapsed}'
                          </div>
                        </div>
                        <div className="ml-8 sm:ml-10 bg-slate-50 dark:bg-brand-navy-3 rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 w-full border border-slate-100 dark:border-brand-slate/50 transition-all hover:border-brand-green/30">
                          <span className="text-base sm:text-lg">{getEventIcon(e.type, e.detail)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm truncate">{e.player.name}</p>
                            <p className="text-[10px] sm:text-xs text-slate-500 truncate">{e.detail} {e.assist?.name ? `(${e.assist.name})` : ''}</p>
                          </div>
                          <img src={e.team.logo} className="w-4 h-4 sm:w-5 sm:h-5 opacity-40 shrink-0" alt="" />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-10 text-center ml-4">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-brand-navy-3 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Le match n'a pas encore commencé.</p>
                    <p className="text-slate-400 text-xs mt-1 italic">Les événements en direct apparaîtront ici dès le coup d'envoi.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="bg-white dark:bg-brand-navy-2 rounded-2xl shadow-sm border border-slate-200 dark:border-brand-slate p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Top statistiques</h3>
              {(!statistics || statistics.length === 0) ? (
                <div className="py-10 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-brand-navy-3 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Statistiques non disponibles pour le moment.</p>
                  <p className="text-slate-400 text-xs mt-1 italic">Les données de possession, tirs et fautes seront mises à jour en direct pendant le match.</p>
                </div>
              ) : (
                <>
                  {renderStatsBar('Possession', 'Ball Possession')}
                  {renderStatsBar('Buts attendus (xG)', 'expected_goals')}
                  {renderStatsBar('Tirs cadrés', 'Shots on Goal')}
                  {renderStatsBar('Tirs non cadrés', 'Shots off Goal')}
                  {renderStatsBar('Fautes', 'Fouls')}
                  {renderStatsBar('Corners', 'Corner Kicks')}
                </>
              )}
            </div>
          )}

          {activeTab === 'compositions' && (
            <div className="bg-white dark:bg-brand-navy-2 rounded-2xl shadow-sm border border-slate-200 dark:border-brand-slate overflow-hidden">
              {(!lineups || lineups.length === 0) ? (
                <div className="py-12 text-center p-6">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-brand-navy-3 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Les compositions ne sont pas encore publiées.</p>
                  <p className="text-slate-400 text-xs mt-1 italic">Elles sont généralement disponibles 60 minutes avant le début de la rencontre.</p>
                </div>
              ) : (
                <div className="flex">
                  {/* Home Team Lineup */}
                  <div className="flex-1 border-r border-slate-100 dark:border-brand-slate/50">
                    <div className="bg-slate-50 dark:bg-brand-navy-3/50 px-4 py-3 border-b border-slate-100 dark:border-brand-slate/50 flex items-center gap-3">
                      <img src={teams.home.logo} className="w-6 h-6" alt="" />
                      <span className="font-bold text-slate-800 dark:text-white">{lineups[0]?.formation}</span>
                    </div>
                    <div className="p-2">
                      {lineups[0]?.startXI.map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-brand-navy-3 rounded-lg transition-colors">
                          <span className="w-6 text-center text-xs font-bold text-slate-400">{p.player.number}</span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.player.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Away Team Lineup */}
                  <div className="flex-1">
                    <div className="bg-slate-50 dark:bg-brand-navy-3/50 px-4 py-3 border-b border-slate-100 dark:border-brand-slate/50 flex items-center gap-3 justify-end">
                      <span className="font-bold text-slate-800 dark:text-white">{lineups[1]?.formation}</span>
                      <img src={teams.away.logo} className="w-6 h-6" alt="" />
                    </div>
                    <div className="p-2">
                      {lineups[1]?.startXI.map((p: any, i: number) => (
                        <div key={i} className="flex items-center justify-end gap-3 p-2 hover:bg-slate-50 dark:hover:bg-brand-navy-3 rounded-lg transition-colors">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.player.name}</span>
                          <span className="w-6 text-center text-xs font-bold text-slate-400">{p.player.number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column (Pronostics Block) */}
        <div className="col-span-12 lg:col-span-4 order-1 lg:order-2 space-y-6">
          <MatchPronostics 
            matchId={fixture.id}
            homeTeamName={teams.home?.name || 'Domicile'}
            awayTeamName={teams.away?.name || 'Extérieur'}
            homeLogo={teams.home?.logo || ''}
            awayLogo={teams.away?.logo || ''}
          />
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
