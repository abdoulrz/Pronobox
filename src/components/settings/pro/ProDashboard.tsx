import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { DynamicWidthBar } from '../../common/DynamicWidthBar';

interface ProDashboardProps {
  user: any;
  userChannels: any[];
}

export const ProDashboard: React.FC<ProDashboardProps> = ({ user, userChannels }) => {
  const [showHabilitationInfo, setShowHabilitationInfo] = useState(false);

  const totalSubscriptions = userChannels.reduce((sum, c) => sum + (c.subscriptions || 0), 0);
  const totalRevenue = userChannels.reduce((sum, c) => sum + (c.revenue || 0), 0);

  const proStats = {
    successRate: userChannels.length > 0 ? 
      userChannels.reduce((sum, c) => sum + (c.performance?.accuracy || 0), 0) / userChannels.length : 0,
    habilitationLevel: user?.isPro || user?.accountType === 'tipster' ? 4 : 0,
    totalPredictions: userChannels.reduce((sum, c) => sum + (c.topContent?.length || 0), 0),
    totalEarnings: totalRevenue,
    averageOdds: 1.85,
    bestStreak: 8,
    avgMonthlyRevenue: totalRevenue / (userChannels.length || 1),
    rankingPosition: 42
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-300">
            Tableau de bord Tipster
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Aperçu de vos performances et revenus</p>
        </div>
        
        <div className="self-start sm:self-auto bg-white/40 dark:bg-gray-800/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-sm flex items-center gap-3 relative">
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
            Niveau d'habilitation
            <button
              onClick={() => setShowHabilitationInfo(!showHabilitationInfo)}
              className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-emerald-500 hover:text-white text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer"
              title="Qu'est-ce que le niveau d'habilitation ?"
            >
              ℹ️
            </button>
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div 
                key={level} 
                className={`w-2 h-5 sm:h-6 rounded-full transition-all duration-500 ${level <= proStats.habilitationLevel ? 'bg-gradient-to-t from-green-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-200 dark:bg-gray-700'}`}
              />
            ))}
          </div>

          {/* Habilitation Info Modal using React Portal to escape all stacking contexts */}
          {showHabilitationInfo && createPortal(
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setShowHabilitationInfo(false)}
            >
              <div 
                className="bg-slate-900 border border-emerald-500/50 text-white p-5 sm:p-6 rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-4 relative text-left"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md pt-1 pb-3 flex justify-between items-center border-b border-slate-800 z-10">
                  <h3 className="font-extrabold text-sm sm:text-base text-emerald-400 flex items-center gap-2">
                    <span>🛡️</span> Niveau d'Habilitation ({proStats.habilitationLevel}/5)
                  </h3>
                  <button 
                    onClick={() => setShowHabilitationInfo(false)} 
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Le <strong className="text-white font-bold">Niveau d'Habilitation</strong> mesure la confiance, la régularité et la précision de vos pronostics certifiés sur PronosBox.
                </p>

                <div className="space-y-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-left">
                    <div className="font-bold text-xs text-emerald-400 mb-1 flex items-center gap-1.5">
                      <span>🌱</span> Niveau 1 - 2 (Tipster Initial)
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Accès standard : 1 canal gratuit + 1 canal premium. Limité à 3 débats / 24h.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-left">
                    <div className="font-bold text-xs text-emerald-400 mb-1 flex items-center gap-1.5">
                      <span>⭐</span> Niveau 3 - 4 (Tipster Vérifié)
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Badge Tipster vérifié certifié + retraits prioritaires de revenus d'abonnements.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-left">
                    <div className="font-bold text-xs text-emerald-400 mb-1 flex items-center gap-1.5">
                      <span>👑</span> Niveau 5 (Tipster Master / Partenaire)
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Mise en avant sur la page d'accueil (Top pronostiqueurs), canaux illimités et support VIP.
                    </p>
                  </div>
                </div>

                <div className="pt-2 sticky bottom-0 bg-slate-900/95 backdrop-blur-md pb-1">
                  <button
                    onClick={() => setShowHabilitationInfo(false)}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Taux de réussite', value: `${proStats.successRate.toFixed(1)}%`, icon: '🎯', color: 'from-blue-500 to-cyan-400' },
          { label: 'Abonnés totaux', value: totalSubscriptions, icon: '👥', color: 'from-purple-500 to-pink-400' },
          { label: 'Canaux actifs', value: userChannels.length, icon: '📺', color: 'from-orange-500 to-amber-400' },
          { label: 'Revenus totaux', value: `${totalRevenue.toFixed(2)}€`, icon: '💰', color: 'from-green-500 to-emerald-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/40 dark:border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">
              {stat.value}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Performance Card */}
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl border border-white/40 dark:border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-2xl">📈</span> Performance détaillée
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Progress Bar Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Précision Globale</span>
              <span className="text-2xl font-black text-green-500">{proStats.successRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
              <DynamicWidthBar
                progress={proStats.successRate}
                className="bg-gradient-to-r from-green-500 to-emerald-400 h-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">Basé sur vos {proStats.totalPredictions} derniers pronostics certifiés.</p>
          </div>

          {/* Mini Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/50 dark:bg-gray-700/50 rounded-2xl p-4 border border-white/50 dark:border-gray-600/50">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-semibold">Cote Moyenne</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{proStats.averageOdds}</div>
             </div>
             <div className="bg-white/50 dark:bg-gray-700/50 rounded-2xl p-4 border border-white/50 dark:border-gray-600/50">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-semibold">Série de victoires</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  {proStats.bestStreak} <span className="text-orange-500 text-sm">🔥</span>
                </div>
             </div>
             <div className="bg-white/50 dark:bg-gray-700/50 rounded-2xl p-4 border border-white/50 dark:border-gray-600/50">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-semibold">Pronostics publiés</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{proStats.totalPredictions}</div>
             </div>
             <div className="bg-white/50 dark:bg-gray-700/50 rounded-2xl p-4 border border-white/50 dark:border-gray-600/50">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-semibold">Classement Pro</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white text-blue-500">#{proStats.rankingPosition}</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
