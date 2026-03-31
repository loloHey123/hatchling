import { createBrowserRouter, Navigate } from 'react-router-dom';
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

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  {
    element: <Layout />,
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
