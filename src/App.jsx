import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import AddDay from './pages/AddDay';
import History from './pages/History';

function App() {
  const [page, setPage] = useState('dashboard');

  const [days, setDays] = useState(() => {
    const saved = localStorage.getItem('driver-days');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('driver-days', JSON.stringify(days));
  }, [days]);

  function renderPage() {
    if (page === 'add') return <AddDay setDays={setDays} setPage={setPage} />;
    if (page === 'history') return <History days={days} setDays={setDays} />;
    return <Dashboard days={days} />;
  }

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div>
          <h1 style={styles.logo}>🚗 DriveOS</h1>
          <p style={styles.logoSub}>Finance Dashboard</p>
        </div>

        <nav style={styles.nav}>
          <button
            style={{
              ...styles.navItem,
              ...(page === 'dashboard' ? styles.navActive : {}),
            }}
            onClick={() => setPage('dashboard')}
          >
            Dashboard
          </button>

          <button
            style={{
              ...styles.navItem,
              ...(page === 'add' ? styles.navActive : {}),
            }}
            onClick={() => setPage('add')}
          >
            Adicionar Dia
          </button>

          <button
            style={{
              ...styles.navItem,
              ...(page === 'history' ? styles.navActive : {}),
            }}
            onClick={() => setPage('history')}
          >
            Histórico
          </button>
        </nav>
      </aside>

      <main style={styles.main}>{renderPage()}</main>
    </div>
  );
}

const styles = {
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
  },
  logo: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 900,
  },
  logoSub: {
    margin: '6px 0 34px',
    color: '#64748b',
    fontWeight: 600,
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
