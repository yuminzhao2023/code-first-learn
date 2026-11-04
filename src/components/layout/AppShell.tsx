import type { ReactNode } from 'react';
import { Icon } from '../ui/Icon';

export function AppShell({ children, activeRoute }: { children: ReactNode; activeRoute: 'traces' | 'metrics' }) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary sidebar">
        <a className="brand" href="/"><span className="brand-mark"><Icon name="pulse" size={21}/></span><span>pulse<span className="brand-highlight">trace</span></span><span className="brand-small">LAB</span></a>
        <div className="workspace-switch"><span className="workspace-avatar">A</span><div><strong>Acme Workspace</strong><small>Development</small></div><Icon name="chevron" size={15}/></div>
        <div className="nav-section-label">OBSERVE</div>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="/" className={activeRoute === 'traces' ? 'nav-link active' : 'nav-link'} aria-current={activeRoute === 'traces' ? 'page' : undefined}><Icon name="layers"/>Trace Explorer</a>
          <a href="/metrics" className={activeRoute === 'metrics' ? 'nav-link active' : 'nav-link'} aria-current={activeRoute === 'metrics' ? 'page' : undefined}><Icon name="chart"/>LLM Metrics</a>
        </nav>
        <div className="nav-section-label" style={{ marginTop: '28px' }}>SYSTEM</div>
        <div className="nav-links"><span className="nav-link disabled"><Icon name="database"/>Data Sources <small>soon</small></span><span className="nav-link disabled"><Icon name="settings"/>Settings <small>soon</small></span></div>
        <div className="sidebar-bottom">
          <div className="environment-badge"><span className="live-dot"/> Development environment</div>
          <div className="sidebar-profile"><span className="profile-avatar">AI</span><div><strong>AI Engineering</strong><small>Code-first demo</small></div></div>
        </div>
      </aside>
      <main className="main-content">
        <div className="topbar"><div className="breadcrumbs">Workspace <span>/</span> Observability <span>/</span> <strong>{activeRoute === 'traces' ? 'Traces' : 'Metrics'}</strong></div><div className="topbar-right"><span className="health-marker"><span className="live-dot"/> Sample data loaded</span><span className="topbar-divider"/><span className="keyboard-hint">⌘ K</span></div></div>
        <div className="content-wrap">{children}</div>
      </main>
    </div>
  );
}
