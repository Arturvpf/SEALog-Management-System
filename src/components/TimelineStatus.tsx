import { format, differenceInMinutes } from 'date-fns'
import type { EventoStatus } from '../types'
import { StatusBadge } from './StatusBadge'
const f = (d: string) => format(new Date(d), 'dd/MM/yyyy HH:mm')
export function TimelineStatus({ historico }: { historico: EventoStatus[] }) {
  return <ol className="border-l-2 border-borda ml-2 space-y-4">{[...historico].reverse().map(h => {
    const atraso = differenceInMinutes(new Date(h.registradoEm), new Date(h.ocorridoEm))
    return <li key={h.id} className="pl-4 relative"><span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-navy"/>
      <StatusBadge status={h.status}/>{h.tipoOcorrencia && <span className="ml-2 text-xs text-destructive font-semibold">{h.tipoOcorrencia.replace(/_/g,' ')}</span>}
      <p className="text-sm mt-1">Fato: {f(h.ocorridoEm)} · Registro: {f(h.registradoEm)}</p>
      {atraso >= 5 && <p className="text-xs text-amber-800">Atraso de registro: {atraso} min</p>}
      <p className="text-xs text-ardosia">{h.canal.replace(/_/g,' ')} · informado por {h.informadoPor} · registrado por {h.registradoPor}</p>
      {h.observacao && <p className="text-sm italic">{h.observacao}</p>}</li> })}</ol>
}
