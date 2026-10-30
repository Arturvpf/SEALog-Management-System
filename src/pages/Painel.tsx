import { useState } from 'react'
import { differenceInMinutes } from 'date-fns'
import { AlertTriangle } from 'lucide-react'
import { useStore } from '../store'
import { KpiCard, PageHeader } from '../components/Layout'
import { StatusBadge } from '../components/StatusBadge'
import { AvisarModal } from '../components/AvisarModal'
import type { Entrega } from '../types'
const velho = (e: Entrega) => ['aguardando_coleta','coletada','em_rota'].includes(e.status) && differenceInMinutes(new Date(), new Date(e.statusAtualizadoEm)) > 120
export default function Painel() {
  const { entregas, abrir } = useStore(); const PARCEIRAS = useStore(s => s.parceiras); const [avisar, setAvisar] = useState(false)
  const oc = entregas.filter(e => e.status==='ocorrencia'); const sem = entregas.filter(velho)
  return <><PageHeader description="Visão geral das entregas, parceiras e pontos de atenção.">Painel do dia</PageHeader>
    {(oc.length>0 || sem.length>0) && <div className="bg-warning/10 border border-warning/40 rounded-xl p-4 mb-4"><p className="font-semibold flex items-center gap-2"><AlertTriangle className="shrink-0" size={20} strokeWidth={1.75}/>Alertas: {oc.length} ocorrência(s) · {sem.length} sem atualização</p>
      <div className="flex flex-wrap gap-2 mt-2">{oc.map(e => <button key={e.id} className="btn-out bg-card" onClick={() => abrir(e.id)}>Tratar {e.id}</button>)}<button className="btn" onClick={() => setAvisar(true)}>Avisar clientes afetados</button></div></div>}
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
      <KpiCard label="Total do dia" value={entregas.length}/><KpiCard label="Entregues" value={entregas.filter(e => e.status==='entregue').length}/>
      <KpiCard label="Em rota" value={entregas.filter(e => e.status==='em_rota').length}/><KpiCard label="Ocorrências" value={oc.length} tone="bg-warning/10"/><KpiCard label="Sem atualização" value={sem.length} tone="bg-warning/10"/></div>
    <div className="grid md:grid-cols-2 gap-4 mt-5">{PARCEIRAS.map(p => {
      const minhas = entregas.filter(e => e.parceiraId===p.id); const fim = minhas.filter(e => ['entregue','ocorrencia','devolvida'].includes(e.status))
      const ok = minhas.filter(e => e.status==='entregue').length
      return <section key={p.id} className="card p-4"><h2 className="font-display font-semibold">{p.nome}</h2>
        <p className="text-sm text-ardosia mb-3">Ocorrências: {minhas.filter(e => e.status==='ocorrencia').length} · Sucesso: {fim.length ? Math.round(ok/fim.length*100) : 0}%</p>
        <div className="space-y-2">{minhas.map(e => <button key={e.id} onClick={() => abrir(e.id)} className={`w-full min-h-[44px] rounded-lg px-3 py-2 flex flex-wrap justify-between gap-2 items-center text-left text-sm border hover:border-primary/40 ${e.status==='ocorrencia' ? 'bg-warning/10 border-warning/40' : velho(e) ? 'bg-warning/10 border-warning/40' : 'border-borda'}`}>
          <span>{e.destinatario.nome} · {e.endereco.bairro}</span><StatusBadge status={e.status}/></button>)}</div></section> })}</div>
    {avisar && <AvisarModal afetadas={[...oc, ...sem]} onClose={() => setAvisar(false)}/>}</>
}
