import { useContext, useState, useEffect } from 'react';
import { AppContext, calcularCustoSemanal, calcularCustosVariaveisDias } from '../context/AppContext';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function getSemanaActual(days) {
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

const categorias = [
  {
    titulo: '🚗 Viatura',
    campos: [
      { key: 'aluguer', label: 'Aluguer do carro', periodo: 'semanal' },
      { key: 'prestacao', label: 'Prestação / Financiamento', periodo: 'mensal' },
      { key: 'seguro', label: 'Seguro', periodo: 'mensal' },
      { key: 'iuc', label: 'IUC', periodo: 'anual' },
    ],
  },
  {
    titulo: '💼 Operador',
    campos: [
      { key: 'operadorPercent', label: '% paga ao Operador', periodo: '% do ganho bruto', isPercent: true },
    ],
  },
  {
    titulo: '🔧 Manutenção',
    campos: [
      { key: 'oleo', label: 'Óleo / Filtros', periodo: 'mensal' },
      { key: 'pneus', label: 'Pneus', periodo: 'mensal' },
      { key: 'revisoes', label: 'Revisões / Reparações', periodo: 'mensal' },
    ],
  },
  {
    titulo: '📋 Operacional',
    campos: [
      { key: 'lavagens', label: 'Lavagens', periodo: 'semanal' },
      { key: 'alimentacao', label: 'Alimentação', periodo: 'semanal' },
      { key: 'iva', label: 'IVA / Impostos', periodo: 'mensal' },
    ],
  },
  {
    titulo: '📦 Outros',
    campos: [
      { key: 'outros', label: 'Outros custos', periodo: 'semanal' },
    ],
  },
];

export default function Costs() {
  const { costs, updateCosts, days } = useContext(AppContext);
  const [form, setForm] = useState(costs);
  const [saved, setSaved] = useState(false);
  const isMobile = useIsMobile();

  const custoFixoSemanal = calcularCustoSemanal(form);

  // Custos variáveis da semana actual (combustivel + operador dos dias reais)
  const diasSemana = getSemanaActual(days);
  const custosVariaveis = calcularCustosVariaveisDias(diasSemana);

  // Lucro da semana actual
  const lucroSemana = diasSemana.reduce((acc, day) => {
    let ganho = 0;
    if (Array.isArray(day.rides) && day.rides.length > 0) {
      ganho = day.rides.reduce((s, r) => s + (Number(r.valor) || 0), 0);
    } else {
      ganho = Number(day.ganho) || 0;
    }
    const combustivel = Number(day.combustivel) || 0;
    const operador = ganho * ((Number(day.operadorPercent) || 0) / 100);
    return acc + ganho - combustivel - operador;
  }, 0);

  const custoTotalSemanal = custoFixoSemanal + custosVariaveis.combustivel + custosVariaveis.operador;
  const margem = diasSemana.length > 0 ? lucroSemana - custoTotalSemanal : null;
  const temDadosSemana = diasSemana.length > 0;

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    updateCosts(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function gerarAnalise() {
    if (custoFixoSemanal === 0 && custosVariaveis.combustivel === 0) return null;

    if (!temDadosSemana) {
      return {
        tipo: 'info',
        emoji: '📋',
        texto: `Custo fixo semanal estimado: €${custoFixoSemanal.toFixed(2)}. Adiciona dias de trabalho para ver a análise completa com combustível e operador reais.`,
      };
    }

    const percentagem = custoTotalSemanal > 0 ? (lucroSemana / custoTotalSemanal) * 100 : 0;

    if (margem >= 0 && percentagem >= 130) {
      return {
        tipo: 'positivo',
        emoji: '✅',
        texto: `Excelente semana. Margem real de €${margem.toFixed(2)} acima de todos os custos (${Math.round(percentagem)}% cobertos).`,
      };
    } else if (margem >= 0) {
      return {
        tipo: 'neutro',
        emoji: '⚠️',
        texto: `Cobriste os custos com margem de €${margem.toFixed(2)}. Margem apertada — considera optimizar horários.`,
      };
    } else {
      return {
        tipo: 'negativo',
        emoji: '🚨',
        texto: `Faltam €${Math.abs(margem).toFixed(2)} para cobrir todos os custos desta semana. Lucro: €${lucroSemana.toFixed(2)} · Total custos: €${custoTotalSemanal.toFixed(2)}`,
      };
    }
  }

  const analise = gerarAnalise();
  const s = isMobile ? mobileStyles : desktopStyles;

  return (
    <div>
      <header style={s.header}>
        <div>
          <p style={s.eyebrow}>Cost Control</p>
          <h1 style={s.title}>Custos Fixos</h1>
          {!isMobile && (
            <p style={s.subtitle}>
              Define os teus custos reais. Combustível e operador são calculados automaticamente dos dias registados.
            </p>
          )}
        </div>
      </header>

      {/* Resumo semanal completo */}
      {(custoFixoSemanal > 0 || temDadosSemana) && (
        <section style={s.summaryGrid}>
          <div style={s.summaryCard}>
            <p style={s.summaryLabel}>Custos Fixos / Semana</p>
            <p style={{ ...s.summaryValue, color: '#dc2626' }}>€{custoFixoSemanal.toFixed(2)}</p>
          </div>
          {temDadosSemana && (
            <>
              <div style={s.summaryCard}>
                <p style={s.summaryLabel}>Combustível (esta semana)</p>
                <p style={{ ...s.summaryValue, color: '#f97316' }}>€{custosVariaveis.combustivel.toFixed(2)}</p>
                <p style={s.summaryNote}>dos dias registados</p>
              </div>
              <div style={s.summaryCard}>
                <p style={s.summaryLabel}>Operador (esta semana)</p>
                <p style={{ ...s.summaryValue, color: '#eab308' }}>€{custosVariaveis.operador.toFixed(2)}</p>
                <p style={s.summaryNote}>{costs.operadorPercent || 0}% do ganho bruto</p>
              </div>
              <div style={s.summaryCard}>
                <p style={s.summaryLabel}>Custo Total Real</p>
                <p style={{ ...s.summaryValue, color: '#0f172a' }}>€{custoTotalSemanal.toFixed(2)}</p>
              </div>
              {margem !== null && (
                <div style={s.summaryCard}>
                  <p style={s.summaryLabel}>Margem Real</p>
                  <p style={{ ...s.summaryValue, color: margem >= 0 ? '#16a34a' : '#dc2626' }}>
                    {margem >= 0 ? '+' : ''}€{margem.toFixed(2)}
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Análise */}
      {analise && (
        <section style={{ ...s.analiseBox, ...analiseColors[analise.tipo] }}>
          <p style={s.analiseEmoji}>{analise.emoji} Análise Semanal</p>
          <p style={s.analiseTexto}>{analise.texto}</p>
        </section>
      )}

      {/* Formulário por categorias */}
      {categorias.map((cat) => (
        <section key={cat.titulo} style={s.card}>
          <h2 style={s.catTitulo}>{cat.titulo}</h2>
          <div style={s.camposGrid}>
            {cat.campos.map((campo) => (
              <label key={campo.key} style={s.label}>
                <span style={s.labelText}>
                  {campo.label}
                  <span style={s.periodo}> ({campo.periodo})</span>
                </span>
                <div style={s.inputWrapper}>
                  <span style={s.euro}>{campo.isPercent ? '%' : '€'}</span>
                  <input
                    type="number"
                    min="0"
                    max={campo.isPercent ? '100' : undefined}
                    step={campo.isPercent ? '0.1' : '0.01'}
                    value={form[campo.key] || ''}
                    onChange={(e) => handleChange(campo.key, e.target.value)}
                    style={s.input}
                    placeholder={campo.isPercent ? '0' : '0.00'}
                  />
                </div>
              </label>
            ))}
          </div>

          {/* Nota explicativa para o operador */}
          {cat.titulo.includes('Operador') && (
            <p style={s.nota}>
              💡 Esta percentagem é aplicada automaticamente a cada dia que adicionares. O valor semanal real aparece no resumo acima.
            </p>
          )}
        </section>
      ))}

      {/* Nota sobre combustível */}
      <div style={s.notaBox}>
        <p style={s.notaTexto}>
          ⛽ O <strong>combustível</strong> é registado por dia em "Adicionar Dia" e somado automaticamente aqui. Não precisas de o inserir duas vezes.
        </p>
      </div>

      <button onClick={handleSave} style={s.saveButton}>
        {saved ? '✅ Guardado!' : '💾 Guardar Custos'}
      </button>
    </div>
  );
}

const analiseColors = {
  positivo: { background: '#f0fdf4', borderColor: '#86efac' },
  neutro: { background: '#fefce8', borderColor: '#fde047' },
  negativo: { background: '#fef2f2', borderColor: '#fca5a5' },
  info: { background: '#eef2ff', borderColor: '#c7d2fe' },
};

const desktopStyles = {
  header: { marginBottom: '24px' },
  eyebrow: { margin: 0, fontSize: '12px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6366f1' },
  title: { margin: '8px 0', fontSize: '42px', fontWeight: 900, letterSpacing: '-0.04em' },
  subtitle: { margin: 0, color: '#64748b', fontSize: '16px', lineHeight: 1.6 },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' },
  summaryCard: { padding: '18px 20px', borderRadius: '18px', background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(15,23,42,0.06)' },
  summaryLabel: { margin: '0 0 6px', fontSize: '12px', fontWeight: 800, color: '#64748b' },
  summaryValue: { margin: 0, fontSize: '26px', fontWeight: 900, letterSpacing: '-0.03em' },
  summaryNote: { margin: '4px 0 0', fontSize: '11px', color: '#94a3b8', fontWeight: 600 },
  analiseBox: { padding: '20px 24px', borderRadius: '20px', border: '1px solid', marginBottom: '20px' },
  analiseEmoji: { margin: '0 0 8px', fontWeight: 900, fontSize: '14px', color: '#0f172a' },
  analiseTexto: { margin: 0, fontSize: '15px', lineHeight: 1.7, color: '#1e293b', fontWeight: 600 },
  card: { padding: '24px', borderRadius: '24px', background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 8px 30px rgba(15,23,42,0.05)', marginBottom: '16px' },
  catTitulo: { margin: '0 0 20px', fontSize: '18px', fontWeight: 900 },
  camposGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  label: { display: 'flex', flexDirection: 'column', gap: '8px' },
  labelText: { fontSize: '14px', fontWeight: 800, color: '#475569' },
  periodo: { fontSize: '12px', fontWeight: 600, color: '#94a3b8' },
  inputWrapper: { display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '14px', overflow: 'hidden', background: '#ffffff' },
  euro: { padding: '12px 14px', background: '#f8fafc', color: '#64748b', fontWeight: 800, fontSize: '15px', borderRight: '1px solid #e2e8f0' },
  input: { flex: 1, padding: '12px 14px', border: 'none', outline: 'none', fontSize: '15px', background: 'transparent' },
  nota: { margin: '16px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 600, lineHeight: 1.6 },
  notaBox: { padding: '16px 20px', borderRadius: '16px', background: '#fff7ed', border: '1px solid #fed7aa', marginBottom: '16px' },
  notaTexto: { margin: 0, fontSize: '14px', color: '#9a3412', fontWeight: 600, lineHeight: 1.6 },
  saveButton: { width: '100%', padding: '16px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#ffffff', fontSize: '16px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 16px 34px rgba(79,70,229,0.25)', marginTop: '8px' },
};

const mobileStyles = {
  ...desktopStyles,
  title: { margin: '4px 0 0', fontSize: '26px', fontWeight: 900 },
  summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' },
  summaryCard: { padding: '14px 16px', borderRadius: '16px', background: '#ffffff', border: '1px solid #e5e7eb' },
  summaryValue: { margin: 0, fontSize: '20px', fontWeight: 900 },
  card: { padding: '18px', borderRadius: '20px', background: '#ffffff', border: '1px solid #e5e7eb', marginBottom: '12px' },
  camposGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '14px' },
  analiseBox: { padding: '16px', borderRadius: '18px', border: '1px solid', marginBottom: '16px' },
};
