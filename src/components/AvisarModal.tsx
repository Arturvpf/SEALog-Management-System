import { format } from 'date-fns'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'
import { useStore } from '../store'
import { CLIENTES } from '../data/mock'
import { StatusBadge } from './StatusBadge'
import type { Entrega } from '../types'
const motivo = (e: Entrega) => e.status === 'ocorrencia' ? ([...e.historico].reverse().find(h => h.status === 'ocorrencia')?.tipoOcorrencia ?? 'ocorrência').replace(/_/g, ' ') : 'sem atualização da parceira'
export function AvisarModal({ afetadas, onClose }: { afetadas: Entrega[]; onClose: () => void }) {
  const { avisados, avisarCliente } = useStore(); const hoje = format(new Date(), 'yyyy-MM-dd')
  const grupos = CLIENTES.map(c => ({ c, l: afetadas.filter(e => e.clienteId === c.id) })).filter(g => g.l.length > 0)
  const msg = (nome: string, l: Entrega[]) => `Olá, ${nome}! Informamos que ${l.length} entrega(s) tiveram imprevisto hoje: ${l.map(e => `${e.id} (${e.destinatario.nome}) — ${motivo(e)}`).join('; ')}. Já estamos tratando com a parceira e avisaremos o novo prazo. — SEALog`
  return <Dialog open onOpenChange={o => { if (!o) onClose() }}><DialogContent className="max-w-xl">
      <DialogTitle>Clientes afetados</DialogTitle>
      {grupos.length === 0 && <p className="text-sm my-4">Nenhum cliente com entregas atrasadas no momento.</p>}
      <div className="space-y-3 mt-3">{grupos.map(({ c, l }) => { const k = `${c.id}:${hoje}`; const ok = avisados.includes(k)
        return <section key={c.id} className={`rounded-xl border p-3 ${ok ? 'border-green-300 bg-green-50' : 'border-borda'}`}>
          <div className="flex justify-between items-center gap-2"><b>{c.nome}</b>{ok && <span className="rounded-full bg-green-100 text-green-900 text-xs font-bold px-2.5 py-0.5">Avisado</span>}</div>
          <ul className="text-sm mt-2 space-y-1">{l.map(e => <li key={e.id} className="flex justify-between gap-2"><span>{e.id} · {e.destinatario.nome} · {motivo(e)}</span><StatusBadge status={e.status}/></li>)}</ul>
          <div className="flex flex-wrap gap-2 mt-3">
            <button className="btn-out" onClick={() => { void navigator.clipboard?.writeText(msg(c.nome, l)); toast.success('Mensagem copiada para o WhatsApp') }}>Copiar mensagem</button>
            <button className="btn-cta" disabled={ok} onClick={() => { avisarCliente(k); toast.success(`${c.nome} marcado como avisado`) }}>{ok ? 'Avisado' : 'Marcar como avisado'}</button></div></section> })}</div>
      <button className="btn w-full mt-4" onClick={onClose}>Fechar</button></DialogContent></Dialog>
}
