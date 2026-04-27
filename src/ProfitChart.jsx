import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

import { Line } from 'react-chartjs-2';

ChartJS.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

function ProfitChart() {
  // 🔥 Dados simulados (depois você liga no seu estado/contexto)
  const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const uber = [40, 30, 50, 60, 80, 50, 90];
  const bolt = [20, 25, 15, 30, 20, 25, 35];
  const despesas = [15, 10, 20, 18, 25, 22, 30];

  // 👉 cálculo automático do lucro
  const lucro = labels.map((_, i) => uber[i] + bolt[i] - despesas[i]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Uber',
        data: uber,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.2)',
        tension: 0.4,
      },
      {
        label: 'Bolt',
        data: bolt,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.2)',
        tension: 0.4,
      },
      {
        label: 'Despesas',
        data: despesas.map((v) => -v), // 🔴 negativo
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.2)',
        tension: 0.4,
      },
      {
        label: 'Lucro',
        data: lucro,
        borderColor: '#10b981',
        borderWidth: 3,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: €${context.raw}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
      <h2>Lucro por dia</h2>
      <Line data={data} options={options} />
    </div>
  );
}

export default ProfitChart;
