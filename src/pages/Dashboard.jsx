import { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

function Dashboard({ days, isDemo }) {
  const [period, setPeriod] = useState('all');
  const [insight, setInsight] = useState('');

  const filteredDays = useMemo(() => {
    const today = new Date();
    return days
      .filter((day) => {
        if (!day.date) return false;
        const date = new Date(day.date);
        const diff = (today - date) / (1000 * 60 * 60 * 24);
        if (period === '7d') return diff <= 7;
        if (period === '30d') return diff <= 30;
        return true;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [days, period]);

  function calcular(day) {
    let ganho = 0;
    let uber = 0;
    let bolt = 0;

    if (Array.isArray(day.rides) && day.rides.length > 0) {
      day.rides.forEach((ride) => {
        const valor = Number(ride.valor) || 0;
        ganho += valor;
        if (ride.plataforma === 'uber') uber += valor;
        if (ride.plataforma === 'bolt') bolt += valor;
      });
    } else {
      ganho = Number(day.ganho) || 0;
      uber = Number(day.uberTotal) || 0;
      bolt = Number(day.boltTotal) || 0;
    }

    const combustivel = Number(day.combustivel) || 0;
    const operador = ganho * ((Number(day.operadorPercent) || 0) / 100);
    const despesas = combustivel + operador;
    const lucro = ganho - despesas;

    return {
      ganho,
      uber,
      bolt,
      combustivel,
      operador,
      despesas,
      lucro,
      horas: Number(day.horas) || 0,
    };
  }

  const totals = filteredDays.reduce(
    (acc, day) => {
      const d = calcular(day);
      acc.ganho += d.ganho;
      acc.uber += d.uber;
      acc.bolt += d.bolt;
      acc.combustivel += d.combustivel;
      acc.operador += d.operador;
      acc.despesas += d.despesas;
      acc.lucro += d.lucro;
      acc.horas += d.horas;
      return acc;
    },
    {
      ganho: 0,
      uber: 0,
      bolt: 0,
      combustivel: 0,
      operador: 0,
      despesas: 0,
      lucro: 0,
      horas: 0,
    },
  );

  const mediaHora = totals.horas > 0 ? totals.lucro / totals.horas : 0;

  // ── Weekly Trend ─────────────────────────────────────────────────────────────
  const weeklyData = useMemo(() => {
    const weeks = {};

    filteredDays.forEach((day) => {
      const date = new Date(day.date);
      // Obtém segunda-feira da semana deste dia
      const dayOfWeek = date.getDay(); // 0=Dom, 1=Seg...
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(date);
      monday.setDate(date.getDate() + diff);
      const key = monday.toISOString().split('T')[0];

      if (!weeks[key]) {
        weeks[key] = {
          ganho: 0,
          lucro: 0,
          despesas: 0,
          uber: 0,
          bolt: 0,
          dias: 0,
        };
      }

      const d = calcular(day);
      weeks[key].ganho += d.ganho;
      weeks[key].lucro += d.lucro;
      weeks[key].despesas += d.despesas;
      weeks[key].uber += d.uber;
      weeks[key].bolt += d.bolt;
      weeks[key].dias += 1;
    });

    return Object.entries(weeks)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([monday, data]) => {
        const date = new Date(monday);
        const end = new Date(date);
        end.setDate(date.getDate() + 6);
        const label = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')} – ${end.getDate().toString().padStart(2, '0')}/${(end.getMonth() + 1).toString().padStart(2, '0')}`;
        return { label, ...data };
      });
  }, [filteredDays]);

  const trendChartData = {
    labels: weeklyData.map((w) => w.label),
    datasets: [
      {
        label: 'Lucro',
        data: weeklyData.map((w) => parseFloat(w.lucro.toFixed(2))),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.12)',
        borderWidth: 3,
        pointBackgroundColor: '#8b5cf6',
        pointRadius: 6,
        pointHoverRadius: 9,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Ganho',
        data: weeklyData.map((w) => parseFloat(w.ganho.toFixed(2))),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.06)',
        borderWidth: 3,
        pointBackgroundColor: '#22c55e',
        pointRadius: 6,
        pointHoverRadius: 9,
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Despesas',
        data: weeklyData.map((w) => parseFloat(w.despesas.toFixed(2))),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.06)',
        borderWidth: 2,
        pointBackgroundColor: '#ef4444',
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: false,
        borderDash: [6, 3],
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        labels: {
          color: '#475569',
          font: { weight: 700 },
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 14,
        callbacks: {
          label: (ctx) =>
            ` ${ctx.dataset.label}: €${Number(ctx.raw).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { weight: 700 }, maxRotation: 30 },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#64748b', callback: (v) => `€${v}` },
        grid: { color: '#e5e7eb' },
      },
    },
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const chartData = {
    labels: filteredDays.map((day) =>
      new Date(day.date).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
      }),
    ),
    datasets: [
      {
        label: 'Uber',
        data: filteredDays.map((d) => calcular(d).uber),
        backgroundColor: '#22c55e',
        borderRadius: 10,
      },
      {
        label: 'Bolt',
        data: filteredDays.map((d) => calcular(d).bolt),
        backgroundColor: '#3b82f6',
        borderRadius: 10,
      },
      {
        label: 'Despesas',
        data: filteredDays.map((d) => calcular(d).despesas),
        backgroundColor: '#ef4444',
        borderRadius: 10,
      },
      {
        label: 'Lucro',
        data: filteredDays.map((d) => calcular(d).lucro),
        backgroundColor: '#8b5cf6',
        borderRadius: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#475569', font: { weight: 700 } } },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 14,
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: €${Number(ctx.raw).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { weight: 700 } },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#64748b', callback: (v) => `€${v}` },
        grid: { color: '#e5e7eb' },
      },
    },
  };

  function gerarAnaliseIA() {
    if (filteredDays.length === 0)
      return 'Sem dados suficientes para gerar uma análise.';

    let texto = '📊 Análise Inteligente\n\n';
    texto += `Lucro total: €${totals.lucro.toFixed(2)}\n`;
    texto += `Ganho total: €${totals.ganho.toFixed(2)}\n`;
    texto += `Despesas totais: €${totals.despesas.toFixed(2)}\n`;
    texto += `Média por hora: €${mediaHora.toFixed(2)}\n\n`;

    if (totals.lucro < 0) {
      texto +=
        '🚨 O período está negativo. Prioridade: rever combustível, percentagem do operador e horários de trabalho.\n\n';
    } else if (mediaHora < 10) {
      texto +=
        '⚠️ O lucro existe, mas a rentabilidade por hora está baixa. O foco deve ser melhorar horários e zonas de maior procura.\n\n';
    } else {
      texto +=
        '✅ A rentabilidade está saudável. O objetivo agora é repetir os padrões dos melhores dias.\n\n';
    }

    if (weeklyData.length >= 2) {
      const ultima = weeklyData[weeklyData.length - 1];
      const penultima = weeklyData[weeklyData.length - 2];
      const diff = ultima.lucro - penultima.lucro;
      if (diff > 0) {
        texto += `📈 A última semana foi €${diff.toFixed(2)} melhor que a anterior.\n`;
      } else if (diff < 0) {
        texto += `📉 A última semana foi €${Math.abs(diff).toFixed(2)} pior que a anterior.\n`;
      }
    }

    if (totals.uber > totals.bolt) {
      texto += '💡 Uber teve melhor desempenho que Bolt neste período.\n';
    } else if (totals.bolt > totals.uber) {
      texto += '💡 Bolt teve melhor desempenho que Uber neste período.\n';
    } else {
      texto += '💡 Uber e Bolt tiveram desempenho semelhante.\n';
    }

    texto +=
      '\n👉 Próximo passo: compare os dias com maior lucro e identifique horário, plataforma e custo de combustível.';
    return texto;
  }

  return (
    <div>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Performance Overview</p>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>
            Acompanhe ganhos, plataformas, despesas e lucro real com visão clara
            para decisão.
          </p>
        </div>
        <button
          style={styles.aiButton}
          onClick={() => setInsight(gerarAnaliseIA())}
        >
          🤖 Analisar com IA
        </button>
      </header>

      <section style={styles.filters}>
        {[
          { label: '7 dias', value: '7d' },
          { label: '30 dias', value: '30d' },
          { label: 'Todos', value: 'all' },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setPeriod(item.value)}
            style={{
              ...styles.filter,
              ...(period === item.value ? styles.filterActive : {}),
            }}
          >
            {item.label}
          </button>
        ))}
      </section>

      <section style={styles.kpiGrid}>
        <KpiCard
          title="Lucro Total"
          value={totals.lucro}
          color="#16a34a"
          featured
        />
        <KpiCard title="Ganho Total" value={totals.ganho} color="#2563eb" />
        <KpiCard title="Despesas" value={totals.despesas} color="#dc2626" />
        <KpiCard title="€/Hora" value={mediaHora} color="#7c3aed" suffix="/h" />
      </section>

      <section style={styles.miniGrid}>
        <MiniCard title="Uber" value={totals.uber} color="#22c55e" />
        <MiniCard title="Bolt" value={totals.bolt} color="#3b82f6" />
        <MiniCard
          title="Combustível"
          value={totals.combustivel}
          color="#f97316"
        />
        <MiniCard title="Operador" value={totals.operador} color="#eab308" />
      </section>

      {insight && <section style={styles.insightBox}>{insight}</section>}

      {/* ── Gráfico de Evolução Semanal ── */}
      {weeklyData.length >= 2 && (
        <section style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <p style={styles.eyebrow}>Weekly Trend</p>
              <h2 style={styles.sectionTitle}>Evolução Semanal de Lucro</h2>
            </div>
            <span style={styles.badge}>{weeklyData.length} semanas</span>
          </div>

          {/* Resumo semanal em cards */}
          <div style={styles.weekGrid}>
            {weeklyData.map((w, i) => {
              const prev = weeklyData[i - 1];
              const delta = prev ? w.lucro - prev.lucro : null;
              return (
                <div key={i} style={styles.weekCard}>
                  <p style={styles.weekLabel}>{w.label}</p>
                  <p
                    style={{
                      ...styles.weekValue,
                      color: w.lucro >= 0 ? '#16a34a' : '#dc2626',
                    }}
                  >
                    €{w.lucro.toFixed(2)}
                  </p>
                  {delta !== null && (
                    <p
                      style={{
                        ...styles.weekDelta,
                        color: delta >= 0 ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {delta >= 0 ? '▲' : '▼'} €{Math.abs(delta).toFixed(2)}
                    </p>
                  )}
                  <p style={styles.weekDias}>{w.dias} dias</p>
                </div>
              );
            })}
          </div>

          <div style={styles.chartBox}>
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
        </section>
      )}

      {/* ── Gráfico Diário ── */}
      <section style={{ ...styles.chartCard, marginTop: '20px' }}>
        <div style={styles.chartHeader}>
          <div>
            <p style={styles.eyebrow}>Breakdown</p>
            <h2 style={styles.sectionTitle}>
              Uber vs Bolt vs Despesas vs Lucro
            </h2>
          </div>
          <span style={styles.badge}>{filteredDays.length} dias</span>
        </div>
        <div style={styles.chartBox}>
          {filteredDays.length > 0 ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <p style={styles.empty}>Sem dados para apresentar.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function KpiCard({ title, value, color, suffix = '', featured }) {
  return (
    <article
      style={{ ...styles.kpiCard, ...(featured ? styles.kpiFeatured : {}) }}
    >
      <p style={styles.cardLabel}>{title}</p>
      <h2 style={{ ...styles.kpiValue, color }}>
        € {Number(value).toFixed(2)}
        {suffix}
      </h2>
    </article>
  );
}

function MiniCard({ title, value, color }) {
  return (
    <article style={styles.miniCard}>
      <p style={styles.cardLabel}>{title}</p>
      <h3 style={{ ...styles.miniValue, color }}>
        € {Number(value).toFixed(2)}
      </h3>
    </article>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  eyebrow: {
    margin: 0,
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#6366f1',
  },
  title: {
    margin: '8px 0',
    fontSize: '42px',
    fontWeight: 900,
    letterSpacing: '-0.04em',
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '16px',
    maxWidth: '720px',
    lineHeight: 1.6,
  },
  aiButton: {
    padding: '14px 18px',
    borderRadius: '16px',
    border: 'none',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 16px 34px rgba(79,70,229,0.25)',
    whiteSpace: 'nowrap',
  },
  filters: { display: 'flex', gap: '10px', marginBottom: '24px' },
  filter: {
    padding: '11px 16px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#475569',
    fontWeight: 800,
    cursor: 'pointer',
  },
  filterActive: {
    background: '#0f172a',
    color: '#ffffff',
    borderColor: '#0f172a',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
    marginBottom: '18px',
  },
  kpiCard: {
    padding: '24px',
    borderRadius: '24px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    boxShadow: '0 18px 45px rgba(15,23,42,0.06)',
  },
  kpiFeatured: {
    border: '1px solid rgba(79,70,229,0.35)',
    boxShadow: '0 22px 55px rgba(79,70,229,0.14)',
  },
  cardLabel: { margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 800 },
  kpiValue: { margin: '18px 0 0', fontSize: '32px', letterSpacing: '-0.04em' },
  miniGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  miniCard: {
    padding: '18px',
    borderRadius: '20px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
  },
  miniValue: { margin: '12px 0 0', fontSize: '24px' },
  insightBox: {
    whiteSpace: 'pre-line',
    padding: '22px',
    borderRadius: '22px',
    background: '#eef2ff',
    border: '1px solid #c7d2fe',
    color: '#1e1b4b',
    lineHeight: 1.7,
    marginBottom: '22px',
    fontWeight: 600,
  },
  chartCard: {
    padding: '26px',
    borderRadius: '28px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    boxShadow: '0 22px 60px rgba(15,23,42,0.07)',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '16px',
  },
  sectionTitle: { margin: '8px 0 0', fontSize: '26px' },
  badge: {
    padding: '9px 14px',
    borderRadius: '999px',
    background: '#f1f5f9',
    color: '#475569',
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  chartBox: { height: '340px' },
  empty: { color: '#64748b', fontWeight: 700 },
  weekGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  weekCard: {
    padding: '16px',
    borderRadius: '18px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
  },
  weekLabel: {
    margin: '0 0 8px',
    fontSize: '11px',
    fontWeight: 900,
    color: '#64748b',
    letterSpacing: '0.05em',
  },
  weekValue: { margin: 0, fontSize: '22px', fontWeight: 900 },
  weekDelta: { margin: '4px 0 0', fontSize: '13px', fontWeight: 800 },
  weekDias: {
    margin: '6px 0 0',
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: 700,
  },
};

export default Dashboard;
