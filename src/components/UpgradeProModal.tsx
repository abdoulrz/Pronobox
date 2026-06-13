import React, { useState } from 'react';
import { X, Check, ArrowLeft, Crown, Sparkles } from 'lucide-react';

interface UpgradeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const UpgradeProModal: React.FC<UpgradeProModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isJoined, setIsJoined] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;

    setIsSubmitting(true);
    // Simulate API call to save email to waitlist
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    setIsJoined(true);

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300 animate-fade-in">
      <div className="relative bg-slate-900/90 border border-amber-500/30 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] w-full max-w-md mx-4 overflow-hidden">
        {/* Glow effect in background */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-green-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800/80 p-2 rounded-full transition-all duration-300"
          title="Fermer"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          {/* Animated icon header */}
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 transform rotate-6 animate-pulse">
              <Crown className="w-8 h-8 -rotate-6" />
            </div>
            <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 animate-bounce">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <h3 className="text-2xl font-black text-white tracking-tight mb-2">
            PronosBox Premium
          </h3>
          <p className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 tracking-wider mb-4">
            Arrive bientôt !
          </p>

          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            La version Premium de PronosBox est actuellement en cours de finalisation et sera disponible très prochainement.
          </p>

          {/* Benefits */}
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 w-full mb-6 text-left">
            <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles size={12} /> Ce qui vous attend :
            </h4>
            <ul className="text-xs text-slate-300 space-y-2.5">
              <li className="flex items-start gap-2.5">
                <Check size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <span><strong>Analyses ultra-détaillées</strong> et pronostics de haut niveau.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <span><strong>Création & Monétisation</strong> de vos propres canaux de pronostics.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <span><strong>Outils de gestion de bankroll</strong> et statistiques avancées de réussite.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <span><strong>Notifications prioritaires</strong> par Telegram ou alertes push.</span>
              </li>
            </ul>
          </div>

          {/* Form / Success state */}
          {!isJoined ? (
            <form onSubmit={handleJoinWaitlist} className="w-full space-y-3">
              <div className="text-xs text-slate-400 mb-1">
                Soyez le premier informé du lancement officiel et obtenez un accès anticipé :
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Votre adresse email"
                  required
                  className="flex-1 px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center min-w-[120px]"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    "Rejoindre"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="w-full bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-green-400 text-xs font-semibold animate-fade-in flex flex-col items-center gap-1.5">
              <span>🎉 Inscription réussie !</span>
              <span className="text-slate-400 font-normal">Vous recevrez une invitation prioritaire dès l'ouverture de la version Pro.</span>
            </div>
          )}

          {/* Footer action */}
          <div className="mt-6 w-full flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeProModal;