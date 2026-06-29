import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthRequired: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAction = (mode: 'login' | 'register') => {
    const redirectUrl = encodeURIComponent(location.pathname);
    navigate(`/auth?mode=${mode}&redirect=${redirectUrl}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-fade-in">
      <div className="relative w-full max-w-md bg-white/60 dark:bg-brand-navy-2/60 backdrop-blur-xl border border-slate-200 dark:border-brand-slate rounded-3xl p-8 shadow-xl overflow-hidden transition-all duration-300">
        
        {/* Glowing Lock Icon */}
        <div className="relative w-20 h-20 bg-brand-green/10 dark:bg-brand-green/20 rounded-2xl flex items-center justify-center text-brand-green mx-auto mb-6 shadow-lg shadow-brand-green/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Rejoignez Pronobox</h2>
        <p className="text-sm text-slate-500 dark:text-brand-text-3 mb-8 leading-relaxed">
          Pour aller plus loin et débloquer les pronostics des experts, les analyses exclusives et les canaux de discussion en direct, veuillez créer un compte ou vous connecter.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleAction('register')}
            className="w-full btn-primary py-3.5 px-6 font-bold text-sm shadow-lg shadow-brand-green/20"
          >
            Créer un compte (Gratuit)
          </button>
          
          <button
            onClick={() => handleAction('login')}
            className="w-full bg-slate-100 dark:bg-brand-navy-3 hover:bg-slate-200 dark:hover:bg-brand-navy-1 border border-slate-200 dark:border-brand-slate/50 text-slate-700 dark:text-slate-200 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthRequired;
