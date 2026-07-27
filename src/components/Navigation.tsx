import { Link, useLocation } from 'react-router-dom';

// ── Nav item definitions ──────────────────────────────────────────────────────
// Note: Box (/box) is accessible inside Canaux as a pinned top block — not a standalone nav item.
const navItems = [
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
    // Canaux = Channels list + Box (social feed) pinned at the top as a section block
    path: '/box',
    label: 'Canaux',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
  {
    path: '/pronos',
    label: 'Pronos',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    path: '/matches',
    label: 'Matchs',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/' && location.pathname.startsWith(path));

  return (
    <>
      {/* ── Mobile Bottom Navigation ────────────────────────────────────── */}
      <nav className="glass-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-30">
        <div className="grid grid-cols-4 h-16 px-2 items-center">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item${isActive(item.path) ? ' active' : ''}`}
            >
              {item.icon}
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Desktop Side Navigation ─────────────────────────────────────── */}
      <nav className="glass-sidebar hidden md:flex flex-col items-center py-4 gap-1 fixed left-0 top-[80px] bottom-0 w-16 z-20">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item-desktop${isActive(item.path) ? ' active' : ''}`}
            title={item.label}
          >
            {item.icon}
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Navigation;