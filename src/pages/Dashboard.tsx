import { useContext, useEffect, useMemo, useState, CSSProperties } from 'react';
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
import { AppContext, calcularCustoSemanal } from '../context/AppContext';
import { Day } from '../types';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Tooltip, Legend, Filler,
);

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface DashboardProps {
  days: Day[];
  isDemo?: boolean;
}

interface KpiCardProps {
  title: string;
  value: number;
  color: string;
  suffix?: string;
  featured?: boolean;
  isMobile: boolean;
}

interface MiniCardProps {
  title: string;
  value: number;
  color: string;
  isMobile: boolean;
}

interface DayCalc {
  ganho: number;
  uber: number;
  bolt: number;
  gorjetas: number;
  combustivel: number;
  operador: number;
  despesas: number;
  lucro: number;
  horas: number;
}

interface DayCalcSimple {
  ganho: number;
  lucro: number;
  horas: number;
}

interface WeekData {
  label: string;
  labelFull: string;
  ganho: number;
  lucro: number;
  despesas: number;
  uber: number;
  bolt: number;
  dias: number;
}

interface WeekAccumulator {
  [key: string]: Omit<WeekData, 'label' | 'labelFull'>;
}

interface BreakEvenAnalysis {
  tipo: 'positivo' | 'negativo' | 'info';
  linhas: string[];
}

interface BreakEvenColors {
  positivo: CSSProperties;
  negativo: CSSProperties;
  info: CSSProperties;
}

type Period = '7d' | '30d' | 'all';
type Styles = Record<string, CSSProperties>;

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

// ── Funções utilitárias ───────────────────────────────────────────────────────
function getSemanaActual(days: Day[]): Day[] {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() + diffSegunda);
  segunda.setHours(0, 0, 0, 0);
  const domingo = new Date(segunda);
  domingo.setDate(segunda.getDate() + 6);
  domingo.setHours(23, 59, 59, 999);
  return days.filter((d) => {
    const date = new Date(d.date);
    return date >= segunda && date <= domingo;
  });
}

function calcularDia(day: Day): DayCalcSimple {
  let ganho = 0;
  if (Array.isArray(day.rides) && day.rides.length > 0) {
    ganho = day.rides.reduce((s, r) => s + (Number(r.valor) || 0), 0);
  } else {
    ganho = Number(day.ganho) || 0;
  }
  const combustivel = Number(day.combustivel) || 0;
  const operador = ganho * ((Number(day.operadorPercent) || 0) / 100);
  const lucro = ganho - combustivel - operador;
  const horas = Number(day.horas) || 0;
  return { ganho, lucro, horas };
}

function calcular(day: Day): DayCalc {
  let ganho = 0, uber = 0, bolt = 0;
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

  // Gorjetas — somadas separadamente para visibilidade
  const gorjetas =
    (Number(day.gorjetaUber) || 0) +
    (Number(day.gorjetaBolt) || 0) +
    (Number(day.gorjetaDinheiro) || 0);

  const combustivel = Number(day.combustivel) || 0;
  const operador = ganho * ((Number(day.operadorPercent) || 0) / 100);
  const despesas = combustivel + operador;
  const lucro = ganho - despesas;
  return { ganho, uber, bolt, gorjetas, combustivel, operador, despesas, lucro, horas: Number(day.horas) || 0 };
}

// ── Componentes auxiliares ────────────────────────────────────────────────────
function KpiCard({ title, value, color, suffix = '', featured, isMobile }: KpiCardProps) {
  const s = isMobile ? mobileStyles : desktopStyles;
  return (
    <article style={{ ...s.kpiCard, ...(featured ? s.kpiFeatured : {}) }}>
      <p style={s.cardLabel}>{title}</p>
      <h2 style={{ ...s.kpiValue, color }}>€ {Number(value).toFixed(2)}{suffix}</h2>
    </article>
  );
}

function MiniCard({ title, value, color, isMobile }: MiniCardProps) {
  const s = isMobile ? mobileStyles : desktopStyles;
  return (
    <article style={s.miniCard}>
      <p style={s.cardLabel}>{title}</p>
      <h3 style={{ ...s.miniValue, color }}>€ {Number(value).toFixed(2)}</h3>
    </article>
  );
}

// ── Dashboard principal ───────────────────────────────────────────────────────
function Dashboard({ days, isDemo }: DashboardProps) {
  const { costs } = useContext(AppContext);
  const [period, setPeriod] = useState<Period>('all');
  const [insight, setInsight] = useState<string>('');
  const isMobile = useIsMobile();

  const custoSemanal = calcularCustoSemanal(costs);
  const diasSemanaActual = useMemo(() => getSemanaActual(days), [days]);

  const semanaActual = useMemo(() => {
    return diasSemanaActual.reduce(
      (acc, day) => {
        const d = calcularDia(day);
        acc.lucro += d.lucro;
        acc.ganho += d.ganho;
        acc.horas += d.horas;
        return acc;
      },
      { lucro: 0, ganho: 0, horas: 0 },
    );
  }, [diasSemanaActual]);

  const margem = semanaActual.lucro - custoSemanal;
  const temCustos = custoSemanal > 0;
  const temDadosSemana = diasSemanaActual.length > 0;
  const mediaHoraSemana = semanaActual.horas > 0 ? semanaActual.lucro / semanaActual.horas : 0;

  function gerarAnaliseBreakEven(): BreakEvenAnalysis | null {
    if (!temCustos) return null;
    if (!temDadosSemana) {
      return {
        tipo: 'info',
        linhas: [
          `📋 Os teus custos fixos semanais são €${custoSemanal.toFixed(2)}.`,
          `Ainda não tens dias registados esta semana. Adiciona o primeiro dia para ver a análise.`,
        ],
      };
    }
    const hojeIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    const diasRestantes = 6 - hojeIndex;
    const linhas: string[] = [];
    if (margem >= 0) {
      const percentagem = Math.round((semanaActual.lucro / custoSemanal) * 100);
      linhas.push(`✅ Estás acima do break-even esta semana.`);
      linhas.push(`Lucro: €${semanaActual.lucro.toFixed(2)} · Custos: €${custoSemanal.toFixed(2)} · Margem: +€${margem.toFixed(2)} (${percentagem}%)`);
      if (mediaHoraSemana > 0) {
        linhas.push(`💡 Estás a ganhar €${mediaHoraSemana.toFixed(2)}/h esta semana. ${mediaHoraSemana >= 10 ? 'Boa rentabilidade.' : 'Considera optimizar os horários de pico.'}`);
      }
    } else {
      const falta = Math.abs(margem);
      linhas.push(`🚨 Ainda faltam €${falta.toFixed(2)} para cobrir os custos fixos desta semana.`);
      linhas.push(`Lucro actual: €${semanaActual.lucro.toFixed(2)} · Necessário: €${custoSemanal.toFixed(2)}`);
      if (diasRestantes > 0 && semanaActual.horas > 0) {
        const lucroMediaDia = semanaActual.lucro / diasSemanaActual.length;
        const diasNecessarios = Math.ceil(falta / lucroMediaDia);
        const horasNecessarias = Math.ceil(falta / mediaHoraSemana);
        if (diasNecessarios <= diasRestantes) {
          linhas.push(`📅 Ao teu ritmo actual (€${lucroMediaDia.toFixed(2)}/dia), precisas de mais ${diasNecessarios} dia${diasNecessarios > 1 ? 's' : ''} de trabalho para cobrir os custos.`);
        } else {
          linhas.push(`⚠️ Ao ritmo actual não consegues cobrir os custos esta semana. Considera aumentar as horas nos dias de maior procura.`);
        }
        linhas.push(`⏱ Precisas de mais ${horasNecessarias}h de trabalho a €${mediaHoraSemana.toFixed(2)}/h para fechar o break-even.`);
      } else if (diasRestantes === 0) {
        linhas.push(`📉 A semana terminou abaixo do break-even. Na próxima semana foca os primeiros dias para garantir a cobertura dos custos.`);
      }
    }
    return { tipo: margem >= 0 ? 'positivo' : 'negativo', linhas };
  }

  const analiseBreakEven = gerarAnaliseBreakEven();

  const filteredDays = useMemo(() => {
    const today = new Date();
    return days
      .filter((day) => {
        if (!day.date) return false;
        const date = new Date(day.date);
        const diff = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        if (period === '7d') return diff <= 7;
        if (period === '30d') return diff <= 30;
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [days, period]);

  const totals = filteredDays.reduce(
    (acc, day) => {
      const d = calcular(day);
      acc.ganho += d.ganho; acc.uber += d.uber; acc.bolt += d.bolt;
      acc.gorjetas += d.gorjetas;
      acc.combustivel += d.combustivel; acc.operador += d.operador;
      acc.despesas += d.despesas; acc.lucro += d.lucro; acc.horas += d.horas;
      return acc;
    },
    { ganho: 0, uber: 0, bolt: 0, gorjetas: 0, combustivel: 0, operador: 0, despesas: 0, lucro: 0, horas: 0 },
  );

  const mediaHora = totals.horas > 0 ? totals.lucro / totals.horas : 0;

  const weeklyData = useMemo((): WeekData[] => {
    const weeks: WeekAccumulator = {};
    filteredDays.forEach((day) => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(date);
      monday.setDate(date.getDate() + diff);
      const key = monday.toISOString().split('T')[0];
      if (!weeks[key]) weeks[key] = { ganho: 0, lucro: 0, despesas: 0, uber: 0, bolt: 0, dias: 0 };
      const d = calcular(day);
      weeks[key].ganho += d.ganho; weeks[key].lucro += d.lucro;
      weeks[key].despesas += d.despesas; weeks[key].uber += d.uber;
      weeks[key].bolt += d.bolt; weeks[key].dias += 1;
    });

    const fmt = (d: Date) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;

    return Object.entries(weeks)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([monday, data]) => {
        const date = new Date(monday);
        const end = new Date(date);
        end.setDate(date.getDate() + 6);
        const label = isMobile ? fmt(date) : `${fmt(date)} – ${fmt(end)}`;
        return { label, labelFull: `${fmt(date)} – ${fmt(end)}`, ...data };
      });
  }, [filteredDays, isMobile]);

  const trendChartData = {
    labels: weeklyData.map((w) => w.label),
    datasets: [
      { label: 'Lucro', data: weeklyData.map((w) => parseFloat(w.lucro.toFixed(2))), borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.12)', borderWidth: 3, pointBackgroundColor: '#8b5cf6', pointRadius: isMobile ? 4 : 6, pointHoverRadius: 8, tension: 0.4, fill: true },
      { label: 'Ganho', data: weeklyData.map((w) => parseFloat(w.ganho.toFixed(2))), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.06)', borderWidth: 3, pointBackgroundColor: '#22c55e', pointRadius: isMobile ? 4 : 6, pointHoverRadius: 8, tension: 0.4, fill: false },
      { label: 'Despesas', data: weeklyData.map((w) => parseFloat(w.despesas.toFixed(2))), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.06)', borderWidth: 2, pointBackgroundColor: '#ef4444', pointRadius: isMobile ? 3 : 5, pointHoverRadius: 7, tension: 0.4, fill: false, borderDash: [6, 3] },
    ],
  };

  const trendChartOptions = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { labels: { color: '#475569', font: { weight: 700 as const, size: isMobile ? 11 : 12 }, usePointStyle: true, pointStyleWidth: 8 } },
      tooltip: { backgroundColor: '#0f172a', padding: 12, callbacks: { label: (ctx: { dataset: { label: string }; raw: unknown }) => ` ${ctx.dataset.label}: €${Number(ctx.raw).toFixed(2)}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: 700 as const, size: isMobile ? 10 : 12 }, maxRotation: 0 } },
      y: { beginAtZero: true, ticks: { color: '#64748b', font: { size: isMobile ? 10 : 12 }, callback: (v: number | string) => `€${v}` }, grid: { color: '#e5e7eb' } },
    },
  };

  const chartData = {
    labels: filteredDays.map((day) => new Date(day.date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })),
    datasets: [
      { label: 'Uber', data: filteredDays.map((d) => calcular(d).uber), backgroundColor: '#22c55e', borderRadius: 6 },
      { label: 'Bolt', data: filteredDays.map((d) => calcular(d).bolt), backgroundColor: '#3b82f6', borderRadius: 6 },
      { label: 'Despesas', data: filteredDays.map((d) => calcular(d).despesas), backgroundColor: '#ef4444', borderRadius: 6 },
      { label: 'Lucro', data: filteredDays.map((d) => calcular(d).lucro), backgroundColor: '#8b5cf6', borderRadius: 6 },
    ],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#475569', font: { weight: 700 as const, size: isMobile ? 10 : 12 } } },
      tooltip: { backgroundColor: '#0f172a', padding: 12, callbacks: { label: (ctx: { dataset: { label: string }; raw: unknown }) => `${ctx.dataset.label}: €${Number(ctx.raw).toFixed(2)}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: 700 as const, size: isMobile ? 8 : 12 }, maxRotation: isMobile ? 45 : 0, maxTicksLimit: isMobile ? 10 : 999 } },
      y: { beginAtZero: true, ticks: { color: '#64748b', font: { size: isMobile ? 10 : 12 }, callback: (v: number | string) => `€${v}` }, grid: { color: '#e5e7eb' } },
    },
  };

  function gerarAnaliseIA(): string {
    if (filteredDays.length === 0) return 'Sem dados suficientes para gerar uma análise.';
    let texto = '📊 Análise Inteligente\n\n';
    texto += `Lucro total: €${totals.lucro.toFixed(2)}\n`;
    texto += `Ganho total: €${totals.ganho.toFixed(2)}\n`;
    if (totals.gorjetas > 0) texto += `Total gorjetas: €${totals.gorjetas.toFixed(2)}\n`;
    texto += `Despesas totais: €${totals.despesas.toFixed(2)}\n`;
    texto += `Média por hora: €${mediaHora.toFixed(2)}\n`;
    if (temCustos) texto += `Custo fixo semanal: €${custoSemanal.toFixed(2)}\n`;
    texto += '\n';
    if (totals.lucro < 0) {
      texto += '🚨 O período está negativo. Prioridade: rever combustível, percentagem do operador e horários de trabalho.\n\n';
    } else if (mediaHora < 10) {
      texto += '⚠️ O lucro existe, mas a rentabilidade por hora está baixa. O foco deve ser melhorar horários e zonas de maior procura.\n\n';
    } else {
      texto += '✅ A rentabilidade está saudável. O objetivo agora é repetir os padrões dos melhores dias.\n\n';
    }
    if (weeklyData.length >= 2) {
      const ultima = weeklyData[weeklyData.length - 1];
      const penultima = weeklyData[weeklyData.length - 2];
      if (ultima && penultima) {
        const diff = ultima.lucro - penultima.lucro;
        if (diff > 0) texto += `📈 A última semana foi €${diff.toFixed(2)} melhor que a anterior.\n`;
        else if (diff < 0) texto += `📉 A última semana foi €${Math.abs(diff).toFixed(2)} pior que a anterior.\n`;
      }
    }
    if (totals.uber > totals.bolt) texto += '💡 Uber teve melhor desempenho que Bolt neste período.\n';
    else if (totals.bolt > totals.uber) texto += '💡 Bolt teve melhor desempenho que Uber neste período.\n';
    else texto += '💡 Uber e Bolt tiveram desempenho semelhante.\n';
    texto += '\n👉 Próximo passo: compare os dias com maior lucro e identifique horário, plataforma e custo de combustível.';
    return texto;
  }

  const s = isMobile ? mobileStyles : desktopStyles;
  const breakEvenColors: BreakEvenColors = {
    positivo: { background: '#f0fdf4', border: '1px solid #86efac' },
    negativo: { background: '#fef2f2', border: '1px solid #fca5a5' },
    info: { background: '#eef2ff', border: '1px solid #c7d2fe' },
  };

  return (
    <div>
      <header style={s.header}>
        <div style={{ flex: 1 }}>
          <p style={s.eyebrow}>Performance Overview</p>
          <h1 style={s.title}>Dashboard</h1>
          {!isMobile && (
            <p style={s.subtitle}>
              Acompanhe ganhos, plataformas, despesas e lucro real com visão clara para decisão.
            </p>
          )}
        </div>
        <button style={s.aiButton} onClick={() => setInsight(gerarAnaliseIA())}>
          {isMobile ? '🤖 IA' : '🤖 Analisar com IA'}
        </button>
      </header>

      {analiseBreakEven && (
        <section style={{ ...s.breakEvenBox, ...breakEvenColors[analiseBreakEven.tipo] }}>
          <p style={s.breakEvenTitulo}>
            {analiseBreakEven.tipo === 'positivo' ? '✅' : analiseBreakEven.tipo === 'negativo' ? '🚨' : '📋'} Análise da Semana Actual
            {temCustos && <span style={s.breakEvenCusto}> · Custo semanal: €{custoSemanal.toFixed(2)}</span>}
          </p>
          {analiseBreakEven.linhas.map((linha, i) => (
            <p key={i} style={s.breakEvenLinha}>{linha}</p>
          ))}
          {!temCustos && (
            <p style={{ ...s.breakEvenLinha, color: '#6366f1', marginTop: '8px' }}>
              👉 Define os teus custos em <strong>Custos Fixos</strong> para activar esta análise.
            </p>
          )}
        </section>
      )}

      <section style={s.filters}>
        {(['7d', '30d', 'all'] as Period[]).map((value) => (
          <button key={value} onClick={() => setPeriod(value)}
            style={{ ...s.filter, ...(period === value ? s.filterActive : {}) }}>
            {value === '7d' ? '7 dias' : value === '30d' ? '30 dias' : 'Todos'}
          </button>
        ))}
      </section>

      <section style={s.kpiGrid}>
        <KpiCard title="Lucro Total" value={totals.lucro} color="#16a34a" featured isMobile={isMobile} />
        <KpiCard title="Ganho Total" value={totals.ganho} color="#2563eb" isMobile={isMobile} />
        <KpiCard title="Despesas" value={totals.despesas} color="#dc2626" isMobile={isMobile} />
        <KpiCard title="€/Hora" value={mediaHora} color="#7c3aed" suffix="/h" isMobile={isMobile} />
      </section>

      <section style={s.miniGrid}>
        <MiniCard title="Uber" value={totals.uber} color="#22c55e" isMobile={isMobile} />
        <MiniCard title="Bolt" value={totals.bolt} color="#3b82f6" isMobile={isMobile} />
        <MiniCard title="Gorjetas 🎁" value={totals.gorjetas} color="#f59e0b" isMobile={isMobile} />
        <MiniCard title="Combustível" value={totals.combustivel} color="#f97316" isMobile={isMobile} />
        <MiniCard title="Operador" value={totals.operador} color="#eab308" isMobile={isMobile} />
      </section>

      {insight && <section style={s.insightBox}>{insight}</section>}

      {weeklyData.length >= 2 && (
        <section style={s.chartCard}>
          <div style={s.chartHeader}>
            <div>
              <p style={s.eyebrow}>Weekly Trend</p>
              <h2 style={s.sectionTitle}>Evolução Semanal de Lucro</h2>
            </div>
            <span style={s.badge}>{weeklyData.length} semanas</span>
          </div>
          <div style={s.weekGrid}>
            {weeklyData.map((w, i) => {
              const prev = weeklyData[i - 1];
              const delta = prev ? w.lucro - prev.lucro : null;
              return (
                <div key={i} style={s.weekCard}>
                  <p style={s.weekLabel}>{w.labelFull || w.label}</p>
                  <p style={{ ...s.weekValue, color: w.lucro >= 0 ? '#16a34a' : '#dc2626' }}>
                    €{w.lucro.toFixed(2)}
                  </p>
                  {delta !== null && (
                    <p style={{ ...s.weekDelta, color: delta >= 0 ? '#16a34a' : '#dc2626' }}>
                      {delta >= 0 ? '▲' : '▼'} €{Math.abs(delta).toFixed(2)}
                    </p>
                  )}
                  <p style={s.weekDias}>{w.dias} dias</p>
                </div>
              );
            })}
          </div>
          <div style={s.chartBox}>
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
        </section>
      )}

      {(!isMobile || filteredDays.length <= 14) && (
        <section style={{ ...s.chartCard, marginTop: '16px' }}>
          <div style={s.chartHeader}>
            <div>
              <p style={s.eyebrow}>Breakdown</p>
              <h2 style={s.sectionTitle}>{isMobile ? 'Uber vs Bolt vs Lucro' : 'Uber vs Bolt vs Despesas vs Lucro'}</h2>
            </div>
            <span style={s.badge}>{filteredDays.length} dias</span>
          </div>
          <div style={s.chartBox}>
            {filteredDays.length > 0 ? <Bar data={chartData} options={chartOptions} /> : <p style={s.empty}>Sem dados para apresentar.</p>}
          </div>
        </section>
      )}

      {isMobile && filteredDays.length > 14 && (
        <section style={{ ...s.chartCard, marginTop: '16px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#64748b', fontWeight: 700, fontSize: '14px' }}>
            📱 Gráfico diário disponível em ecrã maior.<br />
            Use o filtro <strong>7 dias</strong> ou <strong>30 dias</strong> para ver o breakdown.
          </p>
        </section>
      )}
    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const desktopStyles: Styles = {
  header: { display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'flex-start', marginBottom: '24px' },
  eyebrow: { margin: 0, fontSize: '12px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6366f1' },
  title: { margin: '8px 0', fontSize: '42px', fontWeight: 900, letterSpacing: '-0.04em' },
  subtitle: { margin: 0, color: '#64748b', fontSize: '16px', maxWidth: '720px', lineHeight: 1.6 },
  aiButton: { padding: '14px 18px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontWeight: 900, cursor: 'pointer', boxShadow: '0 16px 34px rgba(79,70,229,0.25)', whiteSpace: 'nowrap' },
  breakEvenBox: { padding: '20px 24px', borderRadius: '20px', marginBottom: '20px' },
  breakEvenTitulo: { margin: '0 0 10px', fontWeight: 900, fontSize: '15px', color: '#0f172a' },
  breakEvenCusto: { fontSize: '13px', fontWeight: 700, color: '#64748b' },
  breakEvenLinha: { margin: '4px 0 0', fontSize: '14px', lineHeight: 1.7, color: '#1e293b', fontWeight: 600 },
  filters: { display: 'flex', gap: '10px', marginBottom: '24px' },
  filter: { padding: '11px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontWeight: 800, cursor: 'pointer' },
  filterActive: { background: '#0f172a', color: '#ffffff', borderColor: '#0f172a' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '18px' },
  kpiCard: { padding: '24px', borderRadius: '24px', background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 18px 45px rgba(15,23,42,0.06)' },
  kpiFeatured: { border: '1px solid rgba(79,70,229,0.35)', boxShadow: '0 22px 55px rgba(79,70,229,0.14)' },
  cardLabel: { margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 800 },
  kpiValue: { margin: '18px 0 0', fontSize: '32px', letterSpacing: '-0.04em' },
  miniGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' },
  miniCard: { padding: '18px', borderRadius: '20px', background: '#ffffff', border: '1px solid #e5e7eb' },
  miniValue: { margin: '12px 0 0', fontSize: '24px' },
  insightBox: { whiteSpace: 'pre-line', padding: '22px', borderRadius: '22px', background: '#eef2ff', border: '1px solid #c7d2fe', color: '#1e1b4b', lineHeight: 1.7, marginBottom: '22px', fontWeight: 600 },
  chartCard: { padding: '26px', borderRadius: '28px', background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 22px 60px rgba(15,23,42,0.07)' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px' },
  sectionTitle: { margin: '8px 0 0', fontSize: '26px' },
  badge: { padding: '9px 14px', borderRadius: '999px', background: '#f1f5f9', color: '#475569', fontWeight: 900, whiteSpace: 'nowrap' },
  chartBox: { height: '340px' },
  empty: { color: '#64748b', fontWeight: 700 },
  weekGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' },
  weekCard: { padding: '16px', borderRadius: '18px', background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' },
  weekLabel: { margin: '0 0 8px', fontSize: '11px', fontWeight: 900, color: '#64748b', letterSpacing: '0.05em' },
  weekValue: { margin: 0, fontSize: '22px', fontWeight: 900 },
  weekDelta: { margin: '4px 0 0', fontSize: '13px', fontWeight: 800 },
  weekDias: { margin: '6px 0 0', fontSize: '11px', color: '#94a3b8', fontWeight: 700 },
};

const mobileStyles: Styles = {
  ...desktopStyles,
  header: { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '16px' },
  title: { margin: '4px 0 0', fontSize: '26px', fontWeight: 900, letterSpacing: '-0.03em' },
  aiButton: { padding: '10px 12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontWeight: 900, cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap', flexShrink: 0 },
  breakEvenBox: { padding: '16px', borderRadius: '18px', marginBottom: '16px' },
  breakEvenTitulo: { margin: '0 0 8px', fontWeight: 900, fontSize: '14px', color: '#0f172a' },
  breakEvenLinha: { margin: '4px 0 0', fontSize: '13px', lineHeight: 1.6, color: '#1e293b', fontWeight: 600 },
  filters: { display: 'flex', gap: '8px', marginBottom: '16px' },
  filter: { padding: '9px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontWeight: 800, cursor: 'pointer', fontSize: '13px' },
  filterActive: { background: '#0f172a', color: '#ffffff', borderColor: '#0f172a' },
  kpiGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' },
  kpiCard: { padding: '16px', borderRadius: '18px', background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(15,23,42,0.06)' },
  kpiFeatured: { border: '1px solid rgba(79,70,229,0.35)', boxShadow: '0 12px 30px rgba(79,70,229,0.12)' },
  cardLabel: { margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 800 },
  kpiValue: { margin: '10px 0 0', fontSize: '22px', letterSpacing: '-0.03em' },
  miniGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' },
  miniCard: { padding: '14px', borderRadius: '16px', background: '#ffffff', border: '1px solid #e5e7eb' },
  miniValue: { margin: '8px 0 0', fontSize: '18px' },
  insightBox: { whiteSpace: 'pre-line', padding: '16px', borderRadius: '18px', background: '#eef2ff', border: '1px solid #c7d2fe', color: '#1e1b4b', lineHeight: 1.6, marginBottom: '16px', fontWeight: 600, fontSize: '13px' },
  chartCard: { padding: '18px', borderRadius: '22px', background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 8px 30px rgba(15,23,42,0.06)' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '10px' },
  sectionTitle: { margin: '4px 0 0', fontSize: '18px', fontWeight: 900 },
  badge: { padding: '6px 10px', borderRadius: '999px', background: '#f1f5f9', color: '#475569', fontWeight: 900, fontSize: '12px', whiteSpace: 'nowrap' },
  chartBox: { height: '240px' },
  empty: { color: '#64748b', fontWeight: 700 },
  weekGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' },
  weekCard: { padding: '12px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' },
  weekLabel: { margin: '0 0 6px', fontSize: '10px', fontWeight: 900, color: '#64748b', letterSpacing: '0.04em' },
  weekValue: { margin: 0, fontSize: '18px', fontWeight: 900 },
  weekDelta: { margin: '3px 0 0', fontSize: '12px', fontWeight: 800 },
  weekDias: { margin: '4px 0 0', fontSize: '10px', color: '#94a3b8', fontWeight: 700 },
};

export default Dashboard;
