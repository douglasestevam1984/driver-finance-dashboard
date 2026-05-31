import { useContext, useState, CSSProperties, FormEvent, ChangeEvent } from 'react';
import { AppContext } from '../context/AppContext';
import { Day, Ride } from '../types';

interface AddDayProps {
  onSave: (day: Day) => void;
}

interface FormState {
  date: string;
  uberTotal: string;
  boltTotal: string;
  gorjetaUber: string;
  gorjetaBolt: string;
  gorjetaDinheiro: string;
  combustivel: string;
  horas: string;
  kmInicio: string;
  kmFim: string;
  rides: Ride[];
}

interface InputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  highlight?: boolean;
  placeholder?: string;
}

type Mode = 'total' | 'rides';
type Styles = Record<string, CSSProperties>;

function Input({ label, type, value, onChange, readOnly, highlight, placeholder }: InputProps) {
  return (
    <label style={styles.label}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        style={{
          ...styles.input,
          ...(readOnly ? styles.inputReadOnly : {}),
          ...(highlight ? styles.inputHighlight : {}),
        }}
        readOnly={readOnly}
        placeholder={placeholder}
      />
    </label>
  );
}

function AddDay({ onSave }: AddDayProps) {
  const { costs } = useContext(AppContext);
  const [mode, setMode] = useState<Mode>('total');

  const [form, setForm] = useState<FormState>({
    date: '',
    uberTotal: '',
    boltTotal: '',
    gorjetaUber: '',
    gorjetaBolt: '',
    gorjetaDinheiro: '',
    combustivel: '',
    horas: '',
    kmInicio: '',
    kmFim: '',
    rides: [],
  });

  const [ride, setRide] = useState<Ride>({ plataforma: 'uber', valor: '' });

  const ganhoCalculado: number =
    mode === 'rides'
      ? form.rides.reduce((s, r) => s + (Number(r.valor) || 0), 0)
      : (Number(form.uberTotal) || 0) +
        (Number(form.boltTotal) || 0) +
        (Number(form.gorjetaUber) || 0) +
        (Number(form.gorjetaBolt) || 0) +
        (Number(form.gorjetaDinheiro) || 0);

  const totalGorjetas: number =
    (Number(form.gorjetaUber) || 0) +
    (Number(form.gorjetaBolt) || 0) +
    (Number(form.gorjetaDinheiro) || 0);

  const combustivelPreview = Number(form.combustivel) || 0;
  const operadorPreview = ganhoCalculado * ((Number(costs.operadorPercent) || 0) / 100);
  const lucroPreview = ganhoCalculado - combustivelPreview - operadorPreview;

  // Km calculados automaticamente
  const kmTotal: number =
    form.kmInicio && form.kmFim
      ? Math.max(0, (Number(form.kmFim) || 0) - (Number(form.kmInicio) || 0))
      : 0;

  const custoPorKm: number =
    kmTotal > 0 && ganhoCalculado > 0
      ? lucroPreview / kmTotal
      : 0;

  function addRide(): void {
    if (!ride.valor) return;
    setForm((prev) => ({ ...prev, rides: [...prev.rides, ride] }));
    setRide({ plataforma: 'uber', valor: '' });
  }

  function removeRide(index: number): void {
    setForm((prev) => ({
      ...prev,
      rides: prev.rides.filter((_, i) => i !== index),
    }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const newDay: Day = {
      ...form,
      id: crypto.randomUUID(),
      mode,
      ganho: String(ganhoCalculado),
      operadorPercent: costs.operadorPercent || 0,
    };
    onSave(newDay);
    setForm({
      date: '',
      uberTotal: '',
      boltTotal: '',
      gorjetaUber: '',
      gorjetaBolt: '',
      gorjetaDinheiro: '',
      combustivel: '',
      horas: '',
      kmInicio: '',
      kmFim: '',
      rides: [],
    });
  }

  return (
    <div>
      <header style={styles.header}>
        <p style={styles.eyebrow}>New Entry</p>
        <h1 style={styles.title}>Adicionar Dia</h1>
        <p style={styles.subtitle}>
          Registe um dia completo ou detalhe corrida por corrida.
        </p>
      </header>

      {costs.operadorPercent > 0 && (
        <div style={styles.operadorInfo}>
          <span>⚙️ % Operador configurado: <strong>{costs.operadorPercent}%</strong></span>
          <span style={styles.operadorSub}>Aplicado automaticamente a este dia</span>
        </div>
      )}

      <section style={styles.card}>
        <div style={styles.modeSwitch}>
          <button type="button" onClick={() => setMode('total')}
            style={{ ...styles.modeButton, ...(mode === 'total' ? styles.modeActive : {}) }}>
            Total do dia
          </button>
          <button type="button" onClick={() => setMode('rides')}
            style={{ ...styles.modeButton, ...(mode === 'rides' ? styles.modeActive : {}) }}>
            Por corrida
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Input label="Data" type="date" value={form.date}
            onChange={(value) => setForm({ ...form, date: value })} />

          {mode === 'total' && (
            <>
              <label style={styles.label}>
                Ganho Total
                <div style={styles.ganhoWrapper}>
                  <span style={styles.ganhoEuro}>€</span>
                  <input type="number" value={ganhoCalculado > 0 ? ganhoCalculado.toFixed(2) : ''}
                    readOnly style={styles.ganhoInput} placeholder="Calculado automaticamente" />
                  <span style={styles.ganhoAuto}>auto</span>
                </div>
              </label>

              <Input label="Total Uber" type="number" value={form.uberTotal}
                onChange={(value) => setForm({ ...form, uberTotal: value })} />
              <Input label="Total Bolt" type="number" value={form.boltTotal}
                onChange={(value) => setForm({ ...form, boltTotal: value })} />

              <div style={styles.gorjetasBox}>
                <p style={styles.gorjetasTitle}>🎁 Gorjetas</p>
                <div style={styles.gorjetasGrid}>
                  <Input label="Gorjeta Uber (app)" type="number" value={form.gorjetaUber}
                    onChange={(value) => setForm({ ...form, gorjetaUber: value })} />
                  <Input label="Gorjeta Bolt (app)" type="number" value={form.gorjetaBolt}
                    onChange={(value) => setForm({ ...form, gorjetaBolt: value })} />
                  <Input label="Gorjeta Dinheiro" type="number" value={form.gorjetaDinheiro}
                    onChange={(value) => setForm({ ...form, gorjetaDinheiro: value })} />
                </div>
                {totalGorjetas > 0 && (
                  <p style={styles.gorjetasTotal}>
                    Total gorjetas: <strong>€{totalGorjetas.toFixed(2)}</strong>
                  </p>
                )}
              </div>
            </>
          )}

          {mode === 'rides' && (
            <div style={styles.ridesBox}>
              <h3 style={styles.boxTitle}>Adicionar corrida</h3>
              <div style={styles.rideRow}>
                <select value={ride.plataforma}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setRide({ ...ride, plataforma: e.target.value as 'uber' | 'bolt' })}
                  style={styles.select}>
                  <option value="uber">Uber</option>
                  <option value="bolt">Bolt</option>
                </select>
                <input type="number" placeholder="Valor da corrida" value={ride.valor}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setRide({ ...ride, valor: e.target.value })}
                  style={styles.input} />
                <button type="button" onClick={addRide} style={styles.addButton}>+</button>
              </div>
              {form.rides.length > 0 && (
                <div style={styles.rideList}>
                  {form.rides.map((item, index) => (
                    <div key={index} style={styles.rideItem}>
                      <span>{item.plataforma.toUpperCase()}</span>
                      <strong>€ {Number(item.valor).toFixed(2)}</strong>
                      <button type="button" onClick={() => removeRide(index)} style={styles.removeButton}>
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quilómetros */}
          <div style={styles.kmBox}>
            <p style={styles.kmTitle}>🗺️ Quilómetros</p>
            <div style={styles.kmGrid}>
              <Input label="Km início" type="number" value={form.kmInicio}
                placeholder="Ex: 45230"
                onChange={(value) => setForm({ ...form, kmInicio: value })} />
              <Input label="Km fim" type="number" value={form.kmFim}
                placeholder="Ex: 45410"
                onChange={(value) => setForm({ ...form, kmFim: value })} />
              <label style={styles.label}>
                Km percorridos
                <div style={styles.ganhoWrapper}>
                  <span style={styles.ganhoEuro}>km</span>
                  <input type="number" value={kmTotal > 0 ? kmTotal : ''}
                    readOnly style={styles.ganhoInput} placeholder="Auto" />
                  <span style={styles.ganhoAuto}>auto</span>
                </div>
              </label>
            </div>
          </div>

          <Input label="Combustível" type="number" value={form.combustivel}
            onChange={(value) => setForm({ ...form, combustivel: value })} />
          <Input label="Horas trabalhadas" type="number" value={form.horas}
            onChange={(value) => setForm({ ...form, horas: value })} />

          {/* Preview do lucro */}
          {ganhoCalculado > 0 && (
            <div style={styles.preview}>
              <p style={styles.previewTitle}>📊 Estimativa do dia</p>
              <div style={styles.previewRow}>
                <span>Ganho bruto</span>
                <strong>€{ganhoCalculado.toFixed(2)}</strong>
              </div>
              {totalGorjetas > 0 && (
                <div style={{ ...styles.previewRow, color: '#16a34a' }}>
                  <span>↳ do qual gorjetas</span>
                  <span>€{totalGorjetas.toFixed(2)}</span>
                </div>
              )}
              <div style={styles.previewRow}>
                <span>Combustível</span>
                <span style={{ color: '#dc2626' }}>-€{combustivelPreview.toFixed(2)}</span>
              </div>
              {operadorPreview > 0 && (
                <div style={styles.previewRow}>
                  <span>Operador ({costs.operadorPercent}%)</span>
                  <span style={{ color: '#dc2626' }}>-€{operadorPreview.toFixed(2)}</span>
                </div>
              )}
              {kmTotal > 0 && (
                <div style={styles.previewRow}>
                  <span>Km percorridos</span>
                  <span style={{ color: '#6366f1' }}>{kmTotal} km</span>
                </div>
              )}
              {custoPorKm !== 0 && (
                <div style={styles.previewRow}>
                  <span>Lucro por km</span>
                  <span style={{ color: custoPorKm >= 0 ? '#16a34a' : '#dc2626' }}>
                    €{custoPorKm.toFixed(2)}/km
                  </span>
                </div>
              )}
              <div style={{ ...styles.previewRow, borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '6px' }}>
                <strong>Lucro real</strong>
                <strong style={{ color: lucroPreview >= 0 ? '#16a34a' : '#dc2626' }}>
                  €{lucroPreview.toFixed(2)}
                </strong>
              </div>
            </div>
          )}

          <button style={styles.submitButton}>Salvar dia</button>
        </form>
      </section>
    </div>
  );
}

const styles: Styles = {
  header: { marginBottom: '24px' },
  eyebrow: { margin: 0, fontSize: '12px', fontWeight: 900, letterSpacing: '0.14em', color: '#6366f1', textTransform: 'uppercase' },
  title: { margin: '8px 0', fontSize: '42px', fontWeight: 900 },
  subtitle: { margin: 0, color: '#64748b' },
  operadorInfo: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '14px', background: '#f0fdf4', border: '1px solid #86efac', marginBottom: '16px', fontSize: '14px', fontWeight: 700, color: '#15803d' },
  operadorSub: { fontSize: '12px', color: '#64748b', fontWeight: 600 },
  card: { maxWidth: '900px', padding: '28px', borderRadius: '28px', background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 22px 60px rgba(15,23,42,0.07)' },
  modeSwitch: { display: 'flex', gap: '12px', marginBottom: '24px' },
  modeButton: { padding: '13px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontWeight: 900, cursor: 'pointer' },
  modeActive: { background: '#0f172a', color: '#ffffff', borderColor: '#0f172a' },
  form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' },
  label: { display: 'flex', flexDirection: 'column', gap: '8px', color: '#475569', fontWeight: 800 },
  input: { padding: '14px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' },
  inputReadOnly: { background: '#f8fafc', color: '#64748b' },
  inputHighlight: { background: '#f0fdf4', border: '1px solid #86efac', color: '#15803d', fontWeight: 900 },
  ganhoWrapper: { display: 'flex', alignItems: 'center', border: '1px solid #86efac', borderRadius: '14px', overflow: 'hidden', background: '#f0fdf4' },
  ganhoEuro: { padding: '14px 14px', background: '#dcfce7', color: '#15803d', fontWeight: 900, fontSize: '15px', borderRight: '1px solid #86efac' },
  ganhoInput: { flex: 1, padding: '14px 12px', border: 'none', outline: 'none', fontSize: '15px', background: 'transparent', color: '#15803d', fontWeight: 900 },
  ganhoAuto: { padding: '14px 12px', fontSize: '11px', fontWeight: 900, color: '#16a34a', letterSpacing: '0.08em', textTransform: 'uppercase' },
  gorjetasBox: { gridColumn: '1 / -1', padding: '20px', borderRadius: '20px', background: '#fffbeb', border: '1px solid #fde68a' },
  gorjetasTitle: { margin: '0 0 16px', fontWeight: 900, fontSize: '15px', color: '#92400e' },
  gorjetasGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' },
  gorjetasTotal: { margin: '14px 0 0', fontSize: '14px', color: '#92400e', fontWeight: 700 },
  kmBox: { gridColumn: '1 / -1', padding: '20px', borderRadius: '20px', background: '#eef2ff', border: '1px solid #c7d2fe' },
  kmTitle: { margin: '0 0 16px', fontWeight: 900, fontSize: '15px', color: '#3730a3' },
  kmGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' },
  select: { padding: '14px 16px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '15px' },
  ridesBox: { gridColumn: '1 / -1', padding: '20px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' },
  boxTitle: { marginTop: 0 },
  rideRow: { display: 'grid', gridTemplateColumns: '160px 1fr 56px', gap: '12px' },
  addButton: { borderRadius: '14px', border: 'none', background: '#4f46e5', color: '#ffffff', fontSize: '22px', fontWeight: 900, cursor: 'pointer' },
  rideList: { display: 'grid', gap: '10px', marginTop: '16px' },
  rideItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '14px', background: '#ffffff', border: '1px solid #e2e8f0' },
  removeButton: { border: 'none', background: '#fee2e2', color: '#b91c1c', padding: '8px 10px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' },
  preview: { gridColumn: '1 / -1', padding: '18px', borderRadius: '18px', background: '#f8fafc', border: '1px solid #e2e8f0' },
  previewTitle: { margin: '0 0 12px', fontWeight: 900, fontSize: '14px', color: '#0f172a' },
  previewRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', color: '#475569' },
  submitButton: { gridColumn: '1 / -1', padding: '16px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#ffffff', fontSize: '16px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 16px 34px rgba(79,70,229,0.25)' },
};

export default AddDay;
