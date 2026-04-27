import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

function FixedCosts() {
  const { fixedCosts, updateFixedCosts } = useContext(AppContext);

  return (
    <div
      style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        marginTop: '20px',
      }}
    >
      <h3>Custos Mensais</h3>

      <input
        type="number"
        placeholder="Ex: 800"
        value={fixedCosts || ''}
        onChange={(e) => updateFixedCosts(Number(e.target.value))}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          marginTop: '10px',
        }}
      />
    </div>
  );
}

export default FixedCosts;
