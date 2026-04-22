import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

function Dashboard() {
  const { days, fixedCosts } = useContext(AppContext);
  const [insights, setInsights] = useState('');

  // ===== CÁLCULOS =====

  const totalGanho = days.reduce((acc, d) => acc + (d.ganho || 0), 0);
  const totalCombustivel = days.reduce(
    (acc, d) => acc + (d.combustivel || 0),
    0,
  );
  const totalHoras = days.reduce((acc, d) => acc + (d.horas || 0), 0);

  const totalOperador = days.reduce((acc, d) => {
    const percent = d.operadorPercent || 0;
    return acc + (d.ganho || 0) * (percent / 100);
  }, 0);

  const lucroTotal = totalGanho - (totalCombustivel + totalOperador);
  const lucroReal = lucroTotal - (fixedCosts || 0);

  const mediaHora = totalHoras > 0 ? totalGanho / totalHoras : 0;

  // ===== IA =====

  const gerarInsights = () => {
    if (days.length === 0) {
      return 'Sem dados suficientes para análise.';
    }

    const melhorDia = days.reduce((prev, curr) =>
      (curr.ganho || 0) > (prev.ganho || 0) ? curr : prev,
    );

    const piorDia = days.reduce((prev, curr) =>
      (curr.ganho || 0) < (prev.ganho || 0) ? curr : prev,
    );

    const mediaGanho = totalGanho / days.length;

    let analise = `📊 Análise Inteligente:\n\n`;

    analise += `• Melhor dia: ${melhorDia.date} (€${melhorDia.ganho})\n`;
    analise += `• Pior dia: ${piorDia.date} (€${piorDia.ganho})\n`;
    analise += `• Média diária: €${mediaGanho.toFixed(2)}\n`;
    analise += `• Média por hora: €${mediaHora.toFixed(2)}\n\n`;

    if (mediaHora < 10) {
      analise += `⚠️ Sua média por hora está baixa. Reveja horários ou zonas.\n`;
    } else {
      analise += `✅ Sua média por hora está em bom nível.\n`;
    }

    if (totalCombustivel > totalGanho * 0.3) {
      analise += `⚠️ Custo com combustível elevado.\n`;
    }

    if (lucroReal < 0) {
      analise += `\n🚨 ALERTA: Você está operando no prejuízo. Reduza custos ou ajuste estratégia.\n`;
    }

    analise += `\n💡 Dica: Foque nos dias mais lucrativos e replique padrões.`;

    return analise;
  };

  return (
    <div>
      {/* HEADER */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Resumo Financeiro</h2>
        <p style={{ color: '#6b7280' }}>
          Visão geral do seu desempenho como motorista.
        </p>
      </div>

      {/* ALERTA DE PREJUÍZO */}
      {lucroReal < 0 && (
        <div
          style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '10px',
            fontWeight: 'bold',
          }}
        >
          🚨 Você está com prejuízo. Revise seus custos imediatamente.
        </div>
      )}

      {/* GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
        }}
      >
        <BigCard title="Lucro" value={lucroTotal} />
        <BigCard title="Lucro Real" value={lucroReal} />

        <SmallCard title="📅 Dias" value={days.length} />
        <SmallCard title="💰 Ganho" value={`€ ${totalGanho}`} />
        <SmallCard title="⛽ Combustível" value={`€ ${totalCombustivel}`} />
        <SmallCard
          title="🏢 Operador"
          value={`€ ${totalOperador.toFixed(2)}`}
        />
        <SmallCard title="⏱ €/Hora" value={`€ ${mediaHora.toFixed(2)}`} />
      </div>

      {/* BOTÃO IA */}
      <button
        onClick={() => setInsights(gerarInsights())}
        style={{
          marginTop: '30px',
          padding: '14px',
          background: '#111',
          color: '#fff',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        🤖 Gerar análise inteligente
      </button>

      {/* RESULTADO */}
      {insights && (
        <div
          style={{
            marginTop: '20px',
            background: '#fff',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
            whiteSpace: 'pre-line',
          }}
        >
          {insights}
        </div>
      )}
    </div>
  );
}

/* ===== COMPONENTES ===== */

function BigCard({ title, value }) {
  const isPositive = value >= 0;

  return (
    <div
      style={{
        background: isPositive
          ? 'linear-gradient(135deg, #16a34a, #22c55e)'
          : 'linear-gradient(135deg, #dc2626, #ef4444)',
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
