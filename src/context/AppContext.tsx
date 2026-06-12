import { createContext, useState, useEffect, ReactNode } from 'react';
import { Day, Costs } from '../types';

// ── Tipos do contexto ─────────────────────────────────────────────────────────
interface VariaveisDias {
  combustivel: number;
  operador: number;
}

export interface VencimentoInfo {
  key: string;
  label: string;
  valor: number;
  diaVencimento: number;
  diasRestantes: number;
  valorPorDia: number;
  vence: string; // data formatada DD/MM
}

interface AppContextType {
  days: Day[];
  addDay: (day: Day) => void;
  costs: Costs;
  updateCosts: (costs: Costs) => void;
  calcularCustoSemanal: (costs: Costs) => number;
  calcularCustosVariaveisDias: (days: Day[]) => VariaveisDias;
  calcularVencimentos: (costs: Costs) => VencimentoInfo[];
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
  vencimentos: {},
};

// ── Campos elegíveis para data de vencimento (mensais/anuais) ─────────────────
const camposComVencimento: { key: keyof Costs; label: string; periodo: 'mensal' | 'anual' }[] = [
  { key: 'prestacao', label: 'Prestação / Financiamento', periodo: 'mensal' },
  { key: 'seguro', label: 'Seguro', periodo: 'mensal' },
  { key: 'iuc', label: 'IUC', periodo: 'anual' },
  { key: 'oleo', label: 'Óleo / Filtros', periodo: 'mensal' },
  { key: 'pneus', label: 'Pneus', periodo: 'mensal' },
  { key: 'revisoes', label: 'Revisões / Reparações', periodo: 'mensal' },
  { key: 'iva', label: 'IVA / Impostos', periodo: 'mensal' },
];

export { camposComVencimento };

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

// Calcula a próxima data de vencimento de cada despesa configurada e
// quanto é preciso "guardar" por dia até essa data para a cobrir.
export function calcularVencimentos(costs: Costs): VencimentoInfo[] {
  const vencimentos = costs.vencimentos ?? {};
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const resultado: VencimentoInfo[] = [];

  camposComVencimento.forEach(({ key, label, periodo }) => {
    const valor = Number(costs[key]) || 0;
    const dia = vencimentos[key as string];
    if (!valor || !dia || dia < 1 || dia > 31) return;

    // Calcula a próxima ocorrência deste dia do mês
    let proxima = new Date(hoje.getFullYear(), hoje.getMonth(), dia);
    if (proxima < hoje) {
      // já passou este mês — avança para o próximo mês (ou ano, se for IUC)
      if (periodo === 'anual') {
        proxima = new Date(hoje.getFullYear() + 1, hoje.getMonth(), dia);
      } else {
        proxima = new Date(hoje.getFullYear(), hoje.getMonth() + 1, dia);
      }
    }

    const diasRestantes = Math.max(
      1,
      Math.ceil((proxima.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)),
    );

    resultado.push({
      key: String(key),
      label,
      valor,
      diaVencimento: dia,
      diasRestantes,
      valorPorDia: valor / diasRestantes,
      vence: `${proxima.getDate().toString().padStart(2, '0')}/${(proxima.getMonth() + 1).toString().padStart(2, '0')}`,
    });
  });

  // Ordena pela mais urgente primeiro
  return resultado.sort((a, b) => a.diasRestantes - b.diasRestantes);
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
        calcularVencimentos,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
