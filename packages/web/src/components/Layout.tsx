import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/gacha', label: 'Gacha', icon: '🎰' },
  { to: '/collection', label: 'Collection', icon: '📖' },
  { to: '/store', label: 'Store', icon: '🏪' },
  { to: '/safari', label: 'Safari', icon: '🌿' },
  { to: '/quests', label: 'Quests', icon: '⚔️' },
  { to: '/achievements', label: 'Badges', icon: '🏆' },
  { to: '/stats', label: 'Stats', icon: '📊' },
];

export function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-theme-surface border-b border-theme-border px-4 py-3 flex items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 no-underline text-theme-text">
          <span className="text-2xl">🐣</span>
          <h1 className="text-pixel-lg font-pixel tracking-wide">Hatchling</h1>
        </NavLink>
        <div className="flex items-center gap-4 text-sm font-body">
          <span className="text-theme-text-muted hidden sm:inline text-xs">{user?.email}</span>
          <NavLink to="/settings" className="text-theme-text-muted hover:text-theme-text no-underline transition-colors text-lg" title="Settings">⚙️</NavLink>
          <button onClick={handleSignOut} className="text-theme-text-muted hover:text-theme-text bg-transparent border-none cursor-pointer font-body text-sm transition-colors">
            Logout
          </button>
        </div>
      </header>

      <nav className="bg-theme-surface/50 border-b border-theme-border px-2 py-1.5 flex gap-0.5 overflow-x-auto">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `text-xs px-3 py-1.5 whitespace-nowrap no-underline font-body font-semibold rounded-button transition-all duration-200 ${
                isActive
                  ? 'bg-theme-accent/15 text-theme-accent border border-theme-accent/30'
                  : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-hover border border-transparent'
              }`
            }
          >
            <span className="mr-1">{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>

      <footer className="bg-theme-surface/50 border-t border-theme-border text-theme-text-muted text-xs text-center py-3 font-body">
        Hatchling — Turn impulse purchases into pixel friends
      </footer>
    </div>
  );
}
