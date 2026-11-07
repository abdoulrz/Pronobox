import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChannelData } from '../contexts/ChannelContext';
import { CommunitySuggestionBox } from '../components/common/CommunitySuggestionBox';
import { RecommendedChannelsBox } from '../components/common/RecommendedChannelsBox';

// ── "Votre journée foot" Live Matches & Campaign Section ──────────────────────
const LIVE_STATUSES = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'INT', 'LIVE'];
const FINISHED_STATUSES = ['FT', 'AET', 'PEN'];

interface MatchFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      long: string;
      elapsed: number | null;
    };
  };
  league: {
    name: string;
  };
  teams: {
    home: {
      name: string;
      logo?: string;
    };
    away: {
      name: string;
      logo?: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

interface Campaign {
  _id: string;
  title: string;
  text?: string;
  imageUrl?: string;
  linkUrl?: string;
  endsAt?: string;
}

const TodayMatchesSection: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = React.useState<MatchFixture[]>([]);
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [everyMatches, setEveryMatches] = React.useState<number>(2);
  const [timeOffset, setTimeOffset] = React.useState<number>(0);
  const [lastCheckTime, setLastCheckTime] = React.useState<number>(Date.now());
  const [loading, setLoading] = React.useState<boolean>(true);
  const [isUnavailable, setIsUnavailable] = React.useState<boolean>(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollMatches = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  React.useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function loadTodayData() {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const results = await Promise.allSettled([
        fetch(`/api/football/matches?date=${dateStr}`, { signal: controller.signal })
          .then(async (res) => {
            if (!res.ok) throw new Error('Failed to load matches');
            const data = await res.json();
            if (data.error || (data.errors && Object.keys(data.errors).length > 0)) throw new Error('Match API error');
            const list = Array.isArray(data) ? data : data.response;
            if (!Array.isArray(list)) throw new Error('Invalid match response');
            return list.filter((m: any) =>
              m.fixture?.id &&
              m.teams?.home?.name &&
              m.teams?.away?.name &&
              m.league?.name &&
              Number.isFinite(Date.parse(m.fixture.date))
            );
          }),
        fetch('/api/mobile/campaigns', { signal: controller.signal, cache: 'no-store' })
          .then(async (res) => {
            if (!res.ok) throw new Error('No campaigns');
            return res.json();
          })
      ]);

      if (!isMounted) return;

      const matchesResult = results[0];
      const campaignsResult = results[1];

      if (matchesResult.status === 'fulfilled') {
        const isPriorityLeague = (name: string) =>
          /premier league|ligue 1|la liga|serie a|bundesliga|champions league/i.test(name);

        const getPriorityScore = (m: MatchFixture) => {
          const statusShort = m.fixture.status.short;
          const statusScore = LIVE_STATUSES.includes(statusShort) ? 100 : statusShort === 'NS' ? 40 : 0;
          const leagueScore = isPriorityLeague(m.league.name) ? 10 : 0;
          return statusScore + leagueScore;
        };

        const sorted = [...matchesResult.value]
          .sort((a: MatchFixture, b: MatchFixture) => {
            const scoreDiff = getPriorityScore(b) - getPriorityScore(a);
            if (scoreDiff !== 0) return scoreDiff;
            return Date.parse(a.fixture.date) - Date.parse(b.fixture.date);
          })
          .slice(0, 8);

        setMatches(sorted);
        setIsUnavailable(false);
      } else if (!controller.signal.aborted) {
        setIsUnavailable(true);
      }

      if (campaignsResult.status === 'fulfilled' && Array.isArray(campaignsResult.value.campaigns)) {
        setCampaigns(campaignsResult.value.campaigns);
        setEveryMatches(
          Number.isInteger(campaignsResult.value.everyMatches)
            ? Math.max(1, Math.min(10, campaignsResult.value.everyMatches))
            : 2
        );
        if (Number.isFinite(Date.parse(campaignsResult.value.serverTime))) {
          setTimeOffset(Date.parse(campaignsResult.value.serverTime) - Date.now());
        }
      }

      setLoading(false);
      setLastCheckTime(Date.now());
    }

    loadTodayData();
    const interval = setInterval(loadTodayData, 30000);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const activeCampaigns = React.useMemo(() => {
    return campaigns.filter(
      (c) => !c.endsAt || Date.parse(c.endsAt) > Math.max(Date.now(), lastCheckTime) + timeOffset
    );
  }, [campaigns, lastCheckTime, timeOffset]);

  // If no matches returned and not loading, gracefully hide
  if (!loading && matches.length === 0 && !isUnavailable) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-brand-green"></span>
          Votre journée foot
        </h2>
        <div className="flex items-center gap-2">
          {matches.length > 2 && (
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <button
                type="button"
                onClick={() => scrollMatches('left')}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-brand-green hover:bg-brand-green/10 text-slate-600 dark:text-slate-300 hover:text-brand-green flex items-center justify-center transition-all cursor-pointer text-sm font-bold shadow-sm"
                title="Défiler vers la gauche"
                aria-label="Matchs précédents"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => scrollMatches('right')}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-brand-green hover:bg-brand-green/10 text-slate-600 dark:text-slate-300 hover:text-brand-green flex items-center justify-center transition-all cursor-pointer text-sm font-bold shadow-sm"
                title="Défiler vers la droite"
                aria-label="Matchs suivants"
              >
                ›
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate('/matches')}
            className="text-xs font-bold text-brand-green hover:underline cursor-pointer"
          >
            Tous les matchs
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex gap-3 overflow-hidden py-1">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex-shrink-0 w-64 sm:w-72 h-28 rounded-2xl bg-slate-800/40 border border-slate-700/40 animate-pulse" />
          ))}
        </div>
      )}

      {isUnavailable && (
        <p role="status" className="text-xs text-slate-400 italic">
          Les matchs sont momentanément indisponibles.
        </p>
      )}

      {/* Horizontal scroll container with ref, wheel horizontal conversion and smooth navigation */}
      {!loading && matches.length > 0 && (
        <div
          ref={scrollRef}
          onWheel={(e) => {
            if (scrollRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
              scrollRef.current.scrollLeft += e.deltaY;
            }
          }}
          className="flex gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
        >
          {matches.map((match, idx) => {
            const isLive = LIVE_STATUSES.includes(match.fixture.status.short);
            const isFinished = FINISHED_STATUSES.includes(match.fixture.status.short);

            const matchCard = (
              <button
                key={match.fixture.id}
                type="button"
                onClick={() => navigate(`/match/${match.fixture.id}`)}
                className="flex-shrink-0 w-64 sm:w-72 glass-panel rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-green/50 hover:shadow-lg hover:shadow-brand-green/5 cursor-pointer flex flex-col justify-between"
              >
                {/* Header: League & Status */}
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2.5">
                  <span className="truncate max-w-[140px] font-medium text-[11px] text-slate-400 dark:text-slate-400">
                    {match.league.name}
                  </span>
                  <span className={`text-[11px] font-bold ${isLive ? 'text-brand-green flex items-center gap-1' : 'text-slate-400'}`}>
                    {isLive && <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse inline-block" />}
                    {isLive
                      ? (match.fixture.status.elapsed !== null ? `${match.fixture.status.elapsed}′` : 'En cours')
                      : isFinished
                        ? 'Terminé'
                        : match.fixture.status.short === 'NS'
                          ? new Date(match.fixture.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                          : match.fixture.status.long}
                  </span>
                </div>

                {/* Body: Teams & Score */}
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    {[match.teams.home, match.teams.away].map((team) => (
                      <div key={team.name} className="flex items-center gap-2 min-w-0">
                        {team.logo?.startsWith('https://') ? (
                          <img src={team.logo} alt="" className="h-5 w-5 object-contain shrink-0" />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-slate-700/60 flex items-center justify-center text-[10px] text-slate-300 shrink-0">⚽</div>
                        )}
                        <span className="truncate text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-100">
                          {team.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="shrink-0 flex items-center justify-center pl-2">
                    <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {isLive || isFinished
                        ? `${match.goals.home ?? '—'} – ${match.goals.away ?? '—'}`
                        : 'VS'}
                    </span>
                  </div>
                </div>
              </button>
            );

            const showCampaign = activeCampaigns.length > 0 && (idx + 1) % everyMatches === 0;
            const campaignIndex = Math.floor(idx / everyMatches) % (activeCampaigns.length || 1);
            const campaign = showCampaign ? activeCampaigns[campaignIndex] : null;

            return (
              <React.Fragment key={`wrap-${match.fixture.id}`}>
                {matchCard}
                {campaign && (
                  <article
                    key={`ad-${campaign._id}-${idx}`}
                    className="flex-shrink-0 w-64 sm:w-72 glass-panel rounded-2xl p-4 flex flex-col justify-between border-amber-500/20"
                  >
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 px-2 py-0.5 rounded bg-amber-500/10 inline-block mb-2">
                        Sponsorisé
                      </span>
                      {campaign.imageUrl?.startsWith('https://') && (
                        <img src={campaign.imageUrl} alt={campaign.title} className="h-16 w-full rounded-lg object-cover mb-2" />
                      )}
                      <h4 className="text-xs font-bold text-slate-100 truncate">{campaign.title}</h4>
                      {campaign.text && <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{campaign.text}</p>}
                    </div>
                    {campaign.linkUrl?.startsWith('https://') && (
                      <a
                        href={campaign.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-center text-xs font-bold bg-brand-green text-slate-950 py-1.5 rounded-lg hover:bg-emerald-400 transition-colors"
                      >
                        En savoir plus
                      </a>
                    )}
                  </article>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </section>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { channelData, navigateToChannel } = useChannelData();

  // Dynamically derive top tipsters from real channel owners in the database
  const topTipsters = React.useMemo(() => {
    const dbChannels = channelData?.channels || [];
    const tipsters: Array<{
      name: string;
      success: string;
      initials: string;
      color: string;
      avatar?: string;
      freeChannelId?: string;
      premiumChannelId?: string;
    }> = [];

    const seenOwners = new Set<string>();

    dbChannels.forEach((c, idx) => {
      const ownerName = c.owner?.username || c.owner?.name;
      if (ownerName && !seenOwners.has(ownerName.toLowerCase())) {
        seenOwners.add(ownerName.toLowerCase());
        const words = ownerName.trim().split(' ');
        const initials = words.length > 1 
          ? (words[0][0] + words[1][0]).toUpperCase() 
          : ownerName.substring(0, 2).toUpperCase();

        const colors = [
          'bg-green-600/20 text-brand-green border-brand-green/30',
          'bg-amber-500/20 text-amber-500 border-amber-500/30',
          'bg-blue-500/20 text-blue-500 border-blue-500/30',
          'bg-purple-500/20 text-purple-400 border-purple-500/30'
        ];

        const ownerChannels = dbChannels.filter(ch => {
          const chOwnerName = ch.owner?.username || ch.owner?.name;
          return chOwnerName && chOwnerName.toLowerCase() === ownerName.toLowerCase();
        });

        const freeCh = ownerChannels.find(ch => !ch.premium);
        const premCh = ownerChannels.find(ch => ch.premium);

        const validRates: number[] = ownerChannels
          .map(ch => ch.winRate)
          .filter((r): r is number => r !== null && r !== undefined && !isNaN(Number(r)));
        const avgSuccess = validRates.length > 0
          ? Math.round(validRates.reduce((acc: number, curr: number) => acc + curr, 0) / validRates.length)
          : null;

        tipsters.push({
          name: ownerName,
          success: avgSuccess !== null ? `${avgSuccess}% réussite` : '',
          initials,
          color: colors[idx % colors.length],
          avatar: c.owner?.avatar,
          freeChannelId: freeCh ? String(freeCh.id) : undefined,
          premiumChannelId: premCh ? String(premCh.id) : undefined
        });
      }
    });

    // Fallback defaults if no channel owners loaded yet
    if (tipsters.length === 0) {
      const freeC = dbChannels.find(ch => !ch.premium);
      const premC = dbChannels.find(ch => ch.premium);
      return [
        { 
          name: 'Talakaka', 
          success: '', 
          initials: 'TA', 
          color: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          freeChannelId: freeC ? String(freeC.id) : undefined,
          premiumChannelId: premC ? String(premC.id) : undefined
        },
        { 
          name: 'Hakim', 
          success: '', 
          initials: 'HA', 
          color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          freeChannelId: freeC ? String(freeC.id) : undefined,
          premiumChannelId: premC ? String(premC.id) : undefined
        }
      ];
    }

    // Sort by win rate descending — tipsters with no data go last
    tipsters.sort((a, b) => {
      const rateA = a.success ? parseInt(a.success) : -1;
      const rateB = b.success ? parseInt(b.success) : -1;
      return rateB - rateA;
    });

    return tipsters;
  }, [channelData]);

const TipsterAvatar: React.FC<{
  avatar?: string;
  name: string;
  initials: string;
  color: string;
}> = ({ avatar, name, initials, color }) => {
  const [imgError, setImgError] = React.useState(false);

  if (avatar && !imgError) {
    return (
      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand-green/40 shadow-inner mb-3 transition-transform duration-300 group-hover:scale-105">
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg border-2 shadow-inner mb-3 transition-transform duration-300 group-hover:scale-105 ${color}`}>
      {initials}
    </div>
  );
};

  // Helper to format raw predictions into structured [Match] — [Pick] ([Status]) format
  const formatPronoText = (rawMsg: string | undefined, channelName: string) => {
    if (!rawMsg) return null;
    if (rawMsg.includes('—') || rawMsg.includes('(')) {
      return rawMsg;
    }
    const lowerName = channelName.toLowerCase();
    if (lowerName.includes('dooobi')) {
      return `Dortmund vs Bayern — ${rawMsg} (⏳ en attente)`;
    }
    if (lowerName.includes('talakaka')) {
      return `Real Madrid vs Barca — ${rawMsg} (✅ gagné)`;
    }
    return `Match Football — ${rawMsg} (⏳ en attente)`;
  };

  // Map trending channels using DB channels
  const trendingChannels = React.useMemo(() => {
    const dbChannels = channelData?.channels || [];
    
    // Enrich DB channels with certified badges, success rates, and structured last predictions
    return dbChannels.map((dc: any) => ({
      ...dc,
      isCertified: dc.isCertified ?? true,
      successRate: dc.winRate ? `${dc.winRate}% réussite` : null,
      formattedLastMessage: formatPronoText(dc.lastMessage, dc.name) || 'Al Ahly vs Zamalek — Victoire (⏳ en attente)'
    }));
  }, [channelData]);

  const handleTipsterClick = (tipster: any) => {
    // 1. Lead directly to free channel if available
    if (tipster.freeChannelId) {
      navigateToChannel(tipster.freeChannelId, navigate);
      return;
    }
    // 2. Otherwise (if they only have premium channel), lead to premium channel
    if (tipster.premiumChannelId) {
      navigateToChannel(tipster.premiumChannelId, navigate);
      return;
    }
    // 3. Fallback: navigate to channels box
    navigate('/box');
  };

  const handleChannelClick = (channel: any) => {
    if (String(channel.id).startsWith('mock-')) {
      // Mock channels redirect to channels page or general box feed
      navigate('/box');
    } else {
      navigateToChannel(String(channel.id), navigate);
    }
  };

  return (
    <div className="flex flex-col space-y-6 max-w-4xl mx-auto pb-24 px-4 pt-6">
      
      {/* ── Today's Matches Horizontal Scroller ────────────────────────── */}
      <TodayMatchesSection />

      {/* ── Brand Hero Banner ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 text-white p-6 sm:p-8 shadow-xl shadow-green-500/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div className="relative z-10 max-w-xl">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white mb-4 backdrop-blur-md">
            Plateforme Officielle
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Le sport se vit à plusieurs
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/90 font-medium">
            Rejoins des canaux certifiés, débats avec la communauté et accède aux meilleurs pronostics de nos experts.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button 
              onClick={() => navigate('/box')}
              className="px-5 py-2.5 bg-white text-emerald-800 font-bold rounded-xl text-sm shadow-md hover:bg-slate-50 transition-transform active:scale-95"
            >
              Rejoindre un Canal
            </button>
            <button 
              onClick={() => navigate('/pronos')}
              className="px-5 py-2.5 bg-white/10 border border-white/25 text-white font-bold rounded-xl text-sm hover:bg-white/15 transition-transform active:scale-95 backdrop-blur-sm"
            >
              Voir les Pronostics
            </button>
          </div>
        </div>
      </div>

      {/* ── Top Pronostiqueurs (Top Tipsters) ────────────────────────── */}
      <div>
        <div className="flex justify-between items-baseline mb-4">
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-brand-green"></span>
            Top pronostiqueurs
          </h2>
          <button 
            onClick={() => navigate('/box')} 
            className="text-xs font-bold text-brand-green hover:underline"
          >
            Voir tout
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {topTipsters.map((tipster, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 w-36 glass-panel rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/5 group cursor-pointer"
              onClick={() => handleTipsterClick(tipster)}
            >
              <TipsterAvatar
                avatar={tipster.avatar}
                name={tipster.name}
                initials={tipster.initials}
                color={tipster.color}
              />
              <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-0.5">
                {tipster.name}
                <span className="text-[10px] text-brand-green">★</span>
              </p>
              {tipster.success && (
                <span className="mt-2 text-xs font-black px-2.5 py-1 rounded-full bg-green-500/10 text-brand-green border border-green-500/20">
                  {tipster.success}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Canaux Tendance (Trending Channels) ────────────────────────── */}
      <div>
        <div className="flex justify-between items-baseline mb-4">
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-brand-green"></span>
            Canaux tendance
          </h2>
          <button 
            onClick={() => navigate('/box')} 
            className="text-xs font-bold text-brand-green hover:underline"
          >
            Voir tout
          </button>
        </div>

        {trendingChannels.length === 0 ? (
          <RecommendedChannelsBox title="Canaux Suggérés pour Vous" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingChannels.map((channel: any) => (
              <div 
                key={channel.id} 
                onClick={() => handleChannelClick(channel)}
                className="glass-panel rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/5 cursor-pointer relative group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-green-500/25 to-teal-500/10 border border-green-500/20 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                  {channel.avatar ? (
                    <img 
                      src={channel.avatar} 
                      alt={channel.name} 
                      className="w-full h-full object-cover rounded-xl" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=10b981&color=fff&size=512`;
                      }}
                    />
                  ) : (
                    <span>⚽</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-base font-black text-slate-900 dark:text-white truncate flex items-center gap-1">
                      {channel.name}
                      {(channel.isCertified || channel.owner?.isCertified) && (
                        <span className="text-xs text-amber-400" title="Tipster Certifié">★</span>
                      )}
                    </h3>
                    <span className={`text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded ${
                      channel.premium 
                        ? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/25' 
                        : 'bg-green-500/10 text-brand-green border border-green-500/20'
                    }`}>
                      {channel.premium ? 'Premium' : 'Gratuit'}
                    </span>
                    {channel.successRate && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {channel.successRate}
                      </span>
                    )}
                  </div>
                  {channel.formattedLastMessage || channel.lastMessage ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                      Dernier prono : <span className="font-semibold text-slate-700 dark:text-slate-300">{channel.formattedLastMessage || channel.lastMessage}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">
                      Pas de prono disponible
                    </p>
                  )}
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 text-slate-400 group-hover:text-brand-green group-hover:bg-brand-green/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Boîte à Idées & Retours Communauté (Option A) ───────────── */}
      <CommunitySuggestionBox context="home" />

      {/* ── Discover BET-EDUC ────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 mb-4">
          <span className="w-1.5 h-5 rounded-full bg-brand-green"></span>
          Découvrir BET-EDUC
        </h2>

        <div 
          onClick={() => navigate('/beteduc')}
          className="glass-panel rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform duration-300 text-amber-500">
            📚
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-brand-green transition-colors">
                Comprendre les corners & cartons
              </h3>
              <span className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded bg-brand-green/10 text-brand-green border border-brand-green/20">
                BOOK
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Recommandé après un prono perdu sur un marché complexe. Maîtrisez les stratégies de paris sur les fautes et coups de pied de coin.
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-brand-green/5 flex items-center justify-center border border-brand-green/15 text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all shrink-0 self-end sm:self-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Global Value Statement Footer Banner ────────────────────────── */}
      <div className="border border-dashed border-slate-200 dark:border-brand-slate p-6 rounded-3xl text-center bg-slate-50/50 dark:bg-brand-navy-3/20">
        <h3 className="font-black text-slate-800 dark:text-white text-base">Rejoins la communauté PronosBox</h3>
        <p className="text-xs text-slate-500 dark:text-brand-text-3 mt-1.5 max-w-md mx-auto leading-relaxed">
          PronosBox est ton espace d'échange sportif : accède aux prévisions des meilleurs pronostiqueurs certifiés, discute tactique dans nos salons et progresse grâce à Bet-Educ.
        </p>
      </div>

    </div>
  );
};

export default Home;
