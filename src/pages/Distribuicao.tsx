import { useState } from 'react'
import { toast } from 'sonner'
import { useStore } from '../store'
import { EmptyState, PageHeader } from '../components/Layout'
import { ListaDiaModal } from '../components/ListaDiaModal'
import type { Entrega } from '../types'
export default function Distribuicao() {
  const PARCEIRAS = useStore(s => s.parceiras)
  const { entregas, atribuir, abrir } = useStore(); const [sel, setSel] = useState<string[]>([]); const [reg, setReg] = useState(''); const [lista, setLista] = useState<string | null>(null)
  const prontas = entregas.filter(e => e.status==='pronta' && (!reg || e.regiao===reg))
  const alvo = entregas.filter(e => sel.includes(e.id))
  const atende = (pid: string) => { const p = PARCEIRAS.find(x => x.id===pid)!; return alvo.length>0 && alvo.every(e => e.regiao && p.regioes.includes(e.regiao)) }
  const go = (pid: string) => { const err = atribuir(sel, pid); if (err) toast.error(err); else { toast.success(`${sel.length} entrega(s) atribuída(s)`); setSel([]) } }
  return <><PageHeader description="Atribua entregas por região e acompanhe a capacidade das parceiras.">Distribuição</PageHeader>
    <div className="grid md:grid-cols-2 gap-3">{PARCEIRAS.map(p => { const n = entregas.filter(e => e.parceiraId===p.id && ['aguardando_coleta','coletada','em_rota'].includes(e.status)).length; const over = n > p.capacidadeDiaria
      return <div key={p.id} className="card p-4"><div className="flex justify-between"><b>{p.nome}</b><span>{n}/{p.capacidadeDiaria}</span></div>
        <div className="h-2 rounded-full bg-borda mt-2" role="progressbar" aria-valuenow={n} aria-valuemax={p.capacidadeDiaria}><div className={`h-2 rounded-full ${over ? 'bg-red-500' : 'bg-ardosia'}`} style={{ width:`${Math.min(100, n/p.capacidadeDiaria*100)}%` }}/></div>
        <p className="text-xs text-ardosia mt-2">{p.regioes.join(', ')}</p><button className="btn-out mt-3 w-full" onClick={() => setLista(p.id)}>Gerar lista do dia da parceira</button></div> })}</div>
    <div className="flex flex-wrap gap-2 mt-4"><select aria-label="Região" className="inp w-auto" value={reg} onChange={e => setReg(e.target.value)}><option value="">Todas as regiões</option>{[...new Set(entregas.map(e => e.regiao))].map(r => r && <option key={r}>{r}</option>)}</select>
      {sel.length>0 && PARCEIRAS.map(p => <button key={p.id} disabled={!atende(p.id)} className="btn-cta" onClick={() => go(p.id)}>Atribuir a {p.nome}{atende(p.id) && ' (Sugerida)'}</button>)}</div>
    {sel.length>0 && PARCEIRAS.some(p => !atende(p.id)) && <p className="text-sm text-destructive mt-2">Opção desabilitada: a parceira não atende a região de alguma entrega selecionada.</p>}
    <div className="mt-4 space-y-2">{prontas.length===0 ? <EmptyState text="Nenhuma entrega pronta para distribuir."/> : prontas.map(e =>
      <label key={e.id} className="card p-3 flex items-center gap-3 min-h-[44px]"><input type="checkbox" className="w-5 h-5" checked={sel.includes(e.id)} onChange={() => setSel(s => s.includes(e.id) ? s.filter(x => x!==e.id) : [...s, e.id])}/>
        <span className="flex-1">{e.destinatario.nome}<span className="block text-sm text-ardosia">{e.id} · {e.endereco.bairro} · {e.regiao}</span></span>
        <button type="button" className="text-sm underline" onClick={() => abrir(e.id)}>Detalhe</button></label>)}</div>
    <h2 className="font-display font-semibold mt-8 mb-3">Aguardando coleta: reatribuir</h2>
    <div className="space-y-2">{entregas.filter(e => e.status === 'aguardando_coleta').map(e => <Reatribuir key={e.id} e={e}/>)}</div>
    {lista && <ListaDiaModal parceiraId={lista} onClose={() => setLista(null)}/>}</>
}

function Reatribuir({ e }: { e: Entrega }) {
  const { atribuir, abrir } = useStore(); const parceiras = useStore(s => s.parceiras)
  const [aberto, setAberto] = useState(false); const [pid, setPid] = useState(''); const [motivo, setMotivo] = useState('')
  const atual = parceiras.find(p => p.id === e.parceiraId)
  const ok = () => {
    if (!pid) return toast.error('Escolha a nova parceira')
    if (!motivo.trim()) return toast.error('Informe o motivo da reatribuição')
    const err = atribuir([e.id], pid, motivo.trim())
    if (err) toast.error(err); else { toast.success('Entrega reatribuída'); setAberto(false); setPid(''); setMotivo('') } }
  return <div className="card p-3"><div className="flex items-center gap-3 min-h-[44px]">
    <span className="flex-1">{e.destinatario.nome}<span className="block text-sm text-ardosia">{e.id} · {e.endereco.bairro} · {atual?.nome ?? 'sem parceira'}</span></span>
    <button className="text-sm underline min-h-[44px]" onClick={() => abrir(e.id)}>Detalhe</button>
    <button className="btn-out" onClick={() => setAberto(a => !a)}>Reatribuir</button></div>
    {aberto && <div className="mt-3 grid md:grid-cols-[1fr_2fr_auto] gap-2 items-end">
      <label className="text-sm">Nova parceira<select className="inp" value={pid} onChange={ev => setPid(ev.target.value)}><option value="">Selecione…</option>
        {parceiras.filter(p => p.id !== e.parceiraId).map(p => { const ok = !!e.regiao && p.regioes.includes(e.regiao); return <option key={p.id} value={p.id} disabled={!ok}>{p.nome}{ok ? '' : ' (não atende a região)'}</option> })}</select></label>
      <label className="text-sm">Motivo<input className="inp" value={motivo} onChange={ev => setMotivo(ev.target.value)} placeholder="Ex.: parceira sem capacidade"/></label>
      <button className="btn-cta" onClick={ok}>Confirmar</button></div>}</div>
}
