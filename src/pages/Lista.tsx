import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { useStore } from '../store'
import { CLIENTES } from '../data/mock'
import { EmptyState, PageHeader } from '../components/Layout'
import { StatusBadge, STATUS } from '../components/StatusBadge'
import type { Status } from '../types'
export default function Lista({ modo }: { modo: 'pedidos'|'consulta'|'portal' }) {
  const { entregas, abrir, user } = useStore(); const [params] = useSearchParams(); const [q, setQ] = useState(params.get('q') ?? ''); const [st, setSt] = useState<Status|''>(''); const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  useEffect(() => { const v = params.get('q'); if (v !== null) setQ(v) }, [params])
  const nome = (id: string) => CLIENTES.find(c => c.id===id)?.nome ?? ''
  const t = q.toLowerCase()
  const lista = entregas.filter(e => (modo!=='portal' || e.clienteId===user?.clienteId) && (!st || e.status===st) &&
    (!t || [e.destinatario.nome, e.destinatario.telefone, e.pedidoId, e.id, nome(e.clienteId)].some(v => v.toLowerCase().includes(t))))
  const inc = entregas.filter(e => e.status==='incompleta').length
  return <><PageHeader action={modo==='pedidos' ? <Link to="/pedidos/novo" className="btn-cta grid place-items-center">+ Novo pedido</Link> : undefined}>{modo==='consulta' ? 'Consulta rápida' : modo==='portal' ? 'Minhas entregas' : 'Pedidos e entregas'}</PageHeader>
    <input ref={ref} className="inp text-lg" aria-label="Buscar" placeholder="Nome, telefone, pedido ou cliente… (Ctrl+K)" value={q} onChange={e => setQ(e.target.value)}/>
    <div className="flex gap-2 mt-3 overflow-x-auto">
      <button className={`rounded-full px-4 min-h-[44px] ${st==='' ? 'bg-navy text-creme' : 'border border-navy'}`} onClick={() => setSt('')}>Todas</button>
      {modo==='pedidos' && <button className={`rounded-full px-4 min-h-[44px] whitespace-nowrap ${st==='incompleta' ? 'bg-amber-200' : 'border border-amber-400'}`} onClick={() => setSt('incompleta')}>Incompletas ({inc})</button>}
      <select aria-label="Status" className="inp w-auto" value={st} onChange={e => setSt(e.target.value as Status|'')}><option value="">Status</option>{(Object.keys(STATUS) as Status[]).map(s => <option key={s} value={s}>{STATUS[s].label}</option>)}</select></div>
    <div className="mt-4 space-y-2">{lista.length===0 ? <EmptyState text="Nenhuma entrega encontrada."/> : lista.map(e =>
      <button key={e.id} onClick={() => abrir(e.id)} className={`card w-full text-left p-4 min-h-[44px] flex flex-wrap items-center justify-between gap-2 ${e.status==='incompleta' ? 'bg-amber-50 border-amber-300' : ''}`}>
        <span><b>{e.destinatario.nome}</b><span className="block text-sm text-ardosia">{e.id} · {nome(e.clienteId)} · {e.endereco.bairro}</span></span>
        <span className="text-right"><StatusBadge status={e.status}/><span className="block text-xs text-ardosia mt-1">{format(new Date(e.statusAtualizadoEm),'dd/MM HH:mm')}</span>{e.status==='incompleta' && modo==='pedidos' && <span className="text-xs font-bold text-amber-800">Completar dados</span>}</span></button>)}</div></>
}
