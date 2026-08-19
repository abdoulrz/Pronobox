import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Sparkles, Info } from 'lucide-react';
import LegalContent from '../components/legal/LegalContent';
import { GoogleLogin } from '@react-oauth/google';

type AccountType = 'standard' | 'tipster' | 'wildcard';

const Auth = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const modeParam = queryParams.get('mode');
  const redirectParam = queryParams.get('redirect') || '/';

  const [isLogin, setIsLogin] = useState(modeParam !== 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('standard');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState<'terms' | 'privacy' | 'cookies' | 'legal' | null>(null);
  
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, isFallbackMode } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Client-side Validation
    if (!isLogin && password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!isLogin && !acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation et la politique de confidentialité');
      return;
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        // Login logic
        await login({ email, password });
        navigate(redirectParam);
      } else {
        // Registration logic
        await register({ username, email, password, accountType });
        navigate(redirectParam);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      
      // Map raw backend errors to friendly French strings
      const backendMessage = err.response?.data?.message || err.message || '';
      
      if (backendMessage.includes('E11000 duplicate key error') || backendMessage.includes('duplicate')) {
        if (backendMessage.includes('email')) {
          setError('Cet email est déjà associé à un compte.');
        } else if (backendMessage.includes('username')) {
          setError('Ce nom d\'utilisateur est déjà pris.');
        } else {
          setError('Un compte avec ces informations existe déjà.');
        }
      } else if (backendMessage.includes('Invalid credentials')) {
        setError('Email ou mot de passe incorrect.');
      } else {
        setError(backendMessage || 'Une erreur est survenue lors de la connexion au serveur');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      setError("Une erreur est survenue lors de la connexion avec Google.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle(credentialResponse.credential, isLogin ? undefined : accountType);
      navigate(redirectParam);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      const backendMessage = err.response?.data?.message || err.message || '';
      setError(backendMessage || 'Erreur lors de la connexion Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("La connexion avec Google a échoué. Veuillez réessayer.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-2.5 sm:px-4 py-8 bg-[#0B0F1A]">
      {/* Dynamic Sports Background with Subtle Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-25 filter blur-[1px]"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1574629810360-1efdb106428d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0B0F1A]/90 via-[#0B0F1A]/95 to-[#0B0F1A]" />

      <div className="w-full max-w-lg z-10 relative my-auto">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden p-4 sm:p-8">
          
          {/* Header & Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-brand-green to-emerald-400 rounded-2xl text-white shadow-lg shadow-emerald-500/20 transform -rotate-2 mb-3">
              <span className="text-2xl sm:text-3xl font-black italic tracking-tighter rotate-2">PB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isLogin ? 'Bon retour sur PronosBox' : 'Rejoignez PronosBox'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              {isLogin 
                ? 'Connectez-vous pour accéder à vos analyses et canaux favoris' 
                : "La plateforme d'analyse sportive & pronostics vérifiés"}
            </p>
          </div>

          {/* Positioning Disclaimer Banner (Non-bookmaker clarification) */}
          <div className="mb-5 bg-slate-800/40 border border-slate-700/60 rounded-xl p-2.5 sm:p-3 flex items-start gap-2.5 text-slate-300 text-[11px] sm:text-xs">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong className="text-white font-semibold">Information :</strong> PronosBox est un hub d'analyse et de conseils sportifs indépendants. Nous ne prenons aucun pari.
            </p>
          </div>

          {isFallbackMode && (
            <div className="mb-5 bg-amber-500/10 border border-amber-500/40 text-amber-400 p-3 rounded-xl text-xs">
              Mode hors connexion activé. Le serveur est actuellement en cours d'initialisation.
            </div>
          )}

          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-xs text-center font-medium animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Persona Selection (Registration only) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-slate-200">
                  Choisissez votre profil de départ <span className="text-brand-green">*</span>
                </label>

                {/* 3 Personas Selection Bento Cards */}
                <div className="grid grid-cols-1 gap-2.5">
                  
                  {/* Persona 1: Parieur / Standard */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setAccountType('standard')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setAccountType('standard'); }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      accountType === 'standard'
                        ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-850/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl shrink-0">⚽</span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-white">Utilisateur / Parieur</span>
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                              Consommateur
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Suivez les tipsters, consultez les cotes & stats de matchs.
                          </p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        accountType === 'standard' ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-600'
                      }`}>
                        {accountType === 'standard' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                    </div>

                    {accountType === 'standard' && (
                      <div className="mt-2 pt-2 border-t border-emerald-500/20 text-[10.5px] sm:text-[11px] text-emerald-200/90 leading-relaxed bg-emerald-950/20 p-2 rounded-lg">
                        💡 <strong>Ce que ce rôle implique :</strong> Accès aux analyses, cotes et pronostics gratuits, avec possibilité de débloquer les canaux et contenus premium selon vos envies.
                      </div>
                    )}
                  </div>

                  {/* Persona 2: Tipster Pro */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setAccountType('tipster')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setAccountType('tipster'); }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      accountType === 'tipster'
                        ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/50 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-850/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl shrink-0">🎯</span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-white">Tipster (Créateur)</span>
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                              Créateur Pro
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Publiez des pronostics officiels & gérez votre canal.
                          </p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        accountType === 'tipster' ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-600'
                      }`}>
                        {accountType === 'tipster' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                    </div>

                    {accountType === 'tipster' && (
                      <div className="mt-2 pt-2 border-t border-amber-500/20 text-[10.5px] sm:text-[11px] text-amber-200/90 leading-relaxed bg-amber-950/20 p-2 rounded-lg">
                        💡 <strong>Ce que ce rôle implique :</strong> Accès créateur complet : publication de pronostics vérifiés par API, création de canaux (1 gratuit + 1 VIP) et construction de votre historique pour viser le badge Certifié.
                      </div>
                    )}
                  </div>

                  {/* Persona 3: Wildcard */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setAccountType('wildcard')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setAccountType('wildcard'); }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      accountType === 'wildcard'
                        ? 'bg-purple-500/15 border-purple-500 ring-1 ring-purple-500/50 shadow-lg shadow-purple-500/10'
                        : 'bg-slate-850/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl shrink-0">⚡</span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-white">Wildcard (Hybride)</span>
                            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> Évolution
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Parieur avec option de devenir Tipster à tout moment.
                          </p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        accountType === 'wildcard' ? 'border-purple-500 bg-purple-500 text-slate-950' : 'border-slate-600'
                      }`}>
                        {accountType === 'wildcard' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                    </div>

                    {accountType === 'wildcard' && (
                      <div className="mt-2 pt-2 border-t border-purple-500/20 text-[10.5px] sm:text-[11px] text-purple-200/90 leading-relaxed bg-purple-950/20 p-2 rounded-lg">
                        💡 <strong>Ce que ce rôle implique :</strong> Vous démarrez comme utilisateur standard pour observer et vous entraîner, avec la possibilité d'activer le statut Tipster en 1 clic (achat unique) dès que vous vous sentez prêt.
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* Username (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Nom d'utilisateur <span className="text-brand-green">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 sm:py-3 bg-slate-800/60 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-white text-xs sm:text-sm transition-all placeholder:text-slate-500"
                    placeholder="Votre pseudo unique"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                Adresse email <span className="text-brand-green">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 sm:py-3 bg-slate-800/60 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-white text-xs sm:text-sm transition-all placeholder:text-slate-500"
                  placeholder="vous@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs sm:text-sm font-medium text-slate-300">
                  Mot de passe <span className="text-brand-green">*</span>
                </label>
                {isLogin && (
                  <button 
                    type="button" 
                    onClick={() => setError("Veuillez contacter le support pour réinitialiser votre mot de passe.")}
                    className="text-[11px] sm:text-xs text-brand-green hover:text-emerald-300 transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 sm:py-3 bg-slate-800/60 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-white text-xs sm:text-sm transition-all placeholder:text-slate-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                  Confirmer le mot de passe <span className="text-brand-green">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 sm:py-3 bg-slate-800/60 border border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-white text-xs sm:text-sm transition-all placeholder:text-slate-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                    aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Terms & Privacy (Register only) */}
            {!isLogin && (
              <div className="flex items-start space-x-2.5 mt-2 bg-slate-850/60 p-2.5 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="accept-terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-brand-green rounded border-slate-700 bg-slate-800 text-brand-green cursor-pointer flex-shrink-0"
                  required
                />
                <label htmlFor="accept-terms" className="text-[11px] sm:text-xs text-slate-300 leading-normal cursor-pointer select-none">
                  J'accepte les{" "}
                  <button
                    type="button"
                    onClick={() => setShowLegalModal('terms')}
                    className="text-brand-green hover:text-emerald-300 font-semibold underline bg-transparent border-none p-0 inline"
                  >
                    Conditions Générales
                  </button>{" "}
                  et la{" "}
                  <button
                    type="button"
                    onClick={() => setShowLegalModal('privacy')}
                    className="text-brand-green hover:text-emerald-300 font-semibold underline bg-transparent border-none p-0 inline"
                  >
                    Politique de Confidentialité
                  </button>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-brand-green to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 focus:ring-offset-slate-900 transition-all shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2 text-sm sm:text-base cursor-pointer mt-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : isLogin ? (
                'Se connecter'
              ) : (
                "Créer mon compte PronosBox"
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="mt-5 flex items-center justify-center space-x-3">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-slate-500 text-xs uppercase tracking-wider">ou continuer avec</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Google Login container (Mobile 320px safe) */}
          <div className="mt-4 flex justify-center w-full min-h-[44px] overflow-hidden">
            <div className="max-w-full scale-90 sm:scale-100 origin-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_blue"
                text="continue_with"
                shape="pill"
                size="large"
                width="340"
              />
            </div>
          </div>

          {/* Switch Mode Button */}
          <div className="mt-6 text-center pt-4 border-t border-slate-800/80">
            <button
              onClick={() => {
                setError('');
                setIsLogin(!isLogin);
              }}
              className="text-slate-400 hover:text-white transition-colors text-xs sm:text-sm cursor-pointer"
            >
              {isLogin ? "Pas encore de compte ? " : 'Vous avez déjà un compte ? '}
              <span className="text-brand-green font-bold hover:underline">
                {isLogin ? "S'inscrire" : 'Se connecter'}
              </span>
            </button>
          </div>

        </div>
      </div>
      {showLegalModal && (
        <LegalContent type={showLegalModal} onClose={() => setShowLegalModal(null)} />
      )}
    </div>
  );
};

export default Auth;