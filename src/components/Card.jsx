function Card({ title, value, highlight }) {
  const borderColor =
    highlight === 'profit'
      ? '#16a34a'
      : highlight === 'loss'
        ? '#dc2626'
        : '#4f46e5';

  return (
    <div
      style={{
        flex: 1,
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        borderLeft: `5px solid ${borderColor}`,
        minWidth: '140px',
        transition: '0.2s',
        cursor: 'default',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = 'translateY(-4px)')
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <p style={{ color: '#6b7280', fontSize: '13px' }}>{title}</p>

      <h2 style={{ marginTop: '8px', color: '#111' }}>{value}</h2>
    </div>
  );
}

export default Card;
