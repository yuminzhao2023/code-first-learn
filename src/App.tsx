import { AppShell } from './components/layout/AppShell';
import { TraceExplorer } from './pages/TraceExplorer';
import { LlmMetrics } from './pages/LlmMetrics';

export function App() {
  // Deliberately minimal routing: two static routes are sufficient for this lab.
  const route = window.location.pathname === '/metrics' ? 'metrics' : 'traces';
  return (
    <AppShell activeRoute={route}>
      {route === 'metrics' ? <LlmMetrics /> : <TraceExplorer />}
    </AppShell>
  );
}
