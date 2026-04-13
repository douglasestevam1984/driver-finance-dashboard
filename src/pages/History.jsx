import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

function History() {
  const { days } = useContext(AppContext);

  return (
    <div>
      <h2>Histórico</h2>

      {days.map((day, index) => {
        const ganho = day.ganho || 0;
        const combustivel = day.combustivel || 0;
        const operador = (ganho * (day.operadorPercent || 0)) / 100;

        const despesas = combustivel + operador;
        const lucro = ganho - despesas;

        return (
          <div
            key={index}
            style={{
              background: '#fff',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            }}
          >
            <p>{day.date}</p>
            <p>Ganho: € {ganho}</p>
            <p>Despesas: € {despesas.toFixed(2)}</p>
            <p>Lucro: € {lucro.toFixed(2)}</p>
            <p>Horas: {day.horas}</p>
          </div>
        );
      })}
    </div>
  );
}

export default History;
