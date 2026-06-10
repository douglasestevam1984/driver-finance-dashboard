import { useEffect, useState, CSSProperties } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddDay from './pages/AddDay';
import History from './pages/History';
import Costs from './pages/Costs';
import Documents from './pages/Documents';
import { demoData } from './data/demoData';
import { Day } from './types';

// ── Hook: detecta mobile ──────────────────────────────────────────────────────
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  path: string;
  badge?: number;
}
interface StoredDocument {
  id: string;
  dataValidade: string;
}

// ── Conta documentos urgentes para badge ──────────────────────────────────────
function contarDocumentosUrgentes(): number {
  const saved = localStorage.getItem('driver-documents');
  if (!saved) return 0;
  const docs = JSON.parse(saved) as StoredDocument[];
  const hoje = new Date();
  return docs.filter((d) => {
    const validade = new Date(d.dataValidade);
    const dias = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return dias <= 30;
  }).length;
}

// Soma duas strings numéricas (campos opcionais), devolve string ou undefined
function somarStr(a?: string, b?: string): string | undefined {
  const va = Number(a) || 0;
  const vb = Number(b) || 0;
  const total = va + vb;
  if (total === 0 && !a && !b) return undefined;
  return String(total);
}

// Junta um novo registo do dia a um registo já existente para a mesma data
// (soma valores — útil para motoristas com turno de manhã + noite)
function mergeDays(existing: Day, incoming: Day): Day {
  const ganho = (Number(existing.ganho) || 0) + (Number(incoming.ganho) || 0);
  const horas = String((Number(existing.horas) || 0) + (Number(incoming.horas) || 0));
  const combustivel = String((Number(existing.combustivel) || 0) + (Number(incoming.combustivel) || 0));
  const uberTotal = String((Number(existing.uberTotal) || 0) + (Number(incoming.uberTotal) || 0));
  const boltTotal = String((Number(existing.boltTotal) || 0) + (Number(incoming.boltTotal) || 0));

  // Km: mantém o km início mais antigo e soma os km percorridos ao km fim
  const existingKm = existing.kmInicio && existing.kmFim
    ? Math.max(0, (Number(existing.kmFim) || 0) - (Number(existing.kmInicio) || 0)) : 0;
  const incomingKm = incoming.kmInicio && incoming.kmFim
    ? Math.max(0, (Number(incoming.kmFim) || 0) - (Number(incoming.kmInicio) || 0)) : 0;

  let kmInicio = existing.kmInicio;
  let kmFim = existing.kmFim;
  if (!kmInicio && incoming.kmInicio) kmInicio = incoming.kmInicio;
  if (kmInicio && (existingKm + incomingKm) > 0) {
    kmFim = String(Number(kmInicio) + existingKm + incomingKm);
  } else if (incoming.kmFim) {
    kmFim = incoming.kmFim;
  }

  return {
    ...existing,
    mode: incoming.mode,
    ganho: String(ganho),
    uberTotal,
    boltTotal,
    gorjetaUber: somarStr(existing.gorjetaUber, incoming.gorjetaUber),
    gorjetaBolt: somarStr(existing.gorjetaBolt, incoming.gorjetaBolt),
    gorjetaDinheiro: somarStr(existing.gorjetaDinheiro, incoming.gorjetaDinheiro),
    combustivel,
    horas,
    kmInicio,
    kmFim,
    rides: [...(existing.rides ?? []), ...(incoming.rides ?? [])],
  };
}

