import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, register, isFallbackMode } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        // Login logic
        await login({
          email,
          password
        });
        navigate('/');
      } else {
        // Registration logic
        if (password !== confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          setLoading(false);
          return;
        }
        await register({
          username,
          email,
          password
        });
        navigate('/');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de la connexion au serveur');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
              <span className="text-xl font-bold">PB</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Connexion' : 'Inscription'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isLogin ?
              'Accédez à votre compte PRONOSBOX' :
              'Créez votre compte PRONOSBOX'}
            </p>
          </div>
          {isFallbackMode &&
          <div className="mb-4 bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm">
              Mode hors connexion activé. Le serveur est actuellement
              indisponible, mais vous pouvez utiliser l'application avec des
              fonctionnalités limitées.
            </div>
          }
          {error &&
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          }
          <form onSubmit={handleSubmit}>
            {!isLogin &&
            <div className="mb-4">
                <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1">

                  Nom d'utilisateur
                </label>
                <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900"
                required />

              </div>
            }
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1">

                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900"
                required />

            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1">

                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900"
                required />

            </div>
            {!isLogin &&
            <div className="mb-4">
                <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1">

                  Confirmer le mot de passe
                </label>
                <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900"
                required />

              </div>
            }
            {isLogin &&
            <div className="flex justify-end mb-4">
                <button
                type="button"
                className="text-sm text-green-600 hover:text-green-800">

                  Mot de passe oublié?
                </button>
              </div>
            }
            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex justify-center"
              disabled={loading}>

              {loading ?
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">

                  <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4">
                </circle>
                  <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
                </svg> :
              isLogin ?
              'Se connecter' :

              "S'inscrire"
              }
            </button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-green-600 hover:text-green-800">

              {isLogin ?
              "Pas encore de compte? S'inscrire" :
              'Déjà un compte? Se connecter'}
            </button>
          </div>
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="text-center text-xs text-gray-500">
              <p>Utilisateurs de test:</p>
              <p className="mt-1">Admin: admin@pronosbox.com / admin123</p>
              <p>Utilisateur: user@pronosbox.com / user123</p>
              <p>Pro: pro@pronosbox.com / pro123</p>
            </div>
          </div>
        </div>
      </div>
    </div>);

};
export default Auth;