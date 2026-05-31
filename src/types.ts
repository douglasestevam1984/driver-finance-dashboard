export interface Ride {
  plataforma: 'uber' | 'bolt';
  valor: string;
}

export interface Day {
  id: string;
  date: string;
  mode: 'total' | 'rides';
  ganho: string;
  uberTotal: string;
  boltTotal: string;
  gorjetaUber?: string;
  gorjetaBolt?: string;
  gorjetaDinheiro?: string;
  combustivel: string;
  operadorPercent: string | number;
  horas: string;
  kmInicio?: string;
  kmFim?: string;
  rides: Ride[];
}

export interface Costs {
  aluguer: number;
  prestacao: number;
  seguro: number;
  iuc: number;
  operadorPercent: number;
  oleo: number;
  pneus: number;
  revisoes: number;
  lavagens: number;
  alimentacao: number;
  iva: number;
  outros: number;
}
