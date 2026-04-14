import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { router } from './router';
import { useTheme } from './hooks/useTheme';

function ThemeInitializer() {
  useTheme();
  return null;
}

export function App() {
  return (
    <AuthProvider>
      <ThemeInitializer />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
