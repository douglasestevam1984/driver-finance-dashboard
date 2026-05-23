import { createContext, useState, useEffect, ReactNode } from 'react';
import { Day, Costs } from '../types';

// ── Tipos do contexto ─────────────────────────────────────────────────────────
interface VariaveisDias {
  combustivel: number;
  operador: number;
}

interface AppContextType {
  days: Day[];
  addDay: (day: Day) => void;
  costs: Costs;
  updateCosts: (costs: Costs) => void;
  calcularCustoSemanal: (costs: Costs) => number;
  calcularCustosVariaveisDias: (days: Day[]) => VariaveisDias;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

// ── Valores por defeito ───────────────────────────────────────────────────────
const defaultCosts: Costs = {
  aluguer: 0,
  prestacao: 0,
  seguro: 0,
  iuc: 0,
  operadorPercent: 0,
  oleo: 0,
  pneus: 0,
  revisoes: 0,
  lavagens: 0,
  alimentacao: 0,
  iva: 0,
  outros: 0,
};

// ── Funções utilitárias ───────────────────────────────────────────────────────
export function calcularCustoSemanal(costs: Costs): number {
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

export function calcularCustosVariaveisDias(days: Day[]): VariaveisDias {
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

// ── Provider ──────────────────────────────────────────────────────────────────
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [days, setDays] = useState<Day[]>([]);
  const [costs, setCosts] = useState<Costs>(defaultCosts);

  useEffect(() => {
    const savedDays = localStorage.getItem('days');
    const savedCosts = localStorage.getItem('driverCosts');
    if (savedDays) setDays(JSON.parse(savedDays) as Day[]);
    if (savedCosts) setCosts({ ...defaultCosts, ...JSON.parse(savedCosts) as Partial<Costs> });
  }, []);

  useEffect(() => {
    localStorage.setItem('days', JSON.stringify(days));
  }, [days]);

  useEffect(() => {
    localStorage.setItem('driverCosts', JSON.stringify(costs));
  }, [costs]);

  function addDay(day: Day): void {
    setDays((prev) => [...prev, day]);
  }

  function updateCosts(newCosts: Costs): void {
    setCosts(newCosts);
  }

  return (
    <AppContext.Provider
      value={{
        days,
        addDay,
        costs,
        updateCosts,
        calcularCustoSemanal,
        calcularCustosVariaveisDias,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
