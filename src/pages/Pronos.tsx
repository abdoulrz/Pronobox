import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PronoReactions } from '../components/predictions/PronoReactions';

const Pronos = () => {
  const [activeTab, setActiveTab] = useState<'gratuit' | 'premium'>('gratuit');
  const [pronos, setPronos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isAuthorizedPremium = user?.role === 'admin' || user?.isPro;

  const DEFAULT_CHANNEL_PRONOS = [
    {
      _id: "ch_msg_caracas_santa_fe",
      matchId: 1001,
      homeTeamName: "Caracas FC",
      awayTeamName: "Santa Fe",
      league: "Canal DOOOBI 🤑",
      matchDate: new Date("2026-07-31T12:45:00.000Z"),
      freeExpectedResult: "Oui (Les 2 marquent)",
      freeConfidence: 80,
      freeObservation: "ON est prêt",
      status: "pending",
      freeStatus: "pending",
      createdAt: new Date("2026-07-31T12:45:00.000Z")
    },
    {
      _id: "ch_msg_forward_chattanooga",
      matchId: 1002,
      homeTeamName: "Forward Madison",
      awayTeamName: "Chattanooga Red Wolves",
      league: "Canal Talakaka Pro",
      matchDate: new Date("2026-07-30T12:45:00.000Z"),
      freeExpectedResult: "Plus de 1.5 buts",
      freeConfidence: 80,
      freeObservation: "À revoir",
      status: "pending",
      freeStatus: "pending",
      createdAt: new Date("2026-07-30T12:45:00.000Z")
    }
  ];

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
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pronostics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Découvrez nos analyses et pronostics d'experts</p>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-xs w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('gratuit')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
              activeTab === 'gratuit'
                ? 'bg-white dark:bg-slate-700 text-brand-green shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Gratuit
          </button>
          <button
            onClick={() => setActiveTab('premium')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
              activeTab === 'premium'
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l0 .001c.023.023.054.045.085.068.106.079.256.173.435.267.356.188.852.41 1.411.602 1.119.383 2.508.683 4.02.683a1 1 0 010 2c-1.282 0-2.483-.243-3.46-.566-.487-.16-.91-.341-1.25-.526a4.896 4.896 0 01-.482-.295c-.066-.046-.118-.088-.152-.116l-.014-.01a1 1 0 01-1.298-1.416l-.001-.001c-.023-.023-.054-.045-.085-.068-.106-.079-.256-.173-.435-.267-.356-.188-.852-.41-1.411-.602C10.51 3.559 9.121 3.259 7.61 3.259a1 1 0 010-2c1.282 0 2.483.243 3.46.566.487.16.91.341 1.25.526.178.098.342.198.482.295.066.046.118.088.152.116l.014.01A1 1 0 0112 2zM7.61 17.259c1.51 0 2.899-.3 4.019-.683.56-.192 1.055-.414 1.411-.602.179-.094.329-.188.435-.267.031-.023.062-.045.085-.068l.001-.001a1 1 0 011.416 1.416l-.01.014c-.028.034-.07.086-.116.152-.097.14-.197.304-.295.482-.185.34-.366.763-.526 1.25-.323.977-.566 2.178-.566 3.46a1 1 0 01-2 0c0-1.512-.3-2.901-.683-4.02-.192-.56-.414-1.055-.602-1.411a7.712 7.712 0 00-.267-.435c-.023-.031-.045-.062-.068-.085l-.001-.001a1 1 0 01-1.416-1.416l.01-.014c.034-.028.086-.07.152-.116.14-.097.304-.197.482-.295.34-.185.763-.366 1.25-.526.977-.323 2.178-.566 3.46-.566a1 1 0 010 2z" clipRule="evenodd" />
            </svg>
            Premium
          </button>
        </div>
      </div>

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
            <div key={prono._id || prono.id} className="glass-panel p-6 relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-500 ${
                prono.freeStatus === 'won' ? 'bg-brand-green' :
                prono.freeStatus === 'lost' ? 'bg-red-500' :
                'bg-amber-400 animate-pulse'
              }`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {prono.league || 'FOOTBALL'}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Match: {formatDate(prono.matchDate)}</span>
                    {prono.createdAt && (
                      <span className="text-xs text-slate-400 dark:text-slate-500 border-l border-slate-200 dark:border-slate-700 pl-2">
                        Publié le {formatDate(prono.createdAt)}
                      </span>
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
              
              {prono.freeObservation && (
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                  {prono.freeObservation}
                </p>
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
            <div key={prono._id || prono.id} className="glass-panel p-6 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-500 ${
                prono.premiumStatus === 'won' ? 'bg-gradient-to-b from-green-400 to-green-600' :
                prono.premiumStatus === 'lost' ? 'bg-gradient-to-b from-red-400 to-red-600' :
                'bg-gradient-to-b from-yellow-400 to-amber-500 animate-pulse'
              }`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
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

              {prono.premiumObservation && (
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
