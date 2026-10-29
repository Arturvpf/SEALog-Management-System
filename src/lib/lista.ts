import { format } from 'date-fns'
import { CLIENTES } from '../data/mock'
import type { Entrega, Parceira } from '../types'
const cli = (e: Entrega) => CLIENTES.find(c => c.id === e.clienteId)?.nome ?? ''
const rua = (e: Entrega) => `${e.endereco.logradouro}, ${e.endereco.numero}${e.endereco.complemento ? ` (${e.endereco.complemento})` : ''}`
export const ATIVAS = ['aguardando_coleta', 'coletada', 'em_rota']
export const listaDoDia = (todas: Entrega[], p: Parceira) => { const hoje = format(new Date(), 'yyyy-MM-dd'); return todas.filter(e => e.parceiraId === p.id && e.dataDesejada === hoje && ATIVAS.includes(e.status)) }
export function gerarTexto(p: Parceira, l: Entrega[]) {
  const cab = `*SEALog — Lista do dia ${format(new Date(), 'dd/MM/yyyy')}*\nParceira: ${p.nome} · ${l.length} entrega(s)\n`
  return cab + l.map((e, i) => `\n${i + 1}) ${e.id} — ${e.destinatario.nome} ${e.destinatario.telefone}\n${rua(e)} — ${e.endereco.bairro}, ${e.endereco.cidade}\nRef.: ${e.endereco.referencia}\nVolume: ${e.volume} · Cliente: ${cli(e)}`).join('\n')
}
export function baixarCsv(p: Parceira, l: Entrega[]) {
  const q = (v: string) => `"${v.replace(/"/g, '""')}"`
  const rows = [['Entrega', 'Pedido', 'Cliente', 'Destinatário', 'Telefone', 'Endereço', 'Bairro', 'Cidade', 'Referência', 'Volume', 'Status'],
    ...l.map(e => [e.id, e.pedidoId, cli(e), e.destinatario.nome, e.destinatario.telefone, rua(e), e.endereco.bairro, e.endereco.cidade, e.endereco.referencia, e.volume, e.status])]
  const url = URL.createObjectURL(new Blob(['\ufeff' + rows.map(r => r.map(q).join(';')).join('\n')], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a'); a.href = url; a.download = `lista-${p.nome.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click(); URL.revokeObjectURL(url)
}
