import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import NotificationCenter from './NotificationCenter';
import SearchBar from './SearchBar';

interface HeaderProps {
  onBetEducClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBetEducClick }) => {
  const { user, isAuthenticated, logout, isFallbackMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header
      className="bg-emerald-600/95 dark:bg-emerald-800/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 px-4 py-3 sm:py-4 shadow-[0_4px_30px_rgba(0,0,0,0.15)] transition-all duration-300"
    >
      <div className="flex justify-between items-center max-w-screen-2xl mx-auto">

        {/* ── Brand ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <img 
            src="/logo-pronosbox.png" 
            alt="PRONOSBOX" 
            className="h-8 sm:h-10 md:h-12 object-contain" 
          />
          {isFallbackMode && (
            <span className="text-[10px] font-semibold bg-brand-gold/20 text-brand-gold border border-brand-gold/30 px-1.5 py-0.5 rounded-full">
              Offline
            </span>
          )}
        </div>

        {/* ── Action Bar ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* BET-EDUC Button */}
          <button
            className="btn-beted flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1.5 rounded-lg"
            onClick={() => {
              if (onBetEducClick) onBetEducClick();
              else navigate('/beteduc');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="hidden sm:inline">BET-EDUC</span>
          </button>

          {/* Search */}
          {isAuthenticated && (
            <button
              className="p-1.5 sm:p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200"
              onClick={() => setShowSearchModal(!showSearchModal)}
              title="Rechercher"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          {/* Notifications */}
          {isAuthenticated && <NotificationCenter />}

          {/* Theme Toggle */}
          <button
            className="p-1.5 sm:p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-all duration-200"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {/* User Avatar / Login */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                className="flex items-center gap-2 focus:outline-none group"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {/* Online dot + avatar */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-brand-green/40 group-hover:border-brand-green transition-colors duration-200">
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  </div>
                  {/* Online indicator */}
                  <span className={`absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full border-2 border-slate-100 dark:border-brand-navy transition-all duration-300 ${
                    isOnline 
                      ? 'bg-brand-green animate-pulse-glow shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
                      : 'bg-slate-400 dark:bg-brand-slate'
                  }`} />
                </div>
                {user.role === 'admin' ? (
                  <span className="hidden sm:inline-flex items-center text-xs font-bold bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full ml-2 shadow-sm backdrop-blur-md">Admin</span>
                ) : user.isPro ? (
                  <span className="hidden sm:inline-flex badge-pro">Pro</span>
                ) : null}
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <div className="user-dropdown absolute right-0 mt-2 w-52 rounded-xl overflow-hidden z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-brand-slate">
                    <p className="text-sm font-semibold text-slate-900 dark:text-brand-text-1">{user.username}</p>
                    <p className="text-xs text-slate-500 dark:text-brand-text-3 truncate">{user.email}</p>
                    <div className="flex gap-1.5 mt-1.5">
                      {user.role !== 'admin' && user.isPro && <span className="badge-pro">✦ Pro</span>}
                      {user.role === 'admin' && (
                        <span className="inline-flex items-center text-xs font-bold bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">Admin</span>
                      )}
                    </div>
                  </div>

                  {/* Wallet balance */}
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-brand-slate">
                    <p className="text-xs text-slate-500 dark:text-brand-text-3">Solde</p>
                    <p className="text-sm font-bold text-brand-green">€{(user.walletBalance ?? 0).toFixed(2)}</p>
                  </div>

                  {/* Actions */}
                  <div className="p-1.5">
                    {[
                      { label: 'Paramètres', action: () => { navigate('/settings'); setShowUserMenu(false); } },
                      ...(user.role === 'admin' ? [{ label: 'Administration', action: () => { navigate('/admin'); setShowUserMenu(false); } }] : []),
                    ].map(({ label, action }) => (
                      <button
                        key={label}
                        onClick={action}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-brand-text-2 hover:text-slate-900 dark:hover:text-brand-text-1 hover:bg-brand-green/10 rounded-lg transition-colors duration-150"
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors duration-150 mt-1 border-t border-slate-200 dark:border-brand-slate"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              className="btn-primary text-xs py-1.5 px-4"
              onClick={() => navigate('/auth')}
            >
              Connexion
            </button>
          )}
        </div>
      </div>

      {/* Search bar slide-in */}
      {showSearchModal && (
        <div className="mt-2 max-w-xl mx-auto">
          <SearchBar onClose={() => setShowSearchModal(false)} />
        </div>
      )}
    </header>
  );
};

export default Header;