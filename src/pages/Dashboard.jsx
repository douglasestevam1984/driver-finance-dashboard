import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

function Dashboard() {
  const { days, fixedCosts } = useContext(AppContext);

  const totalGanho = days.reduce((acc, day) => acc + (day.ganho || 0), 0);
  const totalCombustivel = days.reduce(
    (acc, day) => acc + (day.combustivel || 0),
    0,
  );
  const totalHoras = days.reduce((acc, day) => acc + (day.horas || 0), 0);

  const totalOperador = days.reduce((acc, day) => {
    const percent = day.operadorPercent || 0;
    return acc + (day.ganho || 0) * (percent / 100);
  }, 0);

  const lucroTotal = totalGanho - (totalCombustivel + totalOperador);
  const lucroReal = lucroTotal - (fixedCosts || 0);
  const mediaHora = totalHoras > 0 ? lucroTotal / totalHoras : 0;

  return (
    <div>
      {/* RESUMO */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Resumo Financeiro</h2>
        <p style={{ color: '#6b7280' }}>
          Visão geral do seu desempenho como motorista.
        </p>
      </div>

      {/* GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
        }}
      >
        <BigCard title="Lucro" value={lucroTotal} positive />
        <BigCard title="Lucro Real" value={lucroReal} positive />

        <SmallCard title="📅 Dias" value={days.length} />
        <SmallCard title="💰 Ganho" value={`€ ${totalGanho}`} />
        <SmallCard title="⛽ Combustível" value={`€ ${totalCombustivel}`} />
        <SmallCard
          title="🏢 Operador"
          value={`€ ${totalOperador.toFixed(2)}`}
        />
        <SmallCard title="⏱ €/Hora" value={`€ ${mediaHora.toFixed(2)}`} />
      </div>
    </div>
  );
}

/* ===== COMPONENTES ===== */

function BigCard({ title, value, positive }) {
  return (
    <div
      style={{
        background: positive
          ? 'linear-gradient(135deg, #16a34a, #22c55e)'
          : '#dc2626',
        color: '#fff',
        padding: '25px',
        borderRadius: '16px',
      }}
    >
      <p>{title}</p>
      <h1>€ {value.toFixed(2)}</h1>
    </div>
  );
}

function SmallCard({ title, value }) {
  return (
    <div
      style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '14px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
      }}
    >
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  );
}

export default Dashboard;
