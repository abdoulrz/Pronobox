import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UnifiedPaymentModal from '../payment/UnifiedPaymentModal';
import { markdownToHtml } from '../../utils/markdownToHtml';

interface MatchPronosticsProps {
  matchId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeLogo: string;
  awayLogo: string;
}

const MatchPronostics: React.FC<MatchPronosticsProps> = ({ matchId, homeTeamName, awayTeamName, homeLogo, awayLogo }) => {
  const { user } = useAuth();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [prono, setProno] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handlePremiumClick = () => {
    if (!user) {
      const redirectUrl = encodeURIComponent(window.location.pathname);
      window.location.href = `/auth?mode=register&redirect=${redirectUrl}`;
    } else if (user.isPro || user.role === 'admin') {
      setShowPremiumModal(true);
    } else {
      setShowPaymentModal(true);
    }
  };

  React.useEffect(() => {
    const fetchProno = async () => {
      if (!matchId) return;
      try {
        setLoading(true);
        console.log(`Fetching prediction for match: ${matchId}`);
        const res = await fetch(`/api/pronos/${matchId}`);
        
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            setProno(data);
          } else {
            console.log("Prono data incomplete:", data);
            setProno(null);
          }
        } else {
          console.log(`Prono not found or error (Status: ${res.status})`);
          setProno(null);
        }
      } catch (err) {
        console.error("Error fetching prono:", err);
        setProno(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProno();
  }, [matchId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-brand-navy-2 rounded-2xl border border-slate-100 dark:border-brand-slate animate-pulse">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-brand-navy-3 mb-4"></div>
      <div className="h-4 w-32 bg-slate-100 dark:bg-brand-navy-3 rounded"></div>
    </div>
  );

  if (!prono) return (
    <div className="p-8 text-center bg-white dark:bg-brand-navy-2 rounded-2xl border border-dashed border-slate-200 dark:border-brand-slate">
      <p className="text-sm text-slate-400 italic">Aucun pronostic disponible pour ce match pour le moment.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* FREE VERIFICATION STATUS BANNER */}
      {prono.freeStatus && prono.freeStatus !== 'pending' && (
        <div className={`rounded-2xl p-4 flex items-center justify-between border mb-4 ${
          prono.freeStatus === 'won'
            ? 'bg-green-500/10 border-green-500/20'
            : 'bg-red-500/10 border-red-500/20'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
              prono.freeStatus === 'won' ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {prono.freeStatus === 'won' ? '✅' : '❌'}
            </div>
            <div>
              <p className={`text-sm font-black ${
                prono.freeStatus === 'won' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {prono.freeStatus === 'won' ? 'Pronostic Gratuit Réussi !' : 'Pronostic Gratuit Échoué'}
              </p>
              {prono.actualResult && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Score final : <span className="font-bold text-slate-700 dark:text-slate-200">{prono.actualResult}</span>
                </p>
              )}
            </div>
          </div>
          {prono.verifiedAt && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Vérifié le {new Date(prono.verifiedAt).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      )}

      {/* PREMIUM VERIFICATION STATUS BANNER */}
      {(user?.isPro || user?.role === 'admin') && prono.premiumStatus && prono.premiumStatus !== 'pending' && (
        <div className={`rounded-2xl p-4 flex items-center justify-between border mb-4 ${
          prono.premiumStatus === 'won'
            ? 'bg-green-500/10 border-green-500/20'
            : 'bg-red-500/10 border-red-500/20'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
              prono.premiumStatus === 'won' ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {prono.premiumStatus === 'won' ? '✅' : '❌'}
            </div>
            <div>
              <p className={`text-sm font-black ${
                prono.premiumStatus === 'won' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {prono.premiumStatus === 'won' ? 'Pronostic Premium Réussi !' : 'Pronostic Premium Échoué'}
              </p>
              {prono.actualResult && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Score final : <span className="font-bold text-slate-700 dark:text-slate-200">{prono.actualResult}</span>
                </p>
              )}
            </div>
          </div>
          {prono.verifiedAt && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Vérifié le {new Date(prono.verifiedAt).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      )}

      {((prono.freeStatus === 'pending' && prono.freeExpectedResult) || (prono.premiumStatus === 'pending' && prono.premiumExpectedResult)) && (
        <div className="rounded-2xl p-4 flex items-center gap-3 border bg-amber-500/10 border-amber-500/20 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-amber-500/20 animate-pulse">
            ⏳
          </div>
          <div>
            <p className="text-sm font-black text-amber-600 dark:text-amber-400">En attente de vérification</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Le résultat sera vérifié après le match</p>
          </div>
        </div>
      )}

      {/* FREE PRONOSTIC BLOCK OR PREMIUM LOCK */}
      {(user?.isPro || user?.role === 'admin') ? (
        <>
          <div className="bg-white dark:bg-brand-navy-2 rounded-2xl shadow-sm border border-slate-200 dark:border-brand-slate overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-brand-navy-3 border-b border-slate-100 dark:border-brand-slate text-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Qui va gagner ?</h3>
            </div>
            <div className="p-3 sm:p-5">
              <div className="flex justify-center items-center gap-2 sm:gap-4 relative">
                <div className="flex flex-col items-center gap-1 sm:gap-2">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center transition-all ${prono.freePrediction.choice === 'home' ? 'border-brand-green bg-brand-green/10 ring-2 sm:ring-4 ring-brand-green/20' : 'border-slate-100 dark:border-brand-slate'}`}>
                    <img src={homeLogo} alt={homeTeamName} className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  {prono.freePrediction.choice === 'home' && <span className="text-[8px] sm:text-[10px] font-bold text-brand-green uppercase tracking-tighter">Notre Choix</span>}
                </div>

                <div className="flex flex-col items-center gap-1 sm:gap-2">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-bold text-slate-400 transition-all ${prono.freePrediction.choice === 'draw' ? 'border-brand-green bg-brand-green/10 text-brand-green ring-2 sm:ring-4 ring-brand-green/20' : 'border-slate-100 dark:border-brand-slate'}`}>
                    X
                  </div>
                  {prono.freePrediction.choice === 'draw' && <span className="text-[8px] sm:text-[10px] font-bold text-brand-green uppercase tracking-tighter">Notre Choix</span>}
                </div>

                <div className="flex flex-col items-center gap-1 sm:gap-2">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center transition-all ${prono.freePrediction.choice === 'away' ? 'border-brand-green bg-brand-green/10 ring-2 sm:ring-4 ring-brand-green/20' : 'border-slate-100 dark:border-brand-slate'}`}>
                    <img src={awayLogo} alt={awayTeamName} className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  {prono.freePrediction.choice === 'away' && <span className="text-[8px] sm:text-[10px] font-bold text-brand-green uppercase tracking-tighter">Notre Choix</span>}
                </div>
              </div>
            </div>
            
            <div className="px-5 pb-5">
              <div className="flex items-center justify-between gap-2">
                <div className={`flex-1 p-2 rounded-lg border text-center transition-all ${prono.freePrediction.choice === 'home' ? 'bg-brand-green/10 border-brand-green/30' : 'bg-slate-50 dark:bg-brand-navy-3 border-slate-100 dark:border-brand-slate'}`}>
                  <span className={`text-[10px] block font-bold mb-1 ${prono.freePrediction.choice === 'home' ? 'text-brand-green' : 'text-slate-400'}`}>1</span>
                  <span className={`text-sm font-black ${prono.freePrediction.choice === 'home' ? 'text-brand-green' : 'text-slate-700 dark:text-slate-300'}`}>{prono.freePrediction.odds.home.toFixed(2)}</span>
                </div>
                <div className={`flex-1 p-2 rounded-lg border text-center transition-all ${prono.freePrediction.choice === 'draw' ? 'bg-brand-green/10 border-brand-green/30' : 'bg-slate-50 dark:bg-brand-navy-3 border-slate-100 dark:border-brand-slate'}`}>
                  <span className={`text-[10px] block font-bold mb-1 ${prono.freePrediction.choice === 'draw' ? 'text-brand-green' : 'text-slate-400'}`}>X</span>
                  <span className={`text-sm font-black ${prono.freePrediction.choice === 'draw' ? 'text-brand-green' : 'text-slate-700 dark:text-slate-300'}`}>{prono.freePrediction.odds.draw.toFixed(2)}</span>
                </div>
                <div className={`flex-1 p-2 rounded-lg border text-center transition-all ${prono.freePrediction.choice === 'away' ? 'bg-brand-green/10 border-brand-green/30' : 'bg-slate-50 dark:bg-brand-navy-3 border-slate-100 dark:border-brand-slate'}`}>
                  <span className={`text-[10px] block font-bold mb-1 ${prono.freePrediction.choice === 'away' ? 'text-brand-green' : 'text-slate-400'}`}>2</span>
                  <span className={`text-sm font-black ${prono.freePrediction.choice === 'away' ? 'text-brand-green' : 'text-slate-700 dark:text-slate-300'}`}>{prono.freePrediction.odds.away.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Premium Upsell Button */}
            <div className="p-4 border-t border-slate-100 dark:border-brand-slate bg-gradient-to-br from-brand-green/10 to-transparent">
              <button 
                onClick={handlePremiumClick}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 shadow-md shadow-brand-green/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Analyse Premium & Avis IA
              </button>
            </div>
          </div>

          {/* KEY INFOS / OBSERVATIONS */}
          <div className="bg-white dark:bg-brand-navy-2 rounded-2xl shadow-sm border border-slate-200 dark:border-brand-slate overflow-hidden transition-all hover:shadow-md">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-brand-slate flex items-center justify-between bg-slate-50/50 dark:bg-brand-navy-3/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center text-brand-green">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Perspectives du match</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-brand-navy-3 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-brand-slate/50">ANALYSE</span>
            </div>
            
            <div className="relative">
              {/* Subtle background pattern for a premium feel */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none dark:opacity-[0.05]" 
                   style={{ backgroundImage: 'radial-gradient(#22c55e 0.5px, transparent 0.5px)', backgroundSize: '12px 12px' }} />
              
              <div
                className="prono-md prono-md--light px-6 py-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed relative z-10"
                dangerouslySetInnerHTML={{
                  __html: (() => {
                    // Handle both legacy string[] and new markdown string
                    const raw = prono.keyInfos;
                    if (Array.isArray(raw)) {
                      return markdownToHtml(raw.join('\n')) || '<p class="italic text-slate-400">Aucune perspective disponible.</p>';
                    }
                    return markdownToHtml(raw) || '<p class="italic text-slate-400">Aucune perspective disponible.</p>';
                  })()
                }}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-brand-navy-2 rounded-2xl shadow-sm border border-slate-200 dark:border-brand-slate overflow-hidden relative">
          <div className="absolute inset-0 bg-slate-50/50 dark:bg-brand-navy-3/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-green/20 flex items-center justify-center mb-4 text-brand-green">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Pronostic Premium</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
              {!user 
                ? "Créez un compte gratuitement pour débloquer l'analyse experte, le choix de la rédaction et l'avis de notre IA."
                : "Débloquez l'analyse experte, le choix de la rédaction et l'avis de notre IA pour ce match."
              }
            </p>
            <button 
              onClick={handlePremiumClick}
              className="btn-primary py-3 px-8 shadow-md shadow-brand-green/20"
            >
              {!user ? "S'inscrire gratuitement" : "Débloquer l'analyse"}
            </button>
          </div>
          
          {/* Blurred out dummy content underneath */}
          <div className="p-4 opacity-30 select-none pointer-events-none filter blur-md">
            <div className="flex justify-center items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-brand-navy-3" />
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-brand-navy-3" />
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-brand-navy-3" />
            </div>
            <div className="h-4 bg-slate-200 dark:bg-brand-navy-3 rounded w-full mb-3" />
            <div className="h-4 bg-slate-200 dark:bg-brand-navy-3 rounded w-5/6 mb-3" />
            <div className="h-4 bg-slate-200 dark:bg-brand-navy-3 rounded w-4/6" />
          </div>
        </div>
      )}

      {/* PREMIUM MODAL (Floating Block) */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg animate-fade-in">
          <div
            className="w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
            style={{
              background: 'rgba(11, 15, 26, 0.85)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Header — glass with gradient accent line */}
            <div className="relative px-6 py-5 flex justify-between items-center shrink-0">
              <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-brand-green/40 to-transparent" />
              <h2 className="font-black text-base text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-green/15 border border-brand-green/25 text-brand-green">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </span>
                Analyse & Avis IA
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold border border-brand-gold/30 uppercase tracking-wider">PRO</span>
              </h2>
              <button
                onClick={() => setShowPremiumModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto no-scrollbar space-y-5">

              {/* Analyse Détaillée — neumorphic inset */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-4 rounded-full bg-slate-500/60" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">Analyse Détaillée</h3>
                </div>
                <div
                  className="prono-md px-5 py-4 rounded-2xl text-sm text-slate-200 leading-relaxed"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(prono.premiumAnalysis) || '<p class="italic text-slate-500">Aucune analyse détaillée disponible.</p>' }}
                />
              </div>

              {/* Recommandation IA — glass panel with green glow accent */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-4 rounded-full bg-brand-green/70" />
                  <h3 className="text-[10px] font-black text-brand-green/80 uppercase tracking-[0.12em]">Recommandation de l'IA</h3>
                </div>
                <div
                  className="prono-md relative px-5 py-4 rounded-2xl text-sm text-slate-100 leading-relaxed overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.06) 0%, rgba(20,184,166,0.04) 100%)',
                    border: '1px solid rgba(34,197,94,0.18)',
                    boxShadow: '0 0 40px rgba(34,197,94,0.05)',
                  }}
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(prono.iaOpinion) || '<p class="italic text-slate-500">Aucune recommandation disponible.</p>' }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 text-center text-[11px] font-medium text-slate-500 border-t border-white/5 shrink-0">
              🔒 Contenu exclusif aux membres <span className="text-brand-gold font-bold">Pro</span>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL (If not pro) */}
      <UnifiedPaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          setShowPaymentModal(false);
          // Normally would update user context to Pro here
        }}
        paymentDetails={{
          type: 'subscription',
          amount: 9.99,
          description: 'Abonnement PronosBox Premium',
          itemName: 'Accès VIP 1 Mois'
        }}
      />
    </div>
  );
};

export default MatchPronostics;
