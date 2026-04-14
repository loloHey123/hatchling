import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/gacha', label: 'Gacha', icon: '🎰' },
  { to: '/collection', label: 'Collection', icon: '📖' },
  { to: '/store', label: 'Store', icon: '🏪' },
  { to: '/safari', label: 'Safari', icon: '🌿' },
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
      <header className="bg-theme-border text-white px-4 py-3 flex items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-2 no-underline text-white">
          <span className="text-xl">🐣</span>
          <h1 className="text-pixel-lg font-pixel">Hatchling</h1>
        </NavLink>
        <div className="flex items-center gap-4 text-pixel-xs">
          <span className="text-theme-text-muted hidden sm:inline">{user?.email}</span>
          <NavLink to="/settings" className="text-theme-text-muted hover:text-white no-underline">⚙️</NavLink>
          <button onClick={handleSignOut} className="text-theme-text-muted hover:text-white bg-transparent border-none cursor-pointer font-pixel text-pixel-xs">
            Logout
          </button>
        </div>
      </header>

      <nav className="bg-theme-surface px-2 py-2 flex gap-1 overflow-x-auto">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `text-pixel-xs px-3 py-2 whitespace-nowrap no-underline font-pixel transition-colors ${
                isActive
                  ? 'bg-theme-bg text-theme-text border-2 border-theme-border'
                  : 'text-theme-text-muted hover:text-white border-2 border-transparent'
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

      <footer className="bg-theme-border text-theme-text-muted text-pixel-xs text-center py-3 font-pixel">
        Hatchling — Turn impulse purchases into pixel friends
      </footer>
    </div>
  );
}
