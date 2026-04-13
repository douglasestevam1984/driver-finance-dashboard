import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import AddDay from './pages/AddDay';
import History from './pages/History';
import FixedCosts from './components/FixedCosts';

function App() {
  return (
    <BrowserRouter>
      {/* HEADER */}
      <header
        style={{
          background: 'linear-gradient(90deg, #4f46e5, #6366f1)',
          color: '#fff',
          padding: '25px 0',
          marginBottom: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 20px',
          }}
        >
          <h1 style={{ margin: 0 }}>🚗 Driver Finance Dashboard</h1>

          <p style={{ marginTop: '6px', opacity: 0.9 }}>
            Controle financeiro inteligente para motoristas TVDE
          </p>

          <nav style={{ marginTop: '15px', display: 'flex', gap: '20px' }}>
            <Link style={{ color: '#fff' }} to="/">
              Dashboard
            </Link>
            <Link style={{ color: '#fff' }} to="/add">
              Adicionar Dia
            </Link>
            <Link style={{ color: '#fff' }} to="/history">
              Histórico
            </Link>
          </nav>
        </div>
      </header>

      {/* CONTEÚDO */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 20px',
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddDay />} />
          <Route path="/history" element={<History />} />
        </Routes>

        <FixedCosts />
      </div>
    </BrowserRouter>
  );
}

export default App;
