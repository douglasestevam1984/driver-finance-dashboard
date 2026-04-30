import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import AddDay from './pages/AddDay';
import History from './pages/History';
import { demoData } from './data/demoData';

function App() {
  const [page, setPage] = useState('dashboard');
  const [isDemo, setIsDemo] = useState(false);

  const [days, setDays] = useState(() => {
    const saved = localStorage.getItem('driver-days');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
    // Sem dados guardados → carrega demo
    setIsDemo(true); // nota: chamada dentro do initializer, será ignorada pelo React
    return demoData;
  });

  // Detecta se está em modo demo após montagem
  useEffect(() => {
    const saved = localStorage.getItem('driver-days');
    const parsed = saved ? JSON.parse(saved) : [];
    if (parsed.length === 0) {
      setIsDemo(true);
    }
  }, []);

  useEffect(() => {
    // Não persiste dados de demo no localStorage
    if (!isDemo) {
      localStorage.setItem('driver-days', JSON.stringify(days));
    }
  }, [days, isDemo]);

  function handleAddDay(newDay) {
    // Primeiro registo real: descarta os dados de demo
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
      return <AddDay onSave={handleAddDay} setPage={setPage} />;
    if (page === 'history')
      return <History days={days} setDays={setDays} isDemo={isDemo} />;
    return <Dashboard days={days} isDemo={isDemo} />;
  }

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div>
          <h1 style={styles.logo}>🚗 DriveOS</h1>
          <p style={styles.logoSub}>Finance Dashboard</p>
        </div>

        {isDemo && (
          <div style={styles.demoBadge}>
            <span style={styles.demoDot} />
            Modo Demo
          </div>
        )}

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
