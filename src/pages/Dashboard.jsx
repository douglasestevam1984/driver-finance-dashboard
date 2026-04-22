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

  // ===== IA (INSIGHTS) =====

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
      analise += `⚠️ Sua média por hora está baixa. Pode ser interessante rever horários ou zonas.\n`;
    } else {
      analise += `✅ Sua média por hora está em um bom nível.\n`;
    }

    if (totalCombustivel > totalGanho * 0.3) {
      analise += `⚠️ O custo com combustível está alto em relação ao ganho.\n`;
    }

    analise += `\n💡 Dica: Analise seus melhores dias e tente repetir os mesmos horários ou zonas.`;

    return analise;
  };

  return (
    <div>
      {/* TÍTULO */}
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
