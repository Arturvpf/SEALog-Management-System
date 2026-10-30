import { toast } from 'sonner'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'
import { useStore } from '../store'
import { baixarCsv, gerarTexto, listaDoDia } from '../lib/lista'
export function ListaDiaModal({ parceiraId, onClose }: { parceiraId: string; onClose: () => void }) {
  const p = useStore(s => s.parceiras.find(x => x.id === parceiraId)); const entregas = useStore(s => s.entregas)
  if (!p) return null
  const l = listaDoDia(entregas, p); const texto = gerarTexto(p, l)
  return <Dialog open onOpenChange={o => { if (!o) onClose() }}><DialogContent className="flex flex-col">
      <DialogTitle>Lista do dia — {p.nome}</DialogTitle>
      {l.length === 0 ? <p className="text-sm my-4">Nenhuma entrega ativa para hoje com esta parceira.</p> :
        <textarea readOnly aria-label="Texto da lista" className="inp py-2 mt-3 flex-1 min-h-[260px] font-display text-xs" value={texto}/>}
      <div className="flex flex-wrap gap-2 mt-4">
        <button className="btn-cta" disabled={l.length === 0} onClick={() => { void navigator.clipboard?.writeText(texto); toast.success('Texto copiado. Cole no WhatsApp') }}>Copiar texto</button>
        <button className="btn-out" disabled={l.length === 0} onClick={() => { baixarCsv(p, l); toast.success('CSV baixado') }}>Baixar CSV</button>
        <button className="btn-out ml-auto" onClick={onClose}>Fechar</button></div></DialogContent></Dialog>
}
