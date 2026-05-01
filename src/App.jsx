import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import AddDay from './pages/AddDay';
import History from './pages/History';
import { demoData } from './data/demoData';

// ── Hook: detecta mobile ──────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isMobile;
}
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const [page, setPage] = useState('dashboard');
  const [isDemo, setIsDemo] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const [days, setDays] = useState(() => {
    const saved = localStorage.getItem('driver-days');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
    return demoData;
  });

  useEffect(() => {
    const saved = localStorage.getItem('driver-days');
    const parsed = saved ? JSON.parse(saved) : [];
    if (parsed.length === 0) setIsDemo(true);
  }, []);

  useEffect(() => {
    if (!isDemo) {
      localStorage.setItem('driver-days', JSON.stringify(days));
    }
  }, [days, isDemo]);

  function navigate(p) {
    setPage(p);
    setMenuOpen(false);
  }

  function handleAddDay(newDay) {
    if (isDemo) {
      setIsDemo(false);
      setDays([newDay]);
      localStorage.setItem('driver-days', JSON.stringify([newDay]));
    } else {
      setDays((prev) => [...prev, newDay]);
    }
  }

  function renderPage() {
    if (page === 'add')
      return <AddDay onSave={handleAddDay} setPage={navigate} />;
    if (page === 'history')
      return <History days={days} setDays={setDays} isDemo={isDemo} />;
    return <Dashboard days={days} isDemo={isDemo} />;
  }

  const navItems = [
    { label: '📊 Dashboard', value: 'dashboard' },
    { label: '➕ Adicionar Dia', value: 'add' },
    { label: '📋 Histórico', value: 'history' },
  ];

  // ── MOBILE LAYOUT ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={mobile.root}>
        {/* Top bar */}
        <header style={mobile.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={mobile.logo}>🚗 DriveOS</span>
            {isDemo && <span style={mobile.demoPill}>● Demo</span>}
          </div>
          <button
            style={mobile.hamburger}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </header>

        {/* Drawer overlay + panel */}
        {menuOpen && (
          <>
            <div style={mobile.overlay} onClick={() => setMenuOpen(false)} />
            <nav style={mobile.drawer}>
              <p style={mobile.drawerTitle}>Navegação</p>
              {navItems.map((item) => (
                <button
                  key={item.value}
                  style={{
                    ...mobile.drawerItem,
                    ...(page === item.value ? mobile.drawerActive : {}),
                  }}
                  onClick={() => navigate(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </>
        )}

        {/* Page content */}
        <main style={mobile.main}>{renderPage()}</main>

        {/* Bottom navigation */}
        <nav style={mobile.bottomNav}>
          {navItems.map((item) => (
            <button
              key={item.value}
              style={{
                ...mobile.bottomItem,
                ...(page === item.value ? mobile.bottomActive : {}),
              }}
              onClick={() => navigate(item.value)}
            >
              <span style={mobile.bottomIcon}>{item.label.split(' ')[0]}</span>
              <span style={mobile.bottomLabel}>
                {item.label.split(' ').slice(1).join(' ')}
              </span>
            </button>
          ))}
        </nav>
      </div>
    );
  }

  // ── DESKTOP LAYOUT ─────────────────────────────────────────────────────────
  return (
    <div style={desktop.app}>
      <aside style={desktop.sidebar}>
        <div>
          <h1 style={desktop.logo}>🚗 DriveOS</h1>
          <p style={desktop.logoSub}>Finance Dashboard</p>
        </div>

        {isDemo && (
          <div style={desktop.demoBadge}>
            <span style={desktop.demoDot} />
            Modo Demo
          </div>
        )}

        <nav style={desktop.nav}>
          {navItems.map((item) => (
            <button
              key={item.value}
              style={{
                ...desktop.navItem,
                ...(page === item.value ? desktop.navActive : {}),
              }}
              onClick={() => navigate(item.value)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main style={desktop.main}>{renderPage()}</main>
    </div>
  );
}

// ── Mobile styles ─────────────────────────────────────────────────────────────
const mobile = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: '#f4f7fb',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    color: '#0f172a',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: '20px',
    fontWeight: 900,
  },
  demoPill: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#854d0e',
    background: '#fef9c3',
    padding: '3px 8px',
    borderRadius: '999px',
  },
  hamburger: {
    fontSize: '22px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#0f172a',
    padding: '4px 8px',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.4)',
    zIndex: 200,
  },
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '260px',
    height: '100vh',
    background: '#ffffff',
    zIndex: 300,
    padding: '28px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxShadow: '-8px 0 30px rgba(15,23,42,0.12)',
  },
  drawerTitle: {
    margin: '0 0 10px',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#94a3b8',
  },
  drawerItem: {
    padding: '14px 16px',
    borderRadius: '14px',
    border: 'none',
    background: 'transparent',
    color: '#475569',
    fontWeight: 800,
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '15px',
    width: '100%',
  },
  drawerActive: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#ffffff',
    boxShadow: '0 10px 24px rgba(79,70,229,0.25)',
  },
  main: {
    flex: 1,
    padding: '20px 16px',
    paddingBottom: '90px',
    overflowX: 'hidden',
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    background: '#ffffff',
    borderTop: '1px solid #e5e7eb',
    boxShadow: '0 -4px 20px rgba(15,23,42,0.08)',
    zIndex: 100,
  },
  bottomItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    padding: '10px 0 14px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: '#94a3b8',
  },
  bottomActive: {
    color: '#4f46e5',
  },
  bottomIcon: {
    fontSize: '20px',
    lineHeight: 1,
  },
  bottomLabel: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '0.02em',
  },
};

// ── Desktop styles ────────────────────────────────────────────────────────────
const desktop = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f4f7fb',
    color: '#0f172a',
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  sidebar: {
    width: '260px',
    padding: '32px 22px',
    background: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    boxShadow: '8px 0 30px rgba(15,23,42,0.04)',
    flexShrink: 0,
  },
  logo: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 900,
  },
  logoSub: {
    margin: '6px 0 16px',
    color: '#64748b',
    fontWeight: 600,
  },
  demoBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '18px',
    padding: '8px 12px',
    borderRadius: '10px',
    background: '#fef9c3',
    color: '#854d0e',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.05em',
  },
  demoDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#eab308',
    flexShrink: 0,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  navItem: {
    padding: '14px 16px',
    borderRadius: '16px',
    border: 'none',
    background: 'transparent',
    color: '#475569',
    fontWeight: 800,
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '15px',
  },
  navActive: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#ffffff',
    boxShadow: '0 14px 30px rgba(79,70,229,0.28)',
  },
  main: {
    flex: 1,
    padding: '36px',
    overflowX: 'hidden',
  },
};

export default App;
