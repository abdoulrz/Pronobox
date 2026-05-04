
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DynamicWidthBar } from '../common/DynamicWidthBar';

export interface Prediction {
  id: number;
  match: string;
  prediction: string;
  confidence: number;
  time: string;
  date: string;
  league: string;
  locked?: boolean;
  teams: {
    home: { name: string; logo: string };
    away: { name: string; logo: string };
  };
}

interface PredictionCardProps {
  prediction: Prediction;
  isPro: boolean;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, isPro }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="card overflow-hidden relative">
      {/* Locked overlay for non-pro users */}
      {isPro && prediction.locked && !user?.isPro && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-white font-bold text-sm mb-1">Contenu Premium</p>
            <p className="text-slate-300 text-xs mb-3">Débloquez ce pronostic pour accéder à l'analyse complète</p>
            <button 
              title="Débloquer le pronostic"
              className="btn-pro text-xs py-1.5 px-4" 
              onClick={() => navigate('/compare-accounts')}
            >
              Débloquer pour 5 €
            </button>
          </div>
        </div>
      )}

      {/* League header */}
      <div className="flex justify-between items-center px-3 py-2 border-b border-slate-200 dark:border-brand-slate bg-slate-50 dark:bg-brand-navy-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-brand-text-2 uppercase tracking-wide">{prediction.league}</span>
        <div className="flex items-center gap-1 text-slate-400 dark:text-brand-text-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs">{prediction.time} · {prediction.date}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="p-3">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 dark:border-brand-slate bg-slate-50 dark:bg-brand-navy-2">
              <img src={prediction.teams.home.logo} alt={prediction.teams.home.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-brand-text-1">{prediction.teams.home.name}</span>
          </div>
          <span className="text-xs font-bold text-slate-400 dark:text-brand-text-3">VS</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800 dark:text-brand-text-1">{prediction.teams.away.name}</span>
            <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 dark:border-brand-slate bg-slate-50 dark:bg-brand-navy-2">
              <img src={prediction.teams.away.logo} alt={prediction.teams.away.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Prediction bar */}
        <div className={`p-2.5 rounded-lg ${isPro ? 'prediction-bar-pro' : 'prediction-bar-free'}`}>
          <p className={`text-xs font-semibold mb-2 ${isPro ? 'text-amber-600 dark:text-brand-gold' : 'text-green-700 dark:text-brand-green'}`}>
            {prediction.prediction}
          </p>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-brand-navy rounded-full overflow-hidden">
            <DynamicWidthBar
              progress={prediction.confidence}
              className={`h-full rounded-full transition-all duration-700 ${isPro ? 'bg-brand-gold' : 'bg-brand-green'}`}
            />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-brand-text-3 mt-1 text-right">
            Confiance : {prediction.confidence}%
          </p>
        </div>
      </div>
    </div>
  );
};
