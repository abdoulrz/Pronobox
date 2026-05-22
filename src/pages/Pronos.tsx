import { useState, useEffect } from 'react';

const Pronos = () => {
  const [activeTab, setActiveTab] = useState<'gratuit' | 'premium'>('gratuit');
  const [pronos, setPronos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPronos = async () => {
      try {
        const res = await fetch('/api/pronos');
        const data = await res.json();
        setPronos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching pronos:", err);
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
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-green"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {prono.league || 'FOOTBALL'}
                    </span>
                    <span className="text-xs text-slate-500">{formatDate(prono.matchDate)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {prono.homeLogo && <img src={prono.homeLogo} alt={prono.homeTeamName} className="w-5 h-5 object-contain" />}
                    {prono.homeTeamName} vs {prono.awayTeamName}
                    {prono.awayLogo && <img src={prono.awayLogo} alt={prono.awayTeamName} className="w-5 h-5 object-contain" />}
                  </h3>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-100 dark:border-slate-700/50">
                <p className="text-slate-700 dark:text-slate-300 font-medium">Pronostic Expert :</p>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-lg font-bold text-brand-green">{prono.freeExpectedResult}</p>
                  <div className="sm:text-right">
                    <span className="text-sm text-slate-500 block mb-1">Confiance</span>
                    <div className="inline-flex items-center justify-center bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-lg px-3 py-1 font-bold">
                      {prono.freeConfidence}%
                    </div>
                  </div>
                </div>
              </div>
              
              {prono.freeObservation && (
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                  {prono.freeObservation}
                </p>
              )}
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
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-400 to-amber-500"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">PREMIUM</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {prono.league || 'FOOTBALL'}
                    </span>
                    <span className="text-xs text-slate-500">{formatDate(prono.matchDate)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {prono.homeLogo && <img src={prono.homeLogo} alt={prono.homeTeamName} className="w-5 h-5 object-contain" />}
                    {prono.homeTeamName} vs {prono.awayTeamName}
                    {prono.awayLogo && <img src={prono.awayLogo} alt={prono.awayTeamName} className="w-5 h-5 object-contain" />}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                  <p className="text-sm text-slate-500 mb-1">Résultat attendu</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{prono.premiumExpectedResult}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Cote & Confiance</p>
                    <p className="text-lg font-bold text-amber-500">@ {prono.premiumOdds ? prono.premiumOdds.toFixed(2) : '-'}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full flex items-center justify-center border-4 border-amber-500 text-sm font-bold text-slate-900 dark:text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    {prono.premiumConfidence}%
                  </div>
                </div>
              </div>

              {prono.premiumObservation && (
                <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/10">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">Observation Détaillée</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                    {prono.premiumObservation}
                  </p>
                </div>
              )}
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
