import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

function FixedCosts() {
  const { fixedCosts, updateFixedCosts } = useContext(AppContext);

  return (
    <div style={{ marginTop: '30px' }}>
      <h2>Custos Mensais</h2>

      <input
        type="number"
        placeholder="Ex: 800€ (carro + seguro)"
        value={fixedCosts}
        onChange={(e) => updateFixedCosts(Number(e.target.value))}
        style={{
          marginTop: '10px',
          padding: '10px',
          width: '100%',
        }}
      />
    </div>
  );
}

export default FixedCosts;
