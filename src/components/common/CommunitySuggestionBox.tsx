import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface CommunitySuggestionBoxProps {
  context?: 'home' | 'channels';
  targetChannelId?: string;
  targetChannelName?: string;
  className?: string;
}

export const CommunitySuggestionBox: React.FC<CommunitySuggestionBoxProps> = ({
  context = 'home',
  targetChannelId,
  targetChannelName,
  className = ''
}) => {
  const { user } = useAuth();
  const [category, setCategory] = useState<string>(
    context === 'channels' ? 'tipster_request' : 'apk'
  );
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const homeCategories = [
    { id: 'apk', label: '📱 App Mobile (APK)', desc: 'Idée ou retour pour l\'application' },
    { id: 'betting_markets', label: '⚽ Marchés & Paris', desc: 'Nouveaux championnats ou types de pronostics' },
    { id: 'features', label: '💡 Fonctionnalité', desc: 'Une nouvelle idée pour le site' },
    { id: 'bug', label: '🐞 Signaler un Bug', desc: 'Un problème technique' }
  ];

  const channelsCategories = [
    { id: 'tipster_request', label: '📣 Match à Analyser', desc: 'Proposer une affiche aux tipsters' },
    { id: 'betting_markets', label: '📊 Marché Souhaité', desc: 'Ex: Over/Under buts, BTTS, Double Chance' },
    { id: 'general', label: '💬 Suggestion Générale', desc: 'Pour animer le canal' }
  ];

  const categories = context === 'channels' ? channelsCategories : homeCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Veuillez saisir votre suggestion.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/community/suggestions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          category,
          message: message.trim(),
          targetChannelId: targetChannelId || undefined,
          targetChannelName: targetChannelName || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      setSubmitted(true);
      setMessage('');
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible d\'envoyer votre suggestion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`glass-panel rounded-3xl p-5 sm:p-6 relative overflow-hidden border border-brand-green/20 ${className}`}>
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-green/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-green/15 text-brand-green flex items-center justify-center font-black text-lg border border-brand-green/30 shrink-0">
              💡
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {context === 'channels' 
                  ? (targetChannelName ? `Suggestions pour ${targetChannelName}` : 'Suggérer un match aux Tipsters') 
                  : 'Boîte à Idées & Retours'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {context === 'channels'
                  ? 'Demandez une analyse sur un match précis ou un marché particulier'
                  : 'Partagez vos idées pour l\'APK mobile et les futures fonctionnalités'}
              </p>
            </div>
          </div>
          <span className="self-start sm:self-center text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20">
            Co-construction
          </span>
        </div>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/25 text-center space-y-1.5 animate-fadeIn">
            <div className="text-2xl">🎉</div>
            <h4 className="text-sm font-black text-green-600 dark:text-green-400">
              Merci pour votre contribution !
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Votre suggestion a été transmise avec succès à l'équipe PronosBox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 mt-3">
            {/* Category selection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Thématique
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      category === cat.id
                        ? 'bg-brand-green text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input message */}
            <div className="space-y-1">
              <div className="relative">
                <textarea
                  rows={2}
                  maxLength={350}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    context === 'channels'
                      ? 'Ex: Pouvez-vous analyser Real vs Barça avec un prono Over 2.5 buts ?'
                      : 'Ex: Ce serait super d\'ajouter des notifications de scores en direct sur l\'APK...'
                  }
                  className="w-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green resize-none transition-all"
                  required
                />
                <span className="absolute right-3 bottom-2 text-[10px] text-slate-400 font-medium">
                  {message.length}/350
                </span>
              </div>
              {errorMsg && (
                <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>
              )}
            </div>

            {/* Submit button */}
            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-slate-400">
                {user ? `Posté en tant que @${user.username}` : 'Post anonyme bienvenu'}
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="px-4 py-2 bg-brand-green hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-green/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Envoi...</span>
                  </>
                ) : (
                  <>
                    <span>Envoyer la suggestion</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
