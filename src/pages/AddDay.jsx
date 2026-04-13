import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

function AddDay() {
  const { addDay } = useContext(AppContext);

  const [form, setForm] = useState({
    date: '',
    ganho: '',
    combustivel: '',
    operadorPercent: '',
    horas: '',
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newDay = {
      ...form,
      ganho: Number(form.ganho),
      combustivel: Number(form.combustivel),
      operadorPercent: Number(form.operadorPercent),
      horas: Number(form.horas),
    };

    addDay(newDay);

    setForm({
      date: '',
      ganho: '',
      combustivel: '',
      operadorPercent: '',
      horas: '',
    });
  }

  return (
    <div>
      <h2>Adicionar Dia</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginTop: '15px',
        }}
      >
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="ganho"
          placeholder="Ganho (€)"
          value={form.ganho}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="combustivel"
          placeholder="Combustível (€)"
          value={form.combustivel}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="operadorPercent"
          placeholder="Operador (%)"
          value={form.operadorPercent}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="horas"
          placeholder="Horas"
          value={form.horas}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          style={{
            gridColumn: 'span 2',
            padding: '12px',
            background: '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '15px',
          }}
        >
          Salvar
        </button>
      </form>
    </div>
  );
}

export default AddDay;
