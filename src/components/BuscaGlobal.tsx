import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useStore } from '../store'
import { CLIENTES } from '../data/mock'
import { buscar } from '../lib/busca'
import { StatusBadge } from './StatusBadge'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'
export function BuscaGlobal() {
  const { entregas, abrir } = useStore(); const nav = useNavigate()
  const [aberto, setAberto] = useState(false); const [q, setQ] = useState(''); const ref = useRef<HTMLInputElement>(null)
  const mac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setAberto(true) }
      else if (e.key === 'Escape') setAberto(false) }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [])
  useEffect(() => { if (aberto) ref.current?.focus() }, [aberto])
  const res = buscar(entregas, q).slice(0, 8)
  const fechar = () => { setAberto(false); setQ('') }
  const escolher = (id: string) => { fechar(); abrir(id) }
  const verTodos = () => { const t = q.trim(); fechar(); nav(`/entregas?q=${encodeURIComponent(t)}`) }
  return <>
    <div className="mb-6 border-b pb-5"><button onClick={() => setAberto(true)} aria-label="Busca global" className="inp flex w-full items-center gap-3 text-left text-muted-foreground sm:max-w-lg">
      <Search size={18} strokeWidth={1.75} className="shrink-0"/><span className="flex-1 truncate">Buscar entrega, telefone, pedido ou cliente…</span><kbd className="hidden shrink-0 rounded border bg-muted/50 px-1.5 py-0.5 text-xs sm:inline">{mac ? '⌘' : 'Ctrl'} K</kbd></button></div>
    <Dialog open={aberto} onOpenChange={o => { if (!o) fechar() }}><DialogContent className="max-w-xl top-[10vh] translate-y-0">
        <DialogTitle className="sr-only">Consulta rápida</DialogTitle>
        <input ref={ref} className="inp text-lg" aria-label="Buscar" placeholder="Nome, telefone, pedido ou cliente…" value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && res[0]) escolher(res[0].id) }}/>
        <ul className="mt-3 space-y-1 max-h-[50vh] overflow-y-auto">{q.trim() && res.length === 0 && <li className="text-sm text-ardosia p-3">Nenhuma entrega encontrada.</li>}
          {res.map(e => <li key={e.id}><button className="w-full min-h-[44px] flex justify-between items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-muted/70" onClick={() => escolher(e.id)}>
            <span><b>{e.destinatario.nome}</b><span className="block text-xs text-ardosia">{e.id} · {CLIENTES.find(c => c.id === e.clienteId)?.nome} · {e.endereco.bairro}</span></span><StatusBadge status={e.status}/></button></li>)}</ul>
        {q.trim() && <button className="btn-out w-full mt-3" onClick={verTodos}>Ver todos na Consulta</button>}</DialogContent></Dialog></>
}
