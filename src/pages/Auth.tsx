import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User as UserIcon } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login, register, isFallbackMode } = useAuth();

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

    setLoading(true);
    
    try {
      if (isLogin) {
        // Login logic
        await login({ email, password });
        navigate('/');
      } else {
        // Registration logic
        await register({ username, email, password });
        navigate('/');
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

  const handleGoogleLogin = () => {
    alert("L'intégration Google arrive très bientôt ! (Ajouté à la Roadmap)");
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

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center py-3 px-4 bg-white hover:bg-gray-50 text-slate-800 font-semibold rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuer avec Google
            </button>
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

        {/* Test Credentials Block - Kept temporarily per user request */}
        <div className="mt-8 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl">
          <div className="text-center text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-2 uppercase tracking-wider text-[10px]">Test Credentials (To Be Removed)</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-slate-800/50 p-2 rounded">
                <span className="block text-green-400 mb-1">Admin</span>
                admin@pronosbox.com<br/>admin123
              </div>
              <div className="bg-slate-800/50 p-2 rounded">
                <span className="block text-green-400 mb-1">Pro User</span>
                pro@pronosbox.com<br/>pro123
              </div>
              <div className="bg-slate-800/50 p-2 rounded">
                <span className="block text-green-400 mb-1">Standard User</span>
                user@pronosbox.com<br/>user123
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Auth;