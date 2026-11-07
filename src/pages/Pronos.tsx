import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PronoReactions } from '../components/predictions/PronoReactions';
import { AiPronoRecommendationsBox } from '../components/predictions/AiPronoRecommendationsBox';

const Pronos = () => {
  const [activeTab, setActiveTab] = useState<'gratuit' | 'premium'>('gratuit');
  const [pronos, setPronos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isAuthorizedPremium = user?.role === 'admin' || user?.isPro;

  const DEFAULT_CHANNEL_PRONOS: any[] = [];

  useEffect(() => {
    const fetchPronos = async () => {
      try {
        const res = await fetch('/api/pronos');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort((a, b) => {
            const timeA = new Date(a.matchDate || a.createdAt || 0).getTime();
            const timeB = new Date(b.matchDate || b.createdAt || 0).getTime();
            return (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA);
          });

          // Client-side deduplication guarantee
          const clean = (s: string) => String(s || '').replace(/[⚽🎯🏆💡]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().trim();
          const uniqueList: any[] = [];
          const seen = new Set<string>();

          for (const item of sorted) {
            const key = `${clean(item.homeTeamName)}_vs_${clean(item.awayTeamName)}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueList.push(item);
            } else {
              // Prefer verified (won/lost) over pending
              const idx = uniqueList.findIndex(p => `${clean(p.homeTeamName)}_vs_${clean(p.awayTeamName)}` === key);
              if (idx !== -1 && item.status !== 'pending' && uniqueList[idx].status === 'pending') {
                uniqueList[idx] = item;
              }
            }
          }

          setPronos(uniqueList);
        } else {
          setPronos(DEFAULT_CHANNEL_PRONOS);
        }
      } catch (err) {
        console.error("Error fetching pronos:", err);
        setPronos(DEFAULT_CHANNEL_PRONOS);
      } finally {
        setLoading(false);
      }
    };
    fetchPronos();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  return (
    <div className="flex flex-col space-y-6 max-w-4xl mx-auto pb-24">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Pronostics</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Découvrez nos analyses et pronostics d'experts</p>
        </div>
      </div>

      {/* ── Fused AI Recommendations & Gratuit/Premium Switcher (Option B) ── */}
      <AiPronoRecommendationsBox 
        pronos={pronos} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onSelectProno={(selectedProno) => {
          if (selectedProno.channelId) {
            navigate(`/channel/${selectedProno.channelId}`);
            return;
          }
          const targetId = `prono-${selectedProno._id || selectedProno.id}`;
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-brand-green');
            setTimeout(() => el.classList.remove('ring-2', 'ring-brand-green'), 2500);
          }
        }}
        className="mb-2" 
      />

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
        </div>
      ) : pronos.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          Aucun pronostic disponible pour le moment.
        </div>
      ) : activeTab === 'gratuit' ? (
        <div className="space-y-4">
          {pronos.filter(p => p.freeExpectedResult).map(prono => (
            <div 
              id={`prono-${prono._id || prono.id}`}
              key={prono._id || prono.id} 
              className="glass-panel p-4 sm:p-6 relative overflow-hidden group transition-all duration-300"
            >
              <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-500 ${
                prono.freeStatus === 'won' ? 'bg-brand-green' :
                prono.freeStatus === 'lost' ? 'bg-red-500' :
                'bg-amber-400 animate-pulse'
              }`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {prono.league || 'FOOTBALL'}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Match: {formatDate(prono.matchDate)}</span>
                    {prono.createdAt && (
                      <span className="text-xs text-slate-400 dark:text-slate-500 border-l border-slate-200 dark:border-slate-700 pl-2">
                        Publié le {formatDate(prono.createdAt)}
                      </span>
                    )}
                    {(prono.channelName || (prono.league && prono.league.startsWith('Canal '))) && (
                      <button
                        onClick={() => navigate(prono.channelId ? `/channel/${prono.channelId}` : '/box')}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-brand-green/10 text-brand-green border border-brand-green/20 hover:bg-brand-green/20 transition-all cursor-pointer"
                        title="Accéder au canal du tipster"
                      >
                        <span>📢</span>
                        <span>{prono.channelName ? `Canal ${prono.channelName}` : prono.league}</span>
                      </button>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {prono.homeLogo && <img src={prono.homeLogo} alt={prono.homeTeamName} className="w-5 h-5 object-contain" />}
                    {prono.homeTeamName} vs {prono.awayTeamName}
                    {prono.awayLogo && <img src={prono.awayLogo} alt={prono.awayTeamName} className="w-5 h-5 object-contain" />}
                  </h3>
                </div>
              </div>

              <div
                className={`rounded-xl p-4 mb-4 border backdrop-blur-sm transition-all duration-500 ${
                  prono.freeStatus === 'won'
                    ? 'bg-green-500/[0.07] dark:bg-green-500/10 border-green-500/25 shadow-[inset_0_1px_12px_rgba(34,197,94,0.10)]'
                    : prono.freeStatus === 'lost'
                    ? 'bg-red-500/[0.07] dark:bg-red-500/10 border-red-500/25 shadow-[inset_0_1px_12px_rgba(239,68,68,0.10)]'
                    : 'bg-amber-500/[0.05] dark:bg-amber-400/[0.07] border-amber-400/20 shadow-[inset_0_1px_12px_rgba(245,158,11,0.08)]'
                }`}
              >
                <p className="text-slate-700 dark:text-slate-300 font-medium">Pronostic Expert :</p>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className={`text-lg font-bold ${
                    prono.freeStatus === 'won' ? 'text-green-600 dark:text-green-400' :
                    prono.freeStatus === 'lost' ? 'text-red-500 dark:text-red-400 line-through decoration-2' :
                    'text-brand-green'
                  }`}>{prono.freeExpectedResult}</p>
                  <div className="sm:text-right">
                    <span className="text-sm text-slate-500 block mb-1">Confiance</span>
                    <div className={`inline-flex items-center justify-center rounded-lg px-3 py-1 font-bold border transition-colors duration-500 ${
                      prono.freeStatus === 'won' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' :
                      prono.freeStatus === 'lost' ? 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20' :
                      'bg-brand-green/10 text-brand-green border-brand-green/20'
                    }`}>
                      {prono.freeConfidence <= 5 ? (prono.freeConfidence || 4) * 20 : prono.freeConfidence}%
                    </div>
                  </div>
                </div>
              </div>

              {prono.freeStatus && prono.freeStatus !== 'pending' && (
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border mb-4 ${
                  prono.freeStatus === 'won' 
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' 
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                }`}>
                  <span className="text-base">{prono.freeStatus === 'won' ? '✅' : '❌'}</span>
                  <span>{prono.freeStatus === 'won' ? 'Pronostic Gagné' : 'Pronostic Perdu'}</span>
                  {prono.actualResult && <span className="font-black ml-auto">Score: {prono.actualResult}</span>}
                </div>
              )}
              {(!prono.freeStatus || prono.freeStatus === 'pending') && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border mb-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                  <span className="text-base">⏳</span>
                  <span>En attente du résultat</span>
                </div>
              )}
              
              {prono.freeObservation && 
               prono.freeObservation !== 'Publication Canal' && 
               !prono.freeObservation.startsWith('Publié dans le canal') && (
                <div className="mb-4 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    💡 Analyse / Note
                  </span>
                  <p>{prono.freeObservation}</p>
                </div>
              )}

              <PronoReactions 
                pronoId={prono._id || prono.id} 
                initialReactions={prono.reactions}
                onReactUpdated={(newReactions) => {
                  setPronos(prev => prev.map(p => (p._id === prono._id || p.id === prono.id) ? { ...p, reactions: newReactions } : p));
                }}
              />
            </div>
          ))}
          {pronos.filter(p => p.freeExpectedResult).length === 0 && (
            <div className="text-center py-10 text-slate-500">Aucun pronostic gratuit pour le moment.</div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {pronos.filter(p => p.premiumExpectedResult).map(prono => (
            <div 
              id={`prono-${prono._id || prono.id}`}
              key={prono._id || prono.id} 
              className="glass-panel p-4 sm:p-6 relative overflow-hidden transition-all duration-300"
            >
              <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-500 ${
                prono.premiumStatus === 'won' ? 'bg-gradient-to-b from-green-400 to-green-600' :
                prono.premiumStatus === 'lost' ? 'bg-gradient-to-b from-red-400 to-red-600' :
                'bg-gradient-to-b from-yellow-400 to-amber-500 animate-pulse'
              }`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">PREMIUM</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {prono.league || 'FOOTBALL'}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Match: {formatDate(prono.matchDate)}</span>
                    {prono.createdAt && (
                      <span className="text-xs text-slate-400 dark:text-slate-500 border-l border-slate-200 dark:border-slate-700 pl-2">
                        Publié le {formatDate(prono.createdAt)}
                      </span>
                    )}
                    {(prono.channelName || (prono.league && prono.league.startsWith('Canal '))) && (
                      <button
                        onClick={() => navigate(prono.channelId ? `/channel/${prono.channelId}` : '/box')}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
                        title="Accéder au canal du tipster"
                      >
                        <span>📢</span>
                        <span>{prono.channelName ? `Canal ${prono.channelName}` : prono.league}</span>
                      </button>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {prono.homeLogo && <img src={prono.homeLogo} alt={prono.homeTeamName} className="w-5 h-5 object-contain" />}
                    {prono.homeTeamName} vs {prono.awayTeamName}
                    {prono.awayLogo && <img src={prono.awayLogo} alt={prono.awayTeamName} className="w-5 h-5 object-contain" />}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 relative">
                {!isAuthorizedPremium && (
                  <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/40 dark:bg-slate-900/50 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500 mb-2 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Contenu Premium</h4>
                    {user ? (
                      <button onClick={() => navigate('/compare-accounts')} className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95">
                        Débloquer le pronostic
                      </button>
                    ) : (
                      <button onClick={() => navigate(`/auth?mode=register&redirect=${encodeURIComponent(window.location.pathname)}`)} className="bg-gradient-to-r from-brand-green to-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-95">
                        S'inscrire pour débloquer
                      </button>
                    )}
                  </div>
                )}
                <div className={`rounded-xl p-4 backdrop-blur-sm transition-all duration-500 ${
                  prono.premiumStatus === 'won'
                    ? 'bg-green-500/[0.07] dark:bg-green-500/10 border border-green-500/25 shadow-[inset_0_1px_12px_rgba(34,197,94,0.10)]'
                    : prono.premiumStatus === 'lost'
                    ? 'bg-red-500/[0.07] dark:bg-red-500/10 border border-red-500/25 shadow-[inset_0_1px_12px_rgba(239,68,68,0.10)]'
                    : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50'
                } ${!isAuthorizedPremium ? 'opacity-20 blur-sm select-none' : ''}`}>
                  <p className="text-sm text-slate-500 mb-1">Résultat attendu</p>
                  <p className={`text-lg font-bold ${
                    prono.premiumStatus === 'won' ? 'text-green-600 dark:text-green-400' :
                    prono.premiumStatus === 'lost' ? 'text-red-500 dark:text-red-400 line-through decoration-2' :
                    'text-slate-900 dark:text-white'
                  }`}>{prono.premiumExpectedResult}</p>
                </div>
                <div className={`rounded-xl p-4 flex justify-between items-center backdrop-blur-sm transition-all duration-500 ${
                  prono.premiumStatus === 'won'
                    ? 'bg-green-500/[0.07] dark:bg-green-500/10 border border-green-500/25 shadow-[inset_0_1px_12px_rgba(34,197,94,0.10)]'
                    : prono.premiumStatus === 'lost'
                    ? 'bg-red-500/[0.07] dark:bg-red-500/10 border border-red-500/25 shadow-[inset_0_1px_12px_rgba(239,68,68,0.10)]'
                    : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50'
                } ${!isAuthorizedPremium ? 'opacity-20 blur-sm select-none' : ''}`}>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Cote & Confiance</p>
                    <p className="text-lg font-bold text-amber-500">@ {prono.premiumOdds ? prono.premiumOdds.toFixed(2) : '-'}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 text-sm font-bold text-slate-900 dark:text-white transition-all duration-500 ${
                    prono.premiumStatus === 'won' ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' :
                    prono.premiumStatus === 'lost' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                    'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  }`}>
                    {prono.premiumConfidence <= 5 ? (prono.premiumConfidence || 4) * 20 : prono.premiumConfidence}%
                  </div>
                </div>
              </div>

              {prono.premiumObservation && 
               prono.premiumObservation !== 'Publication Canal' && 
               prono.premiumObservation !== 'Publication Canal Premium' && 
               !prono.premiumObservation.startsWith('Publié dans le canal') && (
                <div className={`bg-amber-500/5 rounded-xl p-4 border border-amber-500/10 ${!isAuthorizedPremium ? 'opacity-20 blur-sm select-none' : ''}`}>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">Observation Détaillée</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                    {prono.premiumObservation}
                  </p>
                </div>
              )}

              {prono.status && prono.status !== 'pending' && (
                <div className={`mx-4 mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border ${
                  prono.status === 'won' 
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' 
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                }`}>
                  <span className="text-base">{prono.status === 'won' ? '✅' : '❌'}</span>
                  <span>{prono.status === 'won' ? 'Pronostic Gagné' : 'Pronostic Perdu'}</span>
                  {prono.actualResult && <span className="font-black ml-auto">Score: {prono.actualResult}</span>}
                </div>
              )}
              {(!prono.status || prono.status === 'pending') && (
                <div className="mx-4 mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                  <span className="text-base">⏳</span>
                  <span>En attente du résultat</span>
                </div>
              )}

              <PronoReactions 
                pronoId={prono._id || prono.id} 
                initialReactions={prono.reactions}
                onReactUpdated={(newReactions) => {
                  setPronos(prev => prev.map(p => (p._id === prono._id || p.id === prono.id) ? { ...p, reactions: newReactions } : p));
                }}
              />
            </div>
          ))}
          {pronos.filter(p => p.premiumExpectedResult).length === 0 && (
            <div className="text-center py-10 text-slate-500">Aucun pronostic premium pour le moment.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Pronos;
