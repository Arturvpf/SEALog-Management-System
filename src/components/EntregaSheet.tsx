import { useState } from 'react'
import { format, differenceInMinutes } from 'date-fns'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { useStore, TRANSICOES } from '../store'
import { CLIENTES } from '../data/mock'
import type { Canal, Status, TipoOcorrencia } from '../types'
import { StatusBadge, STATUS } from './StatusBadge'
import { TimelineStatus } from './TimelineStatus'
import { CompletarForm } from './CompletarForm'
import { Sheet, SheetContent, SheetTitle } from './ui/sheet'
export function EntregaSheet() {
  const openId = useStore(s => s.openId)
  const e = useStore(s => s.entregas.find(x => x.id === s.openId))
  if (!openId || !e) return null
  return <Conteudo key={e.id + e.historico.length}/>
}
function Conteudo() {
  const PARCEIRAS = useStore(s => s.parceiras)
  const { openId, abrir, entregas, user, lancar } = useStore()
  const e = entregas.find(x => x.id === openId)!
  const [aba, setAba] = useState<'hist'|'upd'|'dados'>(e.status==='incompleta' ? 'dados' : 'hist')
  const parc = PARCEIRAS.find(p => p.id === e.parceiraId); const cli = CLIENTES.find(c => c.id === e.clienteId)
  const min = differenceInMinutes(new Date(), new Date(e.statusAtualizadoEm))
  const velho = min > 120 && ['aguardando_coleta','coletada','em_rota'].includes(e.status)
  const msg = `Olá, ${parc?.nome}! Pode atualizar o status da entrega ${e.id} (${e.destinatario.nome}, ${e.endereco.bairro})? Última atualização há ${Math.floor(min/60)}h. Obrigado! — SEALog`
  const [st, setSt] = useState<Status|''>(''); const [canal, setCanal] = useState<Canal>('whatsapp_parceira'); const [quem, setQuem] = useState(parc?.nome ?? '')
  const [quando, setQuando] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm")); const [obs, setObs] = useState(''); const [tipo, setTipo] = useState<TipoOcorrencia|''>(''); const [recebido, setRecebido] = useState(''); const [foto, setFoto] = useState('')
  const salvar = () => {
    if (!st) return toast.error('Escolha o novo status')
    const err = lancar(e.id, { status:st, canal, informadoPor:quem || 'SEALog', ocorridoEm:quando, observacao:obs || undefined, tipoOcorrencia: tipo || undefined,
      comprovante: st==='entregue' ? { recebidoPor:recebido, horario:new Date(quando).toISOString(), observacao:obs || undefined, fotoUrl:foto || undefined } : undefined })
    if (err) toast.error(err); else toast.success('Status registrado')
  }
  const cliente = user?.perfil==='cliente'
  return <Sheet open onOpenChange={o => { if (!o) abrir(null) }}><SheetContent>
      <div className="flex justify-between items-start"><div><SheetTitle className="text-xl">{e.id}</SheetTitle><p className="text-sm text-ardosia">{cli?.nome} · {e.pedidoId}</p></div>
        <button aria-label="Fechar" onClick={() => abrir(null)} className="min-h-[44px] min-w-[44px] grid place-items-center"><X/></button></div>
      <div className="card p-4 mt-3 space-y-1 text-sm"><StatusBadge status={e.status}/>
        <p><b>{e.destinatario.nome}</b> · {e.destinatario.telefone || 'sem telefone'}</p>
        <p>{e.endereco.logradouro}, {e.endereco.numero || 's/n'} — {e.endereco.bairro}, {e.endereco.cidade}</p>
        <p>Parceira: {parc?.nome ?? 'não atribuída'} · Atualizado {format(new Date(e.statusAtualizadoEm),'dd/MM/yyyy HH:mm')}</p>
        {e.pendencias.length>0 && <p className="text-amber-800">Pendências: {e.pendencias.join(', ')}</p>}
        {e.comprovante && <p className="text-green-800">Comprovante: recebido por {e.comprovante.recebidoPor} às {format(new Date(e.comprovante.horario),'HH:mm')}</p>}
        {e.comprovante?.fotoUrl && <a href={e.comprovante.fotoUrl} target="_blank" rel="noreferrer"><img src={e.comprovante.fotoUrl} alt="Foto do comprovante" className="rounded-xl max-h-40 mt-1" onError={ev => { ev.currentTarget.style.display = 'none' }}/></a>}
        {velho && <div className="bg-amber-100 rounded-xl p-3 mt-2"><p className="font-bold">Status desatualizado</p>
          <button className="btn-out mt-2" onClick={() => { navigator.clipboard?.writeText(msg); toast.success('Texto copiado para o WhatsApp') }}>Solicitar atualização à parceira</button></div>}
      </div>
      {!cliente && <div className="flex gap-2 mt-4">{(e.status==='incompleta' ? ['hist','dados'] as const : ['hist','upd'] as const).map(a => <button key={a} onClick={() => setAba(a)} className={`rounded-full px-4 min-h-[44px] ${aba===a ? 'bg-navy text-creme' : 'border border-navy'}`}>{a==='hist' ? 'Histórico' : a==='dados' ? 'Completar dados' : 'Atualizar'}</button>)}</div>}
      <div className="mt-4">{aba==='hist' || cliente ? <TimelineStatus historico={e.historico}/> : aba==='dados' ? <CompletarForm e={e}/> :
        <div className="space-y-3">
          <label className="block text-sm">Novo status<select className="inp" value={st} onChange={ev => setSt(ev.target.value as Status)}><option value="">Selecione…</option>
            {TRANSICOES[e.status].map(s => <option key={s} value={s}>{STATUS[s].label}</option>)}</select></label>
          {TRANSICOES[e.status].length === 0 && <p className="text-sm bg-amber-100 rounded-xl p-3">Transição não permitida: não há próximo status para uma entrega “{STATUS[e.status].label}”.</p>}
          <label className="block text-sm">Canal<select className="inp" value={canal} onChange={ev => setCanal(ev.target.value as Canal)}>
            <option value="whatsapp_parceira">WhatsApp da parceira</option><option value="telefone">Telefone</option><option value="planilha">Planilha</option></select></label>
          <label className="block text-sm">Informado por<input className="inp" value={quem} onChange={ev => setQuem(ev.target.value)}/></label>
          <label className="block text-sm">Quando ocorreu<input type="datetime-local" className="inp" value={quando} onChange={ev => setQuando(ev.target.value)}/></label>
          {st==='ocorrencia' && <label className="block text-sm">Tipo de ocorrência<select className="inp" value={tipo} onChange={ev => setTipo(ev.target.value as TipoOcorrencia)}><option value="">Selecione…</option>
            {(['destinatario_ausente','recusa','endereco_nao_localizado','atraso'] as const).map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}</select></label>}
          {st==='entregue' && <><label className="block text-sm">Quem recebeu<input className="inp" value={recebido} onChange={ev => setRecebido(ev.target.value)}/></label>
            <label className="block text-sm">Foto do comprovante (simulado)<input type="file" accept="image/*" className="inp py-2" onChange={ev => { const f = ev.target.files?.[0]; if (foto) URL.revokeObjectURL(foto); setFoto(f ? URL.createObjectURL(f) : '') }}/></label>
            {foto && <img src={foto} alt="Pré-visualização do comprovante" className="rounded-xl max-h-40"/>}</>}
          <label className="block text-sm">Observação<textarea className="inp py-2" value={obs} onChange={ev => setObs(ev.target.value)}/></label>
          <p className="text-xs text-ardosia">O horário de registro é gerado automaticamente.</p>
          <button className="btn-cta w-full" disabled={TRANSICOES[e.status].length === 0} onClick={salvar}>Registrar status</button></div>}</div>
    </SheetContent></Sheet>
}
