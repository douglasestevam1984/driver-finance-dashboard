import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const defaultCosts = {
  // Viatura
  aluguer: 0,          // aluguer semanal
  prestacao: 0,        // prestação / financiamento mensal
  seguro: 0,           // seguro mensal
  iuc: 0,              // IUC anual

  // Operador
  operadorPercent: 0,  // % do ganho bruto pago ao operador (ex: 25)

  // Manutenção (valores mensais estimados)
  oleo: 0,
  pneus: 0,
  revisoes: 0,

  // Operacional
  lavagens: 0,         // por semana
  alimentacao: 0,      // por semana
  iva: 0,              // valor mensal estimado

  // Outros
  outros: 0,           // por semana
};

// Converte custos fixos para valor semanal
// combustivel e operador NÃO entram aqui — são calculados a partir dos dias reais
export function calcularCustoSemanal(costs) {
  const {
    aluguer, prestacao, seguro, iuc,
    oleo, pneus, revisoes,
    lavagens, alimentacao, iva,
    outros,
  } = costs;

  const semanasPorMes = 4.33;
  const semanasPorAno = 52;

  return (
    Number(aluguer) +
    Number(prestacao) / semanasPorMes +
    Number(seguro) / semanasPorMes +
    Number(iuc) / semanasPorAno +
    Number(oleo) / semanasPorMes +
    Number(pneus) / semanasPorMes +
    Number(revisoes) / semanasPorMes +
    Number(lavagens) +
    Number(alimentacao) +
    Number(iva) / semanasPorMes +
    Number(outros)
  );
}

// Calcula custos variáveis reais a partir dos dias (combustivel + operador)
export function calcularCustosVariaveisDias(days) {
  if (!days || days.length === 0) return { combustivel: 0, operador: 0 };

  return days.reduce(
    (acc, day) => {
      let ganho = 0;
      if (Array.isArray(day.rides) && day.rides.length > 0) {
        ganho = day.rides.reduce((s, r) => s + (Number(r.valor) || 0), 0);
      } else {
        ganho = Number(day.ganho) || 0;
      }
      const combustivel = Number(day.combustivel) || 0;
      const operador = ganho * ((Number(day.operadorPercent) || 0) / 100);
      acc.combustivel += combustivel;
      acc.operador += operador;
      return acc;
    },
    { combustivel: 0, operador: 0 },
  );
}

export function AppProvider({ children }) {
  const [days, setDays] = useState([]);
  const [costs, setCosts] = useState(defaultCosts);

  useEffect(() => {
    const savedDays = localStorage.getItem('days');
    const savedCosts = localStorage.getItem('driverCosts');
    if (savedDays) setDays(JSON.parse(savedDays));
    if (savedCosts) setCosts({ ...defaultCosts, ...JSON.parse(savedCosts) });
  }, []);

  useEffect(() => {
    localStorage.setItem('days', JSON.stringify(days));
  }, [days]);

  useEffect(() => {
    localStorage.setItem('driverCosts', JSON.stringify(costs));
  }, [costs]);

  function addDay(day) {
    setDays((prev) => [...prev, day]);
  }

  function updateCosts(newCosts) {
    setCosts(newCosts);
  }

  return (
    <AppContext.Provider value={{ days, addDay, costs, updateCosts, calcularCustoSemanal, calcularCustosVariaveisDias }}>
      {children}
    </AppContext.Provider>
  );
}
