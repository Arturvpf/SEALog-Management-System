import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BAIRRO_REGIAO, ENTREGAS_INICIAIS, PARCEIRAS } from '../data/mock'
import { pendenciasDe, type EntregaForm } from '../lib/entregas'
import type { Canal, Comprovante, Entrega, EventoStatus, Parceira, Pedido, Perfil, Status, TipoOcorrencia } from '../types'
export const TRANSICOES: Record<Status, Status[]> = { incompleta:[], pronta:[], aguardando_coleta:['coletada','ocorrencia'], coletada:['em_rota','ocorrencia'], em_rota:['entregue','ocorrencia'], entregue:[], ocorrencia:['devolvida','pronta'], devolvida:[] }
export interface User { perfil: Perfil; clienteId?: string }
export interface Lancamento { status: Status; canal: Canal; informadoPor: string; ocorridoEm: string; observacao?: string; tipoOcorrencia?: TipoOcorrencia; comprovante?: Comprovante }
interface S {
  entregas: Entrega[]; user: User|null; openId: string|null
  pedidos: Pedido[]; addPedido: (p: Pedido, n: Entrega[]) => void; completar: (id: string, d: EntregaForm) => void
  decidir: (id: string, d: 'reentrega'|'devolucao', novaData?: string) => void
  diasFechados: string[]; fecharDia: (data: string) => void
  parceiras: Parceira[]; salvarParceira: (p: Parceira) => void
  avisados: string[]; avisarCliente: (chave: string) => void
  login: (u: User) => void; logout: () => void; abrir: (id: string|null) => void
  atribuir: (ids: string[], parceiraId: string, motivo?: string) => string|null
  lancar: (id: string, l: Lancamento) => string|null
}
const uid = () => Math.random().toString(36).slice(2, 9)
const evento = (e: Omit<EventoStatus,'id'|'registradoEm'>): EventoStatus => ({ ...e, id: uid(), registradoEm: new Date().toISOString() })
export const useStore = create<S>()(persist((set, get) => ({
  entregas: ENTREGAS_INICIAIS, user: null, openId: null, pedidos: [], diasFechados: [], avisados: [],
  avisarCliente: k => set(s => ({ avisados: s.avisados.includes(k) ? s.avisados : [...s.avisados, k] })), parceiras: PARCEIRAS,
  salvarParceira: p => set(s => ({ parceiras: s.parceiras.some(x => x.id === p.id) ? s.parceiras.map(x => x.id === p.id ? p : x) : [...s.parceiras, p] })),
  fecharDia: data => set(s => ({ diasFechados: s.diasFechados.includes(data) ? s.diasFechados : [...s.diasFechados, data] })),
  decidir: (id, d, novaData) => { const user = get().user?.perfil ?? 'coordenador'; const agora = new Date().toISOString()
    set(s => ({ entregas: s.entregas.map(e => { if (e.id !== id) return e
      const parc = get().parceiras.find(p => p.id === e.parceiraId)?.nome
      const re = d === 'reentrega'; const status: Status = re ? 'pronta' : 'devolvida'
      return { ...e, status, decisao: d, parceiraId: re ? undefined : e.parceiraId, dataDesejada: re && novaData ? novaData : e.dataDesejada, statusAtualizadoEm: agora,
        historico: [...e.historico, evento({ status, canal:'painel', informadoPor:'Coordenação SEALog', registradoPor:user, ocorridoEm:agora,
          observacao: re ? `Reentrega para ${novaData}. Atribuição anterior (${parc ?? 'sem parceira'}) encerrada.` : `Devolução ao cliente decidida. Parceira ${parc ?? ''} avisada.` })] } }) })) },
  addPedido: (p, n) => set(s => ({ pedidos: [...s.pedidos, p], entregas: [...s.entregas, ...n] })),
  completar: (id, d) => { const user = get().user?.perfil ?? 'atendente'; const agora = new Date().toISOString()
    set(s => ({ entregas: s.entregas.map(e => { if (e.id !== id) return e
      const pend = pendenciasDe(d); const pronta = pend.length === 0 && e.status === 'incompleta'
      return { ...e, destinatario:{ nome:d.nome.trim(), telefone:d.telefone }, endereco:{ logradouro:d.logradouro, numero:d.numero, complemento:d.complemento || undefined, referencia:d.referencia, bairro:d.bairro, cidade:d.cidade },
        regiao:BAIRRO_REGIAO[d.bairro.trim()], volume:d.volume, dataDesejada:d.dataDesejada, pendencias:pend, status: pronta ? 'pronta' as Status : e.status,
        statusAtualizadoEm: pronta ? agora : e.statusAtualizadoEm,
        historico: pronta ? [...e.historico, evento({ status:'pronta', canal:'painel', informadoPor:'SEALog', registradoPor:user, ocorridoEm:agora, observacao:'Dados completados' })] : e.historico } }) })) },
  login: user => set({ user }), logout: () => set({ user: null, openId: null }), abrir: openId => set({ openId }),
  atribuir: (ids, parceiraId, motivo) => {
    const p = get().parceiras.find(x => x.id === parceiraId); if (!p) return 'Parceira inválida'
    const ruim = get().entregas.filter(e => ids.includes(e.id)).find(e => !e.regiao || !p.regioes.includes(e.regiao))
    if (ruim) return `${ruim.id}: ${p.nome} não atende ${ruim.regiao ?? 'região indefinida'}`
    const user = get().user?.perfil ?? 'operacao'
    set(s => ({ entregas: s.entregas.map(e => !ids.includes(e.id) ? e : { ...e, parceiraId, status:'aguardando_coleta' as Status, statusAtualizadoEm:new Date().toISOString(),
      historico:[...e.historico, evento({ status:'aguardando_coleta', canal:'painel', informadoPor:'SEALog', registradoPor:user, ocorridoEm:new Date().toISOString(), observacao: motivo ? `Reatribuída de ${get().parceiras.find(x => x.id === e.parceiraId)?.nome ?? 'sem parceira'} para ${p.nome}. Motivo: ${motivo}` : `Atribuída a ${p.nome}` })] }) }))
    return null
  },
  lancar: (id, l) => {
    const e = get().entregas.find(x => x.id === id); if (!e) return 'Entrega não encontrada'
    if (!TRANSICOES[e.status].includes(l.status)) return 'Transição não permitida'
    if (l.status==='ocorrencia' && !l.tipoOcorrencia) return 'Informe o tipo de ocorrência'
    if (l.status==='entregue' && !l.comprovante?.recebidoPor) return 'Informe quem recebeu'
    const user = get().user?.perfil ?? 'operacao'
    set(s => ({ entregas: s.entregas.map(x => x.id!==id ? x : { ...x, status:l.status, statusAtualizadoEm:new Date().toISOString(),
      parceiraId: l.status==='pronta' ? undefined : x.parceiraId, comprovante: l.comprovante ?? x.comprovante,
      historico:[...x.historico, evento({ status:l.status, canal:l.canal, informadoPor:l.informadoPor, registradoPor:user, ocorridoEm:new Date(l.ocorridoEm).toISOString(), observacao:l.observacao, tipoOcorrencia:l.tipoOcorrencia })] }) }))
    return null
  },
}), { name:'sealog-store', partialize: s => ({ avisados:s.avisados, parceiras:s.parceiras, entregas:s.entregas, pedidos:s.pedidos, diasFechados:s.diasFechados, user:s.user }) }))
