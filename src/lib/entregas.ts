import { z } from 'zod'
import { addBusinessDays, format } from 'date-fns'
import { BAIRRO_REGIAO } from '../data/mock'
import type { Canal, Entrega, Status } from '../types'
export const CANAIS = ['whatsapp_atendimento','telefone','planilha','portal','whatsapp_parceira','painel'] as const
const obr = z.string().trim().min(1, 'Campo obrigatório')
export const entregaSchema = z.object({
  nome: obr, telefone: obr.regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido'),
  logradouro: obr, numero: obr, complemento: z.string().optional(), referencia: obr, bairro: obr, cidade: obr,
  volume: z.enum(['pequeno','medio','grande']), dataDesejada: obr })
export const pedidoSchema = z.object({ clienteId: z.string().min(1, 'Selecione o cliente'), canalOrigem: z.enum(CANAIS), entregas: z.array(entregaSchema).min(1) })
export type EntregaForm = z.infer<typeof entregaSchema>
export type PedidoForm = z.infer<typeof pedidoSchema>
export const proximoDiaUtil = () => format(addBusinessDays(new Date(), 1), 'yyyy-MM-dd')
export const maskTel = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 11)
  return d.length <= 2 ? d : d.length <= 6 ? `(${d.slice(0,2)}) ${d.slice(2)}` : d.length <= 10 ? `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}` : `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}` }
export const contarPendencias = (v: PedidoForm) => { const r = pedidoSchema.safeParse(v); return r.success ? 0 : new Set(r.error.issues.map(i => i.path.join('.'))).size }
const LABELS = { nome:'nome do destinatário', telefone:'telefone do destinatário', logradouro:'logradouro', numero:'número do endereço', referencia:'ponto de referência', bairro:'bairro', cidade:'cidade', dataDesejada:'data desejada' } as const
export const pendenciasDe = (d: EntregaForm): string[] => {
  const p: string[] = (Object.keys(LABELS) as (keyof typeof LABELS)[]).filter(k => !d[k]?.trim()).map(k => LABELS[k])
  if (d.telefone.trim() && !entregaSchema.shape.telefone.safeParse(d.telefone).success) p.push('telefone válido')
  return p }
export function montarEntrega(a: { id: string; pedidoId: string; clienteId: string; dados: EntregaForm; canal: Canal; informadoPor: string; registradoPor: string }): Entrega {
  const { dados: d } = a; const pend = pendenciasDe(d); const status: Status = pend.length ? 'incompleta' : 'pronta'; const agora = new Date().toISOString()
  return { id:a.id, pedidoId:a.pedidoId, clienteId:a.clienteId, destinatario:{ nome:d.nome.trim(), telefone:d.telefone },
    endereco:{ logradouro:d.logradouro, numero:d.numero, complemento:d.complemento || undefined, referencia:d.referencia, bairro:d.bairro, cidade:d.cidade },
    regiao: BAIRRO_REGIAO[d.bairro.trim()], volume:d.volume, dataDesejada:d.dataDesejada, status, pendencias:pend, statusAtualizadoEm:agora,
    historico:[{ id:`h-${a.id}-0`, status, canal:a.canal, informadoPor:a.informadoPor, registradoPor:a.registradoPor, ocorridoEm:agora, registradoEm:agora, observacao: pend.length ? `Pendências: ${pend.join(', ')}` : undefined }] }
}
