import { useEffect } from 'react';
import { createBrowserRouter, Navigate, useNavigate, type RouterProviderProps } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { GachaMachine } from './pages/GachaMachine';
import { Collection } from './pages/Collection';
import { CreatureDetail } from './pages/CreatureDetail';
import { Store } from './pages/Store';
import { Safari } from './pages/Safari';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';
import { useAuth } from './lib/auth';

function AuthGuard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-pixel text-[12px]">Loading...</div>;
  }

  if (!user) return null;

  return <Layout />;
}

export const router: RouterProviderProps['router'] = createBrowserRouter([
  { path: '/', element: <Landing /> },
  {
    element: <AuthGuard />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/gacha', element: <GachaMachine /> },
      { path: '/collection', element: <Collection /> },
      { path: '/collection/:creatureId', element: <CreatureDetail /> },
      { path: '/store', element: <Store /> },
      { path: '/safari', element: <Safari /> },
      { path: '/stats', element: <Stats /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
