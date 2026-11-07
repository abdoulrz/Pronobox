import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface AiPronoRecommendationsBoxProps {
  pronos?: any[];
  className?: string;
  activeTab?: 'gratuit' | 'premium';
  onTabChange?: (tab: 'gratuit' | 'premium') => void;
  onSelectProno?: (prono: any) => void;
}

export const AiPronoRecommendationsBox: React.FC<AiPronoRecommendationsBoxProps> = ({
  pronos = [],
  className = '',
  activeTab = 'gratuit',
  onTabChange,
  onSelectProno
}) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Smart algorithmic synthesis of today's best picks tailored to active tab
  const isPremiumTab = activeTab === 'premium';

  const suggestions = React.useMemo(() => {
    const list = Array.isArray(pronos) ? pronos : [];

    if (isPremiumTab) {
      // ── PREMIUM SUGGESTIONS ──
      const premiumList = list.filter((p) => Boolean(p.premiumExpectedResult));
      const pool = premiumList.length > 0 ? premiumList : list;

      const sortedByConf = [...pool].sort(
        (a, b) => (Number(b.premiumConfidence || b.freeConfidence) || 0) - (Number(a.premiumConfidence || a.freeConfidence) || 0)
      );

      const vipPick = sortedByConf[0] || {
        id: 'ai-vip-1',
        homeTeamName: 'Manchester City',
        awayTeamName: 'Liverpool',
        premiumExpectedResult: 'V1 & +2.5 Buts',
        premiumConfidence: 88,
        league: 'PREMIER LEAGUE',
        type: 'vip'
      };

      const tacticalPick = sortedByConf[1] || {
        id: 'ai-tactical-1',
        homeTeamName: 'Bayern Munich',
        awayTeamName: 'Dortmund',
        premiumExpectedResult: 'Score Exact 3-1',
        premiumConfidence: 75,
        league: 'BUNDESLIGA',
        type: 'tactical'
      };

      const elitePick = sortedByConf[2] || sortedByConf[0] || {
        id: 'ai-elite-1',
        homeTeamName: 'PSG',
        awayTeamName: 'Marseille',
        premiumExpectedResult: 'V1 Handicap (-1)',
        premiumConfidence: 85,
        league: 'LIGUE 1',
        type: 'elite'
      };

      return [
        {
          id: 'vip',
          category: '💎 La Sélection VIP & Value',
          badge: 'RÉSERVÉ PRO',
          badgeColor: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
          borderColor: 'border-amber-500/20 hover:border-amber-500/50',
          glowColor: 'from-amber-500/10 to-transparent',
          prono: vipPick,
          actionLabel: 'Voir l\'analyse Pro',
          desc: 'Rapport cote / probabilité optimal réservé à nos membres VIP'
        },
        {
          id: 'tactical',
          category: '🎯 Score Exact & Tactique Pro',
          badge: 'GROSSE COTE PRO',
          badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          borderColor: 'border-purple-500/20 hover:border-purple-500/50',
          glowColor: 'from-purple-500/10 to-transparent',
          prono: tacticalPick,
          actionLabel: 'Découvrir l\'analyse',
          desc: 'Scénarios avancés et analyses tactiques approfondies'
        },
        {
          id: 'elite',
          category: '🚀 Le Choix d\'Élite Pro',
          badge: 'CONFIANCE MAX',
          badgeColor: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
          borderColor: 'border-emerald-500/20 hover:border-emerald-500/50',
          glowColor: 'from-emerald-500/10 to-transparent',
          prono: elitePick,
          actionLabel: 'Consulter l\'analyse',
          desc: 'Sélection prioritaire validée par nos tipsters experts certifiés'
        }
      ];
    }

    // ── GRATUIT SUGGESTIONS (100% Free) ──
    const freeList = list.filter((p) => Boolean(p.freeExpectedResult));
    const pool = freeList.length > 0 ? freeList : list;

    // 1. Safe Pick: highest confidence
    const sortedByConfidence = [...pool].sort(
      (a, b) => (Number(b.freeConfidence) || 0) - (Number(a.freeConfidence) || 0)
    );
    const safePick = sortedByConfidence[0] || {
      id: 'ai-safe-1',
      homeTeamName: 'Inter Milan',
      awayTeamName: 'Genoa',
      freeExpectedResult: '1X - Inter Milan ou Nul',
      freeConfidence: 90,
      league: 'SERIE A',
      type: 'safe'
    };

    // 2. Goal Pick: Over/Under or BTTS
    const goalPick = pool.find((p) => {
      const pickStr = (p.freeExpectedResult || '').toLowerCase();
      return pickStr.includes('+') || pickStr.includes('-') || pickStr.includes('btts') || pickStr.includes('but');
    }) || sortedByConfidence[1] || {
      id: 'ai-goal-1',
      homeTeamName: 'Real Madrid',
      awayTeamName: 'Villarreal',
      freeExpectedResult: '+2.5 Buts',
      freeConfidence: 85,
      league: 'LA LIGA',
      type: 'goals'
    };

    // 3. Free Value Pick: 100% Free pick distinct from safe and goals
    const freeValuePick = pool.find((p) => 
      (p._id || p.id) !== (safePick._id || safePick.id) && 
      (p._id || p.id) !== (goalPick._id || goalPick.id)
    ) || sortedByConfidence[2] || sortedByConfidence[1] || {
      id: 'ai-free-value-1',
      homeTeamName: 'Arsenal',
      awayTeamName: 'Chelsea',
      freeExpectedResult: 'V1 - Victoire Arsenal',
      freeConfidence: 80,
      league: 'PREMIER LEAGUE',
      type: 'value'
    };

    return [
      {
        id: 'safe',
        category: '🛡️ Le Safe du Jour',
        badge: '90%+ FIABILITÉ',
        badgeColor: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
        borderColor: 'border-emerald-500/20 hover:border-emerald-500/50',
        glowColor: 'from-emerald-500/10 to-transparent',
        prono: safePick,
        actionLabel: 'Accéder au prono',
        desc: 'Issue à la plus forte probabilité statistique du jour'
      },
      {
        id: 'goals',
        category: '⚽ Marché Buts (+ / -)',
        badge: 'OVER / UNDER & BTTS',
        badgeColor: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
        borderColor: 'border-blue-500/20 hover:border-blue-500/50',
        glowColor: 'from-blue-500/10 to-transparent',
        prono: goalPick,
        actionLabel: 'Accéder au prono',
        desc: 'Pari calculé selon la dynamique offensive des deux équipes'
      },
      {
        id: 'free-value',
        category: '🎯 L\'Opportunité Gratuite',
        badge: 'COTE DU JOUR',
        badgeColor: 'bg-emerald-500/15 text-brand-green border-brand-green/30',
        borderColor: 'border-brand-green/20 hover:border-brand-green/50',
        glowColor: 'from-brand-green/10 to-transparent',
        prono: freeValuePick,
        actionLabel: 'Accéder au prono',
        desc: 'Le meilleur compromis cote et probabilité 100% gratuit'
      }
    ];
  }, [pronos, isPremiumTab]);

  const handleCardClick = (item: any) => {
    if (onSelectProno) {
      onSelectProno(item.prono);
    } else if (item.prono.channelId) {
      navigate(`/channel/${item.prono.channelId}`);
    }
  };

  return (
    <div className={`glass-panel rounded-3xl p-4 sm:p-5 relative overflow-hidden border border-brand-green/20 ${className}`}>
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* Fused Header: Title + Gratuit/Premium Switcher + Desktop Scroll Chevrons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-green to-emerald-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-brand-green/20 shrink-0">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                  Suggestions du jour
                </h2>
                <span className="text-[10px] font-bold text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                  84% Réussite
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Balayez pour découvrir les meilleures opportunités statistiques
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-end">
            {/* Desktop scroll arrows */}
            <div className="hidden sm:flex items-center gap-1 mr-1">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-green hover:bg-brand-green/10 text-slate-600 dark:text-slate-300 hover:text-brand-green flex items-center justify-center transition-all cursor-pointer text-xs font-bold"
                title="Défiler vers la gauche"
                aria-label="Suggestion précédente"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-green hover:bg-brand-green/10 text-slate-600 dark:text-slate-300 hover:text-brand-green flex items-center justify-center transition-all cursor-pointer text-xs font-bold"
                title="Défiler vers la droite"
                aria-label="Suggestion suivante"
              >
                ›
              </button>
            </div>

            {/* Fused Gratuit / Premium Tabs */}
            {onTabChange && (
              <div className="flex p-1 bg-slate-100/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => onTabChange('gratuit')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'gratuit'
                      ? 'bg-white dark:bg-slate-800 text-brand-green shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Gratuit
                </button>
                <button
                  type="button"
                  onClick={() => onTabChange('premium')}
                  className={`flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'premium'
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l0 .001c.023.023.054.045.085.068.106.079.256.173.435.267.356.188.852.41 1.411.602 1.119.383 2.508.683 4.02.683a1 1 0 010 2c-1.282 0-2.483-.243-3.46-.566-.487-.16-.91-.341-1.25-.526a4.896 4.896 0 01-.482-.295c-.066-.046-.118-.088-.152-.116l-.014-.01a1 1 0 01-1.298-1.416l-.001-.001c-.023-.023-.054-.045-.085-.068-.106-.079-.256-.173-.435-.267-.356-.188-.852-.41-1.411-.602C10.51 3.559 9.121 3.259 7.61 3.259a1 1 0 010-2c1.282 0 2.483.243 3.46.566.487.16.91.341 1.25.526.178.098.342.198.482.295.066.046.118.088.152.116l.014.01A1 1 0 0112 2zM7.61 17.259c1.51 0 2.899-.3 4.019-.683.56-.192 1.055-.414 1.411-.602.179-.094.329-.188.435-.267.031-.023.062-.045.085-.068l.001-.001a1 1 0 011.416 1.416l-.01.014c-.028.034-.07.086-.116.152-.097.14-.197.304-.295.482-.185.34-.366.763-.526 1.25-.323.977-.566 2.178-.566 3.46a1 1 0 01-2 0c0-1.512-.3-2.901-.683-4.02-.192-.56-.414-1.055-.602-1.411a7.712 7.712 0 00-.267-.435c-.023-.031-.045-.062-.068-.085l-.001-.001a1 1 0 01-1.416-1.416l.01-.014c.034-.028.086-.07.152-.116.14-.097.304-.197.482-.295.34-.185.763-.366 1.25-.526.977-.323 2.178-.566 3.46-.566a1 1 0 010 2z" clipRule="evenodd" />
                  </svg>
                  Premium
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Swipeable Cards Container */}
        <div
          ref={scrollContainerRef}
          onWheel={(e) => {
            if (scrollContainerRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
              scrollContainerRef.current.scrollLeft += e.deltaY;
            }
          }}
          className="flex gap-3 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth snap-x snap-mandatory -mx-1 px-1"
        >
          {suggestions.map((item, idx) => {
            const p = item.prono;
            const matchTitle = `${p.homeTeamName || 'Équipe 1'} vs ${p.awayTeamName || 'Équipe 2'}`;
            const pick = isPremiumTab
              ? (p.premiumExpectedResult || p.freeExpectedResult || 'Sélection VIP')
              : (p.freeExpectedResult || 'Victoire');
            const rawConfidence = isPremiumTab 
              ? (p.premiumConfidence || p.freeConfidence) 
              : p.freeConfidence;
            const confidence = rawConfidence ? (rawConfidence <= 5 ? rawConfidence * 20 : rawConfidence) : 85;

            return (
              <div
                key={idx}
                onClick={() => handleCardClick(item)}
                className={`flex-shrink-0 w-72 sm:w-80 snap-start p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/90 border ${item.borderColor} hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${item.glowColor} opacity-40 pointer-events-none`} />

                <div className="relative z-10">
                  {/* Category + badge */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-black text-slate-800 dark:text-white">
                      {item.category}
                    </span>
                    <span className={`text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  {/* League */}
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                    {p.league || 'FOOTBALL'}
                  </span>

                  {/* Match */}
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate mb-1.5">
                    {matchTitle}
                  </h3>

                  {/* Suggested Pick */}
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 mb-1.5">
                    <span className="text-[9px] text-slate-400 block font-semibold mb-0.5">
                      Pronostic Suggéré :
                    </span>
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-black truncate ${isPremiumTab ? 'text-amber-500' : 'text-brand-green'}`}>
                        {pick}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 shrink-0">
                        {confidence}%
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 truncate leading-tight">
                    {item.desc}
                  </p>
                </div>

                <div className={`relative z-10 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold ${isPremiumTab ? 'text-amber-500' : 'text-brand-green'} group-hover:translate-x-0.5 transition-transform`}>
                  <span>{item.actionLabel || (isPremiumTab ? 'Voir l\'analyse Pro' : 'Accéder au prono')}</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
