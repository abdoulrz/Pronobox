import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ── Nav item definitions ──────────────────────────────────────────────────────
const navItems = [
  {
    path: '/matches',
    label: 'Matchs',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    path: '/box',
    label: 'Canaux',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
  {
    path: '/',
    label: 'Accueil',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: '/pronos',
    label: 'Pronostics',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    path: '/profile',
    label: 'Profil',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

const Navigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path));

  const renderIcon = (item: typeof navItems[0]) => {
    if (item.path === '/profile' && user?.avatar) {
      return (
        <div className="w-5 h-5 rounded-full overflow-hidden border border-brand-green/50 flex items-center justify-center shrink-0">
          <img src={user.avatar} alt={user.username || 'Profil'} className="w-full h-full object-cover" />
        </div>
      );
    }
    return item.icon;
  };

  return (
    <>
      {/* ── Mobile Bottom Navigation (5 tabs with raised Accueil button) ── */}
      <nav className="glass-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-30">
        <div className="grid grid-cols-5 h-16 px-1 items-center">
          {navItems.map((item) => {
            const active = isActive(item.path);

            if (item.path === '/') {
              // Raised central Home (Accueil) button
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex flex-col items-center justify-center group -mt-5"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                      active
                        ? 'bg-brand-green text-white ring-4 ring-brand-green/20 shadow-green-500/30 scale-105'
                        : 'bg-slate-800 text-slate-300 border border-slate-700/60 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`text-[10px] font-bold tracking-wide mt-1 transition-colors ${
                      active ? 'text-brand-green' : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item${active ? ' active' : ''}`}
              >
                {renderIcon(item)}
                <span className="text-[10px] font-medium tracking-wide truncate max-w-full">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Desktop Side Navigation (4 main tabs; Profile is in top-right Header) ── */}
      <nav className="glass-sidebar hidden md:flex flex-col items-center py-4 gap-2 fixed left-0 top-[80px] bottom-0 w-16 z-20">
        {navItems
          .filter((item) => item.path !== '/profile')
          .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item-desktop${isActive(item.path) ? ' active' : ''}`}
              title={item.label}
            >
              {renderIcon(item)}
            </Link>
          ))}
      </nav>
    </>
  );
};

export default Navigation;