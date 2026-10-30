import { Fragment, useState } from 'react'
import { format, subDays } from 'date-fns'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { useStore } from '../store'
import { CLIENTES } from '../data/mock'
import { PageHeader } from '../components/Layout'
import { StatusBadge } from '../components/StatusBadge'
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog'
import type { Entrega, Volume } from '../types'
const PRECO: Record<Volume, number> = { pequeno: 8, medio: 12, grande: 18 }
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const soma = (l: Entrega[]) => l.reduce((t, e) => t + PRECO[e.volume], 0)
export default function Financeiro() {
  const PARCEIRAS = useStore(s => s.parceiras)
  const { entregas, abrir, diasFechados, fecharDia } = useStore()
  const [aba, setAba] = useState<'cliente'|'parceira'>('cliente'); const [periodo, setPeriodo] = useState<'hoje'|'7d'>('hoje')
  const [aberto, setAberto] = useState<string[]>([]); const [modal, setModal] = useState(false)
  const hoje = format(new Date(), 'yyyy-MM-dd'); const desde = periodo === 'hoje' ? hoje : format(subDays(new Date(), 6), 'yyyy-MM-dd')
  const concl = entregas.filter(e => e.status === 'entregue' && e.dataDesejada >= desde && e.dataDesejada <= hoje)
  const linhas = (aba === 'cliente' ? CLIENTES : PARCEIRAS).map(x => { const l = concl.filter(e => (aba === 'cliente' ? e.clienteId : e.parceiraId) === x.id)
    const v = soma(l); return { id: x.id, nome: x.nome, ents: l, valor: aba === 'cliente' ? v : v * 0.7 } }).filter(r => r.ents.length > 0)
  const total = linhas.reduce((t, r) => t + r.valor, 0)
  const cobranca = soma(concl.filter(e => CLIENTES.some(c => c.id === e.clienteId)))
  const repasse = soma(concl.filter(e => PARCEIRAS.some(p => p.id === e.parceiraId))) * 0.7
  const fechado = diasFechados.includes(hoje)
  const pendentes = entregas.filter(e => e.dataDesejada === hoje && !['entregue', 'ocorrencia', 'devolvida'].includes(e.status))
  const fechar = () => { if (pendentes.length) return setModal(true); fecharDia(hoje); toast.success('Dia fechado') }
  const csv = () => { const rows = [[aba === 'cliente' ? 'Cliente' : 'Parceira', 'Entregas concluídas', aba === 'cliente' ? 'Valor cobrado' : 'Valor de repasse'], ...linhas.map(r => [r.nome, String(r.ents.length), r.valor.toFixed(2).replace('.', ',')])]
    const url = URL.createObjectURL(new Blob(['\ufeff' + rows.map(r => r.join(';')).join('\n')], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a'); a.href = url; a.download = `financeiro-${aba}-${hoje}.csv`; a.click(); URL.revokeObjectURL(url); toast.success('CSV exportado') }
  return <><PageHeader description="Confira as entregas concluídas, cobranças e repasses do período." action={fechado ? <span className="rounded-full bg-success/15 text-green-800 font-semibold px-3 py-1">Fechado</span> : <button className="btn-cta" onClick={fechar}>Fechar o dia</button>}>Financeiro</PageHeader>
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      <div className="card p-5"><p className="text-sm text-muted-foreground">Cobrança dos clientes</p><p className="mt-1 font-display text-3xl font-semibold tabular-nums">{brl(cobranca)}</p><p className="mt-1 text-xs text-muted-foreground">{concl.length} entregas concluídas no período</p></div>
      <div className="card p-5"><p className="text-sm text-muted-foreground">Repasse às parceiras</p><p className="mt-1 font-display text-3xl font-semibold tabular-nums">{brl(repasse)}</p><p className="mt-1 text-xs text-muted-foreground">70% do valor das entregas atribuídas</p></div>
      <div className="rounded-xl border border-primary bg-primary p-5 text-primary-foreground"><p className="text-sm opacity-80">Margem do período</p><p className="mt-1 font-display text-3xl font-semibold tabular-nums">{brl(cobranca - repasse)}</p><p className="mt-1 text-xs opacity-70">Cobranças menos repasses</p></div>
    </div>
    <div className="flex flex-wrap gap-2 items-center">
      {(['cliente', 'parceira'] as const).map(a => <button key={a} onClick={() => setAba(a)} className={`rounded-full px-4 min-h-[44px] ${aba === a ? 'bg-navy text-creme' : 'border border-navy'}`}>{a === 'cliente' ? 'Cobrança por cliente' : 'Repasse por parceira'}</button>)}
      <select aria-label="Período" className="inp w-auto" value={periodo} onChange={e => setPeriodo(e.target.value as 'hoje'|'7d')}><option value="hoje">Hoje</option><option value="7d">Últimos 7 dias</option></select>
      <button className="btn-out ml-auto" onClick={csv}>Exportar CSV</button></div>
    <div className="card mt-4 overflow-x-auto"><table className="data-table"><thead><tr><th className="w-8"><span className="sr-only">Detalhes</span></th><th>{aba === 'cliente' ? 'Cliente' : 'Parceira'}</th><th>Entregas concluídas</th><th className="text-right">{aba === 'cliente' ? 'Valor' : 'Repasse (70%)'}</th></tr></thead>
      <tbody>{linhas.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-ardosia">Nenhuma entrega concluída no período.</td></tr>}
        {linhas.map(r => { const ab = aberto.includes(r.id); return <Fragment key={r.id}>
          <tr className="border-t border-borda"><td className="p-1"><button aria-label="Expandir" aria-expanded={ab} className="min-h-[44px] min-w-[44px] grid place-items-center" onClick={() => setAberto(s => ab ? s.filter(x => x !== r.id) : [...s, r.id])}>{ab ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}</button></td>
            <td className="p-3 font-medium">{r.nome}</td><td className="p-3">{r.ents.length}</td><td className="p-3 text-right font-display font-semibold">{brl(r.valor)}</td></tr>
          {ab && r.ents.map(e => <tr key={e.id} className="bg-creme"><td/><td className="p-3">{e.id} · {e.destinatario.nome}</td><td className="p-3">{e.comprovante ? format(new Date(e.comprovante.horario), 'dd/MM HH:mm') : '—'}</td>
            <td className="p-3 text-right"><button className="underline min-h-[44px]" onClick={() => abrir(e.id)}>Comprovante</button></td></tr>)}</Fragment> })}</tbody>
      <tfoot><tr className="border-t border-borda font-semibold"><td/><td className="p-3" colSpan={2}>Total</td><td className="p-3 text-right font-display">{brl(total)}</td></tr></tfoot></table></div>
    <Dialog open={modal} onOpenChange={setModal}><DialogContent>
      <DialogTitle>Não dá para fechar o dia</DialogTitle><p className="text-sm mt-1">{pendentes.length} entrega(s) ainda sem resultado (entregue, ocorrência ou devolvida):</p>
      <ul className="mt-3 space-y-2">{pendentes.map(e => <li key={e.id}><button className="w-full min-h-[44px] flex justify-between items-center border border-borda rounded-xl px-3 text-left" onClick={() => abrir(e.id)}><span>{e.id} · {e.destinatario.nome}</span><StatusBadge status={e.status}/></button></li>)}</ul>
      <button className="btn w-full mt-4" onClick={() => setModal(false)}>Entendi</button></DialogContent></Dialog></>
}
