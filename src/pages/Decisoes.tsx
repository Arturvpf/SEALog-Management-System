import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useStore } from '../store'
import { CLIENTES } from '../data/mock'
import { proximoDiaUtil } from '../lib/entregas'
import { EmptyState, PageHeader } from '../components/Layout'
import { StatusBadge } from '../components/StatusBadge'
import type { Entrega } from '../types'
function Cartao({ e }: { e: Entrega }) {
  const PARCEIRAS = useStore(s => s.parceiras)
  const { decidir, abrir } = useStore(); const [modo, setModo] = useState<'reentrega'|'devolucao'|null>(null); const [data, setData] = useState(proximoDiaUtil())
  const oc = [...e.historico].reverse().find(h => h.status === 'ocorrencia')
  const parc = PARCEIRAS.find(p => p.id === e.parceiraId)?.nome
  const confirmar = () => { if (!modo) return
    if (modo === 'reentrega' && !data) return toast.error('Informe a nova data')
    decidir(e.id, modo, data); toast.success(`${modo === 'reentrega' ? 'Reentrega agendada' : 'Devolução registrada'}. Parceira avisada`) }
  return <section className="card p-4 border-rosa">
    <div className="flex flex-wrap justify-between gap-2"><div><h2 className="font-mono font-bold">{e.id} · {e.destinatario.nome}</h2>
      <p className="text-sm text-ardosia">{CLIENTES.find(c => c.id === e.clienteId)?.nome} · {e.endereco.bairro} · {parc ?? 'sem parceira'}</p></div><StatusBadge status={e.status}/></div>
    <p className="mt-2 text-sm"><b className="text-rosa">{oc?.tipoOcorrencia?.replace(/_/g, ' ')}</b>{oc && ` · ${format(new Date(oc.ocorridoEm), 'dd/MM/yyyy HH:mm')}`}</p>
    {oc?.observacao && <p className="text-sm italic">{oc.observacao}</p>}
    <div className="flex flex-wrap gap-2 mt-3">
      <button className={modo === 'reentrega' ? 'btn' : 'btn-out'} onClick={() => setModo('reentrega')}>Reentrega</button>
      <button className={modo === 'devolucao' ? 'btn' : 'btn-out'} onClick={() => setModo('devolucao')}>Devolução</button>
      <button className="underline text-sm min-h-[44px]" onClick={() => abrir(e.id)}>Ver histórico</button></div>
    {modo && <div className="mt-3 flex flex-wrap items-end gap-3 bg-creme rounded-xl p-3">
      {modo === 'reentrega' ? <label className="text-sm">Nova data<input type="date" className="inp" value={data} min={format(new Date(), 'yyyy-MM-dd')} onChange={ev => setData(ev.target.value)}/></label>
        : <p className="text-sm">A entrega será marcada como devolvida ao cliente.</p>}
      <button className="btn-cta" onClick={confirmar}>Confirmar {modo === 'reentrega' ? 'reentrega' : 'devolução'}</button></div>}
  </section>
}
export default function Decisoes() {
  const lista = useStore(s => s.entregas.filter(e => e.status === 'ocorrencia'))
  return <><PageHeader>Entregas em <span className="hl text-navy">ocorrência</span></PageHeader>
    <div className="space-y-3">{lista.length === 0 ? <EmptyState text="Nenhuma ocorrência aguardando decisão."/> : lista.map(e => <Cartao key={e.id} e={e}/>)}</div></>
}
