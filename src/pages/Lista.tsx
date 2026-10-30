import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { Plus, Search, ChevronRight } from 'lucide-react'
import { useStore } from '../store'
import { CLIENTES } from '../data/mock'
import { EmptyState, PageHeader } from '../components/Layout'
import { StatusBadge, STATUS } from '../components/StatusBadge'
import type { Status } from '../types'

export default function Lista({ modo }: { modo: 'pedidos'|'consulta'|'portal' }) {
  const { entregas, abrir, user, parceiras } = useStore()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [st, setSt] = useState<Status|''>('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  useEffect(() => { const v = params.get('q'); if (v !== null) setQ(v) }, [params])
  const nome = (id: string) => CLIENTES.find(c => c.id===id)?.nome ?? ''
  const t = q.toLowerCase()
  const lista = entregas.filter(e => (modo!=='portal' || e.clienteId===user?.clienteId) && (!st || e.status===st) &&
    (!t || [e.destinatario.nome, e.destinatario.telefone, e.pedidoId, e.id, nome(e.clienteId)].some(v => v.toLowerCase().includes(t))))
  const inc = entregas.filter(e => e.status==='incompleta').length
  return <>
    <PageHeader
      description={modo === 'portal' ? 'Acompanhe o andamento e o histórico das suas entregas.' : modo === 'consulta' ? 'Encontre uma entrega e consulte todos os detalhes.' : 'Registre pedidos e acompanhe cada etapa da entrega.'}
      action={modo==='pedidos' ? <Link to="/pedidos/novo" className="btn-cta inline-flex items-center gap-2"><Plus size={18}/>Novo pedido</Link> : undefined}
    >{modo==='consulta' ? 'Consulta rápida' : modo==='portal' ? 'Minhas entregas' : 'Pedidos e entregas'}</PageHeader>
    <div className="card mb-4 flex flex-wrap items-center gap-3 p-4">
      <div className="relative min-w-0 basis-full sm:flex-1 sm:basis-auto">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
        <input ref={ref} className="inp pl-10" aria-label="Buscar" placeholder="Nome, telefone, pedido ou cliente…" value={q} onChange={e => setQ(e.target.value)}/>
      </div>
      <button aria-pressed={st===''} className={`min-h-[44px] rounded-lg px-4 text-sm font-medium ${st==='' ? 'bg-primary text-primary-foreground' : 'border hover:bg-muted'}`} onClick={() => setSt('')}>Todas</button>
      {modo==='pedidos' && <button aria-pressed={st==='incompleta'} className={`min-h-[44px] whitespace-nowrap rounded-lg px-4 text-sm font-medium ${st==='incompleta' ? 'bg-warning/25 text-amber-900' : 'border hover:bg-muted'}`} onClick={() => setSt('incompleta')}>Incompletas ({inc})</button>}
      <select aria-label="Status" className="inp w-auto max-w-full" value={st} onChange={e => setSt(e.target.value as Status|'')}><option value="">Todos os status</option>{(Object.keys(STATUS) as Status[]).map(s => <option key={s} value={s}>{STATUS[s].label}</option>)}</select>
    </div>
    <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">{lista.length} entrega(s) encontrada(s)</p>
    {lista.length === 0 ? <EmptyState text="Nenhuma entrega encontrada."/> : <>
      <div className="card hidden overflow-x-auto lg:block">
        <table className="data-table">
          <caption className="sr-only">Entregas encontradas</caption>
          <thead><tr><th>Pedido / entrega</th><th>Destinatário / cliente</th><th>Bairro</th><th>Volume</th><th>Parceira</th><th>Status</th><th>Atualização</th></tr></thead>
          <tbody>{lista.map(e => <tr key={e.id} className={e.status==='incompleta' ? 'bg-warning/5' : ''}>
            <td><button className="min-h-[44px] text-left font-semibold hover:underline" onClick={() => abrir(e.id)} aria-label={`Abrir entrega ${e.id}`}><span className="block">{e.id}</span><span className="text-xs font-normal text-muted-foreground">{e.pedidoId}</span></button></td>
            <td><span className="font-medium">{e.destinatario.nome}</span><span className="mt-0.5 block text-xs text-muted-foreground">{nome(e.clienteId)}</span></td>
            <td>{e.endereco.bairro || 'Não informado'}<span className="mt-0.5 block text-xs text-muted-foreground">{e.regiao}</span></td>
            <td className="capitalize">{e.volume}</td>
            <td>{parceiras.find(p => p.id === e.parceiraId)?.nome ?? <span className="text-muted-foreground">Não atribuída</span>}</td>
            <td><StatusBadge status={e.status}/>{e.status==='incompleta' && modo==='pedidos' && <button className="mt-1 block min-h-[32px] text-xs font-medium text-amber-900 underline" onClick={() => abrir(e.id)}>Completar dados</button>}</td>
            <td className="whitespace-nowrap text-xs text-muted-foreground">{format(new Date(e.statusAtualizadoEm),'dd/MM HH:mm')}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="space-y-3 lg:hidden">{lista.map(e => <button key={e.id} onClick={() => abrir(e.id)} aria-label={`Abrir entrega ${e.id}`} className={`card delivery-row w-full p-4 text-left ${e.status==='incompleta' ? 'border-warning/40 bg-warning/5' : ''}`}>
        <span className="mb-2 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-muted-foreground">{e.id} · {e.pedidoId}</span><StatusBadge status={e.status}/></span>
        <span className="flex items-center justify-between gap-3"><span className="min-w-0"><span className="block font-semibold">{e.destinatario.nome}</span><span className="mt-1 block text-sm text-muted-foreground">{nome(e.clienteId)} · {e.endereco.bairro}</span></span><ChevronRight size={18} className="shrink-0 text-muted-foreground"/></span>
        <span className="mt-3 block text-xs text-muted-foreground">Atualizado em {format(new Date(e.statusAtualizadoEm),'dd/MM HH:mm')}{e.status==='incompleta' && modo==='pedidos' && <span className="ml-2 font-semibold text-amber-900">· Completar dados</span>}</span>
      </button>)}</div>
    </>}
  </>
}
