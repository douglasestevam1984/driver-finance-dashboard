import { useState } from 'react';

function AddDay({ setDays, setPage }) {
  const [mode, setMode] = useState('total');

  const [form, setForm] = useState({
    date: '',
    ganho: '',
    uberTotal: '',
    boltTotal: '',
    combustivel: '',
    operadorPercent: '',
    horas: '',
    rides: [],
  });

  const [ride, setRide] = useState({
    plataforma: 'uber',
    valor: '',
  });

  function addRide() {
    if (!ride.valor) return;

    setForm((prev) => ({
      ...prev,
      rides: [...prev.rides, ride],
    }));

    setRide({
      plataforma: 'uber',
      valor: '',
    });
  }

  function removeRide(index) {
    setForm((prev) => ({
      ...prev,
      rides: prev.rides.filter((_, i) => i !== index),
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newDay = {
      ...form,
      id: crypto.randomUUID(),
      mode,
    };

    setDays((prev) => [...prev, newDay]);

    setForm({
      date: '',
      ganho: '',
      uberTotal: '',
      boltTotal: '',
      combustivel: '',
      operadorPercent: '',
      horas: '',
      rides: [],
    });

    setPage('dashboard');
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

      <section style={styles.card}>
        <div style={styles.modeSwitch}>
          <button
            type="button"
            onClick={() => setMode('total')}
            style={{
              ...styles.modeButton,
              ...(mode === 'total' ? styles.modeActive : {}),
            }}
          >
            Total do dia
          </button>

          <button
            type="button"
            onClick={() => setMode('rides')}
            style={{
              ...styles.modeButton,
              ...(mode === 'rides' ? styles.modeActive : {}),
            }}
          >
            Por corrida
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Input
            label="Data"
            type="date"
            value={form.date}
            onChange={(value) => setForm({ ...form, date: value })}
          />

          {mode === 'total' && (
            <>
              <Input
                label="Ganho total"
                type="number"
                value={form.ganho}
                onChange={(value) => setForm({ ...form, ganho: value })}
              />

              <Input
                label="Total Uber"
                type="number"
                value={form.uberTotal}
                onChange={(value) => setForm({ ...form, uberTotal: value })}
              />

              <Input
                label="Total Bolt"
                type="number"
                value={form.boltTotal}
                onChange={(value) => setForm({ ...form, boltTotal: value })}
              />
            </>
          )}

          {mode === 'rides' && (
            <div style={styles.ridesBox}>
              <h3 style={styles.boxTitle}>Adicionar corrida</h3>

              <div style={styles.rideRow}>
                <select
                  value={ride.plataforma}
                  onChange={(e) =>
                    setRide({ ...ride, plataforma: e.target.value })
                  }
                  style={styles.select}
                >
                  <option value="uber">Uber</option>
                  <option value="bolt">Bolt</option>
                </select>

                <input
                  type="number"
                  placeholder="Valor da corrida"
                  value={ride.valor}
                  onChange={(e) => setRide({ ...ride, valor: e.target.value })}
                  style={styles.input}
                />

                <button
                  type="button"
                  onClick={addRide}
                  style={styles.addButton}
                >
                  +
                </button>
              </div>

              {form.rides.length > 0 && (
                <div style={styles.rideList}>
                  {form.rides.map((item, index) => (
                    <div key={index} style={styles.rideItem}>
                      <span>{item.plataforma.toUpperCase()}</span>
                      <strong>€ {Number(item.valor).toFixed(2)}</strong>
                      <button
                        type="button"
                        onClick={() => removeRide(index)}
                        style={styles.removeButton}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Input
            label="Combustível"
            type="number"
            value={form.combustivel}
            onChange={(value) => setForm({ ...form, combustivel: value })}
          />

          <Input
            label="% Operador"
            type="number"
            value={form.operadorPercent}
            onChange={(value) => setForm({ ...form, operadorPercent: value })}
          />

          <Input
            label="Horas trabalhadas"
            type="number"
            value={form.horas}
            onChange={(value) => setForm({ ...form, horas: value })}
          />

          <button style={styles.submitButton}>Salvar dia</button>
        </form>
      </section>
    </div>
  );
}

function Input({ label, type, value, onChange }) {
  return (
    <label style={styles.label}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
    </label>
  );
}

const styles = {
  header: {
    marginBottom: '24px',
  },
  eyebrow: {
    margin: 0,
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    color: '#6366f1',
    textTransform: 'uppercase',
  },
  title: {
    margin: '8px 0',
    fontSize: '42px',
    fontWeight: 900,
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
  },
  card: {
    maxWidth: '900px',
    padding: '28px',
    borderRadius: '28px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    boxShadow: '0 22px 60px rgba(15,23,42,0.07)',
  },
  modeSwitch: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  modeButton: {
    padding: '13px 18px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#475569',
    fontWeight: 900,
    cursor: 'pointer',
  },
  modeActive: {
    background: '#0f172a',
    color: '#ffffff',
    borderColor: '#0f172a',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '18px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    color: '#475569',
    fontWeight: 800,
  },
  input: {
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid #cbd5e1',
    fontSize: '15px',
    outline: 'none',
  },
  select: {
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid #cbd5e1',
    fontSize: '15px',
  },
  ridesBox: {
    gridColumn: '1 / -1',
    padding: '20px',
    borderRadius: '20px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
  },
  boxTitle: {
    marginTop: 0,
  },
  rideRow: {
    display: 'grid',
    gridTemplateColumns: '160px 1fr 56px',
    gap: '12px',
  },
  addButton: {
    borderRadius: '14px',
    border: 'none',
    background: '#4f46e5',
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: 900,
    cursor: 'pointer',
  },
  rideList: {
    display: 'grid',
    gap: '10px',
    marginTop: '16px',
  },
  rideItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '14px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
  },
  removeButton: {
    border: 'none',
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '8px 10px',
    borderRadius: '10px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  submitButton: {
    gridColumn: '1 / -1',
    padding: '16px',
    borderRadius: '16px',
    border: 'none',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 16px 34px rgba(79,70,229,0.25)',
  },
};

export default AddDay;
