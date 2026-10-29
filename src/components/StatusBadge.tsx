import type { Status } from '../types'
export const STATUS: Record<Status,{ label: string; cls: string }> = {
  incompleta:{label:'Incompleta',cls:'bg-amber-100 text-amber-900'}, pronta:{label:'Pronta',cls:'bg-gray-100 text-gray-800'},
  aguardando_coleta:{label:'Aguardando coleta',cls:'bg-blue-100 text-blue-900'}, coletada:{label:'Coletada',cls:'bg-indigo-100 text-indigo-900'},
  em_rota:{label:'Em rota',cls:'bg-cyan-100 text-cyan-900'}, entregue:{label:'Entregue',cls:'bg-green-100 text-green-900'},
  ocorrencia:{label:'Ocorrência',cls:'bg-rose-100 text-rose-900'}, devolvida:{label:'Devolvida',cls:'bg-slate-200 text-slate-800'} }
export const StatusBadge = ({ status }: { status: Status }) =>
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS[status].cls}`}>{STATUS[status].label}</span>
