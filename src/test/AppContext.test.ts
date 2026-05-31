import { describe, it, expect } from 'vitest'
import { calcularCustoSemanal, calcularCustosVariaveisDias } from '../context/AppContext'
import { Costs, Day } from '../types'

// ── calcularCustoSemanal ──────────────────────────────────────────────────────
describe('calcularCustoSemanal', () => {
  it('returns 0 when all costs are zero', () => {
    const costs: Costs = {
      aluguer: 0, prestacao: 0, seguro: 0, iuc: 0,
      operadorPercent: 0, oleo: 0, pneus: 0, revisoes: 0,
      lavagens: 0, alimentacao: 0, iva: 0, outros: 0,
    }
    expect(calcularCustoSemanal(costs)).toBe(0)
  })

  it('returns weekly aluguer directly (no conversion)', () => {
    const costs: Costs = {
      aluguer: 100, prestacao: 0, seguro: 0, iuc: 0,
      operadorPercent: 0, oleo: 0, pneus: 0, revisoes: 0,
      lavagens: 0, alimentacao: 0, iva: 0, outros: 0,
    }
    expect(calcularCustoSemanal(costs)).toBe(100)
  })

  it('converts monthly seguro to weekly (divide by 4.33)', () => {
    const costs: Costs = {
      aluguer: 0, prestacao: 0, seguro: 43.3, iuc: 0,
      operadorPercent: 0, oleo: 0, pneus: 0, revisoes: 0,
      lavagens: 0, alimentacao: 0, iva: 0, outros: 0,
    }
    const result = calcularCustoSemanal(costs)
    expect(result).toBeCloseTo(10, 0)
  })

  it('converts annual iuc to weekly (divide by 52)', () => {
    const costs: Costs = {
      aluguer: 0, prestacao: 0, seguro: 0, iuc: 520,
      operadorPercent: 0, oleo: 0, pneus: 0, revisoes: 0,
      lavagens: 0, alimentacao: 0, iva: 0, outros: 0,
    }
    const result = calcularCustoSemanal(costs)
    expect(result).toBeCloseTo(10, 0)
  })

  it('sums all cost categories correctly', () => {
    const costs: Costs = {
      aluguer: 50,       // semanal → 50
      prestacao: 0,
      seguro: 0,
      iuc: 0,
      operadorPercent: 0,
      oleo: 0,
      pneus: 0,
      revisoes: 0,
      lavagens: 20,      // semanal → 20
      alimentacao: 30,   // semanal → 30
      iva: 0,
      outros: 10,        // semanal → 10
    }
    expect(calcularCustoSemanal(costs)).toBe(110)
  })
})

// ── calcularCustosVariaveisDias ───────────────────────────────────────────────
describe('calcularCustosVariaveisDias', () => {
  it('returns zeros for empty array', () => {
    const result = calcularCustosVariaveisDias([])
    expect(result.combustivel).toBe(0)
    expect(result.operador).toBe(0)
  })

  it('sums combustivel from multiple days', () => {
    const days: Day[] = [
      { id: '1', date: '2025-04-07', mode: 'total', ganho: '100', uberTotal: '100', boltTotal: '0', combustivel: '20', operadorPercent: '0', horas: '8', rides: [] },
      { id: '2', date: '2025-04-08', mode: 'total', ganho: '80', uberTotal: '80', boltTotal: '0', combustivel: '15', operadorPercent: '0', horas: '6', rides: [] },
    ]
    const result = calcularCustosVariaveisDias(days)
    expect(result.combustivel).toBe(35)
  })

  it('calculates operador correctly from percentage', () => {
    const days: Day[] = [
      { id: '1', date: '2025-04-07', mode: 'total', ganho: '100', uberTotal: '100', boltTotal: '0', combustivel: '0', operadorPercent: '25', horas: '8', rides: [] },
    ]
    const result = calcularCustosVariaveisDias(days)
    expect(result.operador).toBe(25)
  })

  it('calculates ganho from rides array when rides exist', () => {
    const days: Day[] = [
      {
        id: '1', date: '2025-04-07', mode: 'rides', ganho: '0',
        uberTotal: '0', boltTotal: '0', combustivel: '10',
        operadorPercent: '20', horas: '5', rides: [
          { plataforma: 'uber', valor: '30' },
          { plataforma: 'bolt', valor: '20' },
        ]
      },
    ]
    const result = calcularCustosVariaveisDias(days)
    // ganho = 50, operador = 50 * 20% = 10
    expect(result.operador).toBeCloseTo(10, 1)
    expect(result.combustivel).toBe(10)
  })
})