function App() {
  const [isDemo, setIsDemo] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [docAlerts, setDocAlerts] = useState(() => contarDocumentosUrgentes());
  const [editingDay, setEditingDay] = useState<Day | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const [days, setDays] = useState<Day[]>(() => {
    const saved = localStorage.getItem('driver-days');
    if (saved) {
      const parsed = JSON.parse(saved) as Day[];
      if (parsed.length > 0) return parsed;
    }
    return demoData;
  });

  useEffect(() => {
    const saved = localStorage.getItem('driver-days');
    const parsed = saved ? (JSON.parse(saved) as Day[]) : [];
    if (parsed.length === 0) setIsDemo(true);
  }, []);

  useEffect(() => {
    if (!isDemo) {
      localStorage.setItem('driver-days', JSON.stringify(days));
    }
  }, [days, isDemo]);

  // Actualiza badge quando navega para documentos
  useEffect(() => {
    setDocAlerts(contarDocumentosUrgentes());
  }, [location.pathname]);

  // Limpa o estado de edição sempre que sai da página /add
  useEffect(() => {
    if (location.pathname !== '/add' && editingDay) {
      setEditingDay(null);
    }
  }, [location.pathname, editingDay]);

  function goTo(path: string): void {
    navigate(path);
    setMenuOpen(false);
  }

  // Adiciona um novo dia. Se já existir um registo com a mesma data,
  // soma os valores ao registo existente em vez de criar uma nova linha
  // (cobre o caso de turno de manhã + turno de noite no mesmo dia).
  function handleAddDay(newDay: Day): void {
    if (isDemo) {
      setIsDemo(false);
      setDays([newDay]);
      localStorage.setItem('driver-days', JSON.stringify([newDay]));
      navigate('/');
      return;
    }

    setDays((prev) => {
      const existingIndex = prev.findIndex((d) => d.date === newDay.date);
      if (existingIndex === -1) {
        return [...prev, newDay];
      }
      const merged = mergeDays(prev[existingIndex], newDay);
      const next = [...prev];
      next[existingIndex] = merged;
      return next;
    });
    navigate('/');
  }

  function handleUpdateDay(updatedDay: Day): void {
    setDays((prev) => prev.map((d) => (d.id === updatedDay.id ? updatedDay : d)));
    setEditingDay(null);
  }

  function handleEditDay(day: Day): void {
    setEditingDay(day);
    navigate('/add');
  }

  const navItems: NavItem[] = [
    { label: '📊 Dashboard', path: '/' },
    { label: '➕ Adicionar Dia', path: '/add' },
    { label: '📋 Histórico', path: '/history' },
    { label: '💰 Custos Fixos', path: '/costs' },
    { label: '📄 Documentos', path: '/documents', badge: docAlerts > 0 ? docAlerts : undefined },
  ];

  const currentPath = location.pathname;

  const pageContent = (
    <Routes>
      <Route path="/" element={<Dashboard days={days} isDemo={isDemo} />} />
      <Route path="/add" element={<AddDay onSave={handleAddDay} onUpdate={handleUpdateDay} editingDay={editingDay} />} />
      <Route path="/history" element={<History days={days} setDays={setDays} onEdit={handleEditDay} isDemo={isDemo} />} />
      <Route path="/costs" element={<Costs days={days} />} />
      <Route path="/documents" element={<Documents />} />
    </Routes>
  );

  // ── MOBILE LAYOUT ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={mobile.root}>
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
        {menuOpen && (
          <>
            <div style={mobile.overlay} onClick={() => setMenuOpen(false)} />
            <nav style={mobile.drawer}>
              <p style={mobile.drawerTitle}>Navegação</p>
              {navItems.map((item) => (
                <button
                  key={item.path}
                  style={{
                    ...mobile.drawerItem,
                    ...(currentPath === item.path ? mobile.drawerActive : {}),
                  }}
                  onClick={() => goTo(item.path)}
                >
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span style={mobile.drawerBadge}>{item.badge}</span>
                  )}
                </button>
              ))}
            </nav>
          </>
        )}
        <main style={mobile.main}>{pageContent}</main>
        {/* Bottom nav — mostra só os 4 principais, documentos vai para o drawer */}
        <nav style={mobile.bottomNav}>
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.path}
              style={{
                ...mobile.bottomItem,
                ...(currentPath === item.path ? mobile.bottomActive : {}),
              }}
              onClick={() => goTo(item.path)}
            >
              <span style={mobile.bottomIcon}>{item.label.split(' ')[0]}</span>
              <span style={mobile.bottomLabel}>
                {item.label.split(' ').slice(1).join(' ')}
              </span>
            </button>
          ))}
          {/* Botão documentos com badge */}
          <button
            style={{
              ...mobile.bottomItem,
              ...(currentPath === '/documents' ? mobile.bottomActive : {}),
              position: 'relative',
            }}
            onClick={() => goTo('/documents')}
          >
            {docAlerts > 0 && (
              <span style={mobile.badge}>{docAlerts}</span>
            )}
            <span style={mobile.bottomIcon}>📄</span>
            <span style={mobile.bottomLabel}>Docs</span>
          </button>
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
              key={item.path}
              style={{
                ...desktop.navItem,
                ...(currentPath === item.path ? desktop.navActive : {}),
                position: 'relative',
              }}
              onClick={() => goTo(item.path)}
            >
              {item.label}
              {item.badge && item.badge > 0 && (
                <span style={desktop.navBadge}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>
      <main style={desktop.main}>{pageContent}</main>
    </div>
  );
}

