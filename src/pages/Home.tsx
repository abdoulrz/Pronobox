import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChannelData } from '../contexts/ChannelContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { channelData, navigateToChannel } = useChannelData();

  // Mock list of top pronostiqueurs matching the mockups
  const topTipsters = [
    { name: 'Karim.D', success: '64%', initials: 'KD', color: 'bg-green-600/20 text-brand-green border-brand-green/30' },
    { name: 'Aicha.S', success: '59%', initials: 'AS', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
    { name: 'Moussa.B', success: '61%', initials: 'MB', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30' }
  ];

  // Try to find matching real channels from database or use mock fallbacks
  const mockChannels = [
    {
      id: 'mock-1',
      name: 'Foot Expert CAF',
      description: 'Analyses exclusives sur les compétitions africaines',
      premium: true,
      lastMessage: 'Al Ahly — Victoire (✅ gagné)'
    },
    {
      id: 'mock-2',
      name: 'BTTS Masters',
      description: 'Les meilleures opportunités "Les deux équipes marquent"',
      premium: false,
      lastMessage: 'PSG vs OM — BTTS Oui'
    }
  ];

  // Map trending channels combining DB channels and mockup channels
  const trendingChannels = React.useMemo(() => {
    const dbChannels = channelData?.channels || [];
    // Inject mock channels if they do not exist in DB
    const merged = [...dbChannels];
    
    mockChannels.forEach(mc => {
      const exists = dbChannels.some(dc => dc.name.toLowerCase() === mc.name.toLowerCase());
      if (!exists) {
        merged.push({
          id: mc.id,
          name: mc.name,
          description: mc.description,
          premium: mc.premium,
          joined: false,
          lastMessage: mc.lastMessage,
          avatar: '',
          price: mc.premium ? 9.99 : 0,
          pinned: false,
          members: 142,
          messages: [],
          category: mc.premium ? 'premium' : 'free',
          owner: { id: 'admin', username: 'Admin', avatar: '' }
        });
      }
    });

    return merged.slice(0, 3); // Display up to 3 trending channels
  }, [channelData]);

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
              onClick={() => navigate('/box')}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg border-2 shadow-inner mb-3 transition-transform duration-300 group-hover:scale-105 ${tipster.color}`}>
                {tipster.initials}
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-0.5">
                {tipster.name}
                <span className="text-[10px] text-brand-green">★</span>
              </p>
              <span className="mt-2 text-xs font-black px-2.5 py-1 rounded-full bg-green-500/10 text-brand-green border border-green-500/20">
                {tipster.success} réussite
              </span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trendingChannels.map((channel: any) => (
            <div 
              key={channel.id} 
              onClick={() => handleChannelClick(channel)}
              className="glass-panel rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/5 cursor-pointer relative group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-green-500/25 to-teal-500/10 border border-green-500/20 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform duration-300">
                {channel.avatar ? (
                  <img src={channel.avatar} alt={channel.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span>⚽</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                    {channel.name}
                  </h3>
                  {channel.premium && (
                    <span className="text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-gold/15 text-brand-gold border border-brand-gold/25">
                      Premium
                    </span>
                  )}
                </div>
                {channel.lastMessage && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                    Dernier prono : <span className="font-semibold text-slate-700 dark:text-slate-300">{channel.lastMessage}</span>
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
      </div>

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
        <h3 className="font-black text-slate-800 dark:text-white text-base">Rejoins l'élite des parieurs</h3>
        <p className="text-xs text-slate-500 dark:text-brand-text-3 mt-1.5 max-w-md mx-auto leading-relaxed">
          PronosBox est ton espace d'échange sportif : accède aux prévisions des meilleurs pronostiqueurs certifiés, discute tactique dans nos salons et progresse grâce à Bet-Educ.
        </p>
      </div>

    </div>
  );
};

export default Home;
