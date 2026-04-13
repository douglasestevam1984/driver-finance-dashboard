import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

function History() {
  const { days } = useContext(AppContext);

  return (
    <div style={{ marginTop: '40px' }}>
      <h2>Histórico</h2>

      {days.length === 0 ? (
        <p style={{ marginTop: '10px' }}>Nenhum dia registado.</p>
      ) : (
        <div style={{ marginTop: '20px' }}>
          {days.map((day, index) => {
            const lucro = day.ganho - (day.combustivel + day.operador);

            return (
              <div
                key={index}
                style={{
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '10px',
                  background: '#fff',
                }}
              >
                <strong>{day.date}</strong>

                <p>Ganho: € {day.ganho}</p>
                <p>Despesas: € {day.combustivel + day.operador}</p>
                <p>Lucro: € {lucro}</p>
                <p>Horas: {day.horas}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default History;