// ── Tipos de estilos ──────────────────────────────────────────────────────────
type Styles = Record<string, CSSProperties>;

// ── Mobile styles ─────────────────────────────────────────────────────────────
const mobile: Styles = {
  root: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f4f7fb', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#0f172a' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#ffffff', borderBottom: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontSize: '20px', fontWeight: 900 },
  demoPill: { fontSize: '11px', fontWeight: 800, color: '#854d0e', background: '#fef9c3', padding: '3px 8px', borderRadius: '999px' },
  hamburger: { fontSize: '22px', background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a', padding: '4px 8px' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 200 },
  drawer: { position: 'fixed', top: 0, right: 0, width: '260px', height: '100vh', background: '#ffffff', zIndex: 300, padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '-8px 0 30px rgba(15,23,42,0.12)' },
  drawerTitle: { margin: '0 0 10px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8' },
  drawerItem: { padding: '14px 16px', borderRadius: '14px', border: 'none', background: 'transparent', color: '#475569', fontWeight: 800, textAlign: 'left', cursor: 'pointer', fontSize: '15px', width: '100%', display: 'flex', alignItems: 'center' },
  drawerActive: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#ffffff', boxShadow: '0 10px 24px rgba(79,70,229,0.25)' },
  drawerBadge: { background: '#dc2626', color: '#ffffff', borderRadius: '999px', fontSize: '11px', fontWeight: 900, padding: '2px 7px', marginLeft: '8px' },
  main: { flex: 1, padding: '20px 16px', paddingBottom: '90px', overflowX: 'hidden' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', background: '#ffffff', borderTop: '1px solid #e5e7eb', boxShadow: '0 -4px 20px rgba(15,23,42,0.08)', zIndex: 100 },
  bottomItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '8px 0 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' },
  bottomActive: { color: '#4f46e5' },
  bottomIcon: { fontSize: '18px', lineHeight: 1 },
  bottomLabel: { fontSize: '9px', fontWeight: 800, letterSpacing: '0.02em' },
  badge: { position: 'absolute', top: '6px', right: '10px', background: '#dc2626', color: '#ffffff', borderRadius: '999px', fontSize: '10px', fontWeight: 900, padding: '1px 5px', minWidth: '16px', textAlign: 'center' },
};

// ── Desktop styles ────────────────────────────────────────────────────────────
const desktop: Styles = {
  app: { display: 'flex', minHeight: '100vh', background: '#f4f7fb', color: '#0f172a', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  sidebar: { width: '260px', padding: '32px 22px', background: '#ffffff', borderRight: '1px solid #e5e7eb', boxShadow: '8px 0 30px rgba(15,23,42,0.04)', flexShrink: 0 },
  logo: { margin: 0, fontSize: '28px', fontWeight: 900 },
  logoSub: { margin: '6px 0 16px', color: '#64748b', fontWeight: 600 },
  demoBadge: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', padding: '8px 12px', borderRadius: '10px', background: '#fef9c3', color: '#854d0e', fontSize: '12px', fontWeight: 800, letterSpacing: '0.05em' },
  demoDot: { display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#eab308', flexShrink: 0 },
  nav: { display: 'flex', flexDirection: 'column', gap: '12px' },
  navItem: { padding: '14px 16px', borderRadius: '16px', border: 'none', background: 'transparent', color: '#475569', fontWeight: 800, textAlign: 'left', cursor: 'pointer', fontSize: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navActive: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#ffffff', boxShadow: '0 14px 30px rgba(79,70,229,0.28)' },
  navBadge: { background: '#dc2626', color: '#ffffff', borderRadius: '999px', fontSize: '11px', fontWeight: 900, padding: '2px 7px' },
  main: { flex: 1, padding: '36px', overflowX: 'hidden' },
};

export default App;
