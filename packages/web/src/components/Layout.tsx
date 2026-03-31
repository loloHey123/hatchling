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
      <header className="bg-[#333] text-white px-4 py-3 flex items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-2 no-underline text-white">
          <span className="text-xl">🐣</span>
          <h1 className="text-[14px] font-pixel">Hatchling</h1>
        </NavLink>
        <div className="flex items-center gap-4 text-[8px]">
          <span className="text-[#aaa] hidden sm:inline">{user?.email}</span>
          <NavLink to="/settings" className="text-[#aaa] hover:text-white no-underline">⚙️</NavLink>
          <button onClick={handleSignOut} className="text-[#aaa] hover:text-white bg-transparent border-none cursor-pointer font-pixel text-[8px]">
            Logout
          </button>
        </div>
      </header>

      <nav className="bg-[#444] px-2 py-2 flex gap-1 overflow-x-auto">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `text-[8px] px-3 py-2 whitespace-nowrap no-underline font-pixel transition-colors ${
                isActive
                  ? 'bg-[#fefcd0] text-[#333] border-2 border-[#333]'
                  : 'text-[#ccc] hover:text-white border-2 border-transparent'
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

      <footer className="bg-[#333] text-[#666] text-[7px] text-center py-3 font-pixel">
        Hatchling — Turn impulse purchases into pixel friends
      </footer>
    </div>
  );
}
