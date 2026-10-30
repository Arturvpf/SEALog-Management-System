import type { Status } from '../types'
export const STATUS: Record<Status,{ label: string; cls: string }> = {
  incompleta:{label:'Incompleta',cls:'bg-warning/20 text-amber-900'}, pronta:{label:'Pronta',cls:'bg-accent text-primary'},
  aguardando_coleta:{label:'Aguardando coleta',cls:'bg-muted text-muted-foreground'}, coletada:{label:'Coletada',cls:'bg-info/15 text-sky-800'},
  em_rota:{label:'Em rota',cls:'bg-primary/10 text-primary'}, entregue:{label:'Entregue',cls:'bg-success/15 text-green-800'},
  ocorrencia:{label:'Ocorrência',cls:'bg-warning/20 text-amber-900'}, devolvida:{label:'Devolvida',cls:'bg-destructive/15 text-destructive'} }
export const StatusBadge = ({ status }: { status: Status }) =>
  <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS[status].cls}`}>{STATUS[status].label}</span>
