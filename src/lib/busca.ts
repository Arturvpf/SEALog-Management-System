import { CLIENTES } from '../data/mock'
import type { Entrega } from '../types'
const dig = (s: string) => s.replace(/\D/g, '')
export function buscar(entregas: Entrega[], q: string): Entrega[] {
  const t = q.trim().toLowerCase(); if (!t) return []
  const d = dig(t)
  return entregas.filter(e => [e.destinatario.nome, e.pedidoId, e.id, CLIENTES.find(c => c.id === e.clienteId)?.nome ?? ''].some(v => v.toLowerCase().includes(t))
    || (d.length >= 3 && dig(e.destinatario.telefone).includes(d)))
}
