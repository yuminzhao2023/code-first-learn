import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from '../components/layout/AppShell';
import { pageRoutes } from './routes';

export const router = createBrowserRouter([
  {
    Component: AppShell,
    children: [
      ...pageRoutes,
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
