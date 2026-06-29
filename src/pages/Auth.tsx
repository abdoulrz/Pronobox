import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User as UserIcon } from 'lucide-react';
import LegalContent from '../components/legal/LegalContent';
import { GoogleLogin } from '@react-oauth/google';

const Auth = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const modeParam = queryParams.get('mode');
  const redirectParam = queryParams.get('redirect') || '/';

  const [isLogin, setIsLogin] = useState(modeParam !== 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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
        await register({ username, email, password });
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
      await loginWithGoogle(credentialResponse.credential);
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
    <div className="min-h-screen flex items-center justify-center relative px-4">
      {/* Dynamic Sports Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1574629810360-1efdb106428d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")' }}
      >
        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
      </div>

      <div className="w-full max-w-md z-10 relative">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8">
          
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-green-600 to-green-400 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-green-500/20 transform rotate-3">
              <span className="text-3xl font-black italic tracking-tighter -rotate-3">PB</span>
            </div>
            <h2 className="text-3xl font-bold text-white">
              {isLogin ? 'Bon retour !' : 'Rejoignez-nous'}
            </h2>
            <p className="text-slate-400 mt-2">
              {isLogin ? 'Connectez-vous pour accéder à vos pronostics' : 'Créez votre compte PronosBox'}
            </p>
          </div>

          {isFallbackMode && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-4 rounded-xl text-sm">
              Mode hors connexion activé. Le serveur est actuellement indisponible.
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm text-center font-medium animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white transition-all"
                    placeholder="Votre pseudo"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white transition-all"
                  placeholder="vous@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-300">
                  Mot de passe
                </label>
                {isLogin && (
                  <button type="button" className="text-xs text-green-400 hover:text-green-300 transition-colors">
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}
            {!isLogin && (
              <div className="flex items-start space-x-2.5 mt-2 bg-slate-850/40 p-2.5 rounded-xl border border-slate-700/35">
                <input
                  type="checkbox"
                  id="accept-terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-green-500 rounded border-slate-700 bg-slate-800/50 text-green-500 cursor-pointer flex-shrink-0"
                  required
                />
                <label htmlFor="accept-terms" className="text-xs text-slate-300 leading-normal cursor-pointer select-none">
                  J'accepte les{" "}
                  <button
                    type="button"
                    onClick={() => setShowLegalModal('terms')}
                    className="text-green-400 hover:text-green-300 font-bold underline bg-transparent border-none p-0 inline align-baseline"
                  >
                    Conditions Générales d'Utilisation
                  </button>{" "}
                  et la{" "}
                  <button
                    type="button"
                    onClick={() => setShowLegalModal('privacy')}
                    className="text-green-400 hover:text-green-300 font-bold underline bg-transparent border-none p-0 inline align-baseline"
                  >
                    Politique de Confidentialité
                  </button>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all shadow-lg shadow-green-500/25 flex justify-center items-center mt-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isLogin ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className="h-px bg-slate-700/50 flex-1"></div>
            <span className="text-slate-500 text-sm">ou</span>
            <div className="h-px bg-slate-700/50 flex-1"></div>
          </div>

          <div className="mt-6 flex justify-center w-full min-h-[44px]">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              text="continue_with"
              shape="pill"
              size="large"
              width="384"
            />
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              {isLogin ? "Pas encore de compte ? " : 'Déjà un compte ? '}
              <span className="text-green-400 font-semibold">
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