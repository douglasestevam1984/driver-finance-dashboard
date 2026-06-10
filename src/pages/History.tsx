import { CSSProperties } from 'react';
import { Day } from '../types';

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface HistoryProps {
  days: Day[];
  setDays: React.Dispatch<React.SetStateAction<Day[]>>;
  onEdit: (day: Day) => void;
  isDemo?: boolean;
}

interface DayCalc {
  ganho: number;
  despesas: number;
  lucro: number;
}

type Styles = Record<string, CSSProperties>;

// ── Componente ────────────────────────────────────────────────────────────────
function History({ days, setDays, onEdit }: HistoryProps) {
  function calcular(day: Day): DayCalc {
    let ganho = 0;
    if (Array.isArray(day.rides) && day.rides.length > 0) {
      ganho = day.rides.reduce(
        (acc, ride) => acc + (Number(ride.valor) || 0),
        0,
      );
    } else {
      ganho = Number(day.ganho) || 0;
    }
    const combustivel = Number(day.combustivel) || 0;
    const operador = ganho * ((Number(day.operadorPercent) || 0) / 100);
    const despesas = combustivel + operador;
    const lucro = ganho - despesas;
    return { ganho, despesas, lucro };
  }

  function removerDia(id: string): void {
    setDays((prev) => prev.filter((day) => day.id !== id));
  }

  // Ordena do mais recente para o mais antigo
  const sortedDays = [...days].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div>
      <header style={styles.header}>
        <p style={styles.eyebrow}>Records</p>
        <h1 style={styles.title}>Histórico</h1>
        <p style={styles.subtitle}>Consulte, edite ou remova registos anteriores.</p>
      </header>

      <section style={styles.list}>
        {sortedDays.length === 0 && (
          <div style={styles.empty}>Ainda não existem registos.</div>
        )}
        {sortedDays.map((day) => {
          const d = calcular(day);
          const km = day.kmInicio && day.kmFim
            ? Math.max(0, (Number(day.kmFim) || 0) - (Number(day.kmInicio) || 0))
            : 0;
          return (
            <article key={day.id} style={styles.item}>
              <div>
                <p style={styles.date}>{day.date}</p>
                <p style={styles.meta}>
                  Modo: {day.mode === 'rides' ? 'Por corrida' : 'Total do dia'}
                  {km > 0 && ` · ${km} km`}
                </p>
              </div>
              <div style={styles.values}>
                <span>Ganho: € {d.ganho.toFixed(2)}</span>
                <span>Despesas: € {d.despesas.toFixed(2)}</span>
                <strong>Lucro: € {d.lucro.toFixed(2)}</strong>
              </div>
              <div style={styles.actions}>
                <button onClick={() => onEdit(day)} style={styles.edit}>
                  ✏️ Editar
                </button>
                <button onClick={() => removerDia(day.id)} style={styles.delete}>
                  Remover
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles: Styles = {
  header: { marginBottom: '24px' },
  eyebrow: { margin: 0, fontSize: '12px', fontWeight: 900, letterSpacing: '0.14em', color: '#6366f1', textTransform: 'uppercase' },
  title: { margin: '8px 0', fontSize: '42px', fontWeight: 900 },
  subtitle: { margin: 0, color: '#64748b' },
  list: { display: 'grid', gap: '14px' },
  empty: { padding: '28px', borderRadius: '20px', background: '#ffffff', border: '1px solid #e5e7eb', color: '#64748b', fontWeight: 800 },
  item: { display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '18px', alignItems: 'center', padding: '20px', borderRadius: '22px', background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 16px 40px rgba(15,23,42,0.05)' },
  date: { margin: 0, fontWeight: 900, color: '#0f172a' },
  meta: { margin: '6px 0 0', color: '#64748b', fontWeight: 700 },
  values: { display: 'flex', gap: '18px', flexWrap: 'wrap', color: '#475569', fontWeight: 800 },
  actions: { display: 'flex', gap: '8px' },
  edit: { border: '1px solid #c7d2fe', background: '#eef2ff', color: '#4f46e5', padding: '10px 14px', borderRadius: '12px', fontWeight: 900, cursor: 'pointer' },
  delete: { border: 'none', background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '12px', fontWeight: 900, cursor: 'pointer' },
};

export default History;
