export type Regiao = 'Zona Sul' | 'Zona Norte' | 'Centro' | 'Zona Oeste' | 'Jaboatão' | 'Olinda'
export type Status = 'incompleta' | 'pronta' | 'aguardando_coleta' | 'coletada' | 'em_rota' | 'entregue' | 'ocorrencia' | 'devolvida'
export type Canal = 'whatsapp_atendimento' | 'telefone' | 'planilha' | 'portal' | 'whatsapp_parceira' | 'painel'
export type TipoOcorrencia = 'destinatario_ausente' | 'recusa' | 'endereco_nao_localizado' | 'atraso'
export type Volume = 'pequeno' | 'medio' | 'grande'
export type Perfil = 'atendente' | 'analista' | 'operacao' | 'coordenador' | 'financeiro' | 'cliente'
export interface Cliente { id: string; nome: string; tipo: string; telefone: string }
export interface Parceira { id: string; nome: string; regioes: Regiao[]; capacidadeDiaria: number; canalPreferido: string }
export interface Endereco { logradouro: string; numero: string; complemento?: string; referencia: string; bairro: string; cidade: string }
export interface EventoStatus { id: string; status: Status; canal: Canal; informadoPor: string; registradoPor: string; ocorridoEm: string; registradoEm: string; observacao?: string; tipoOcorrencia?: TipoOcorrencia }
export interface Comprovante { recebidoPor: string; horario: string; observacao?: string; fotoUrl?: string }
export interface Entrega {
  id: string; pedidoId: string; clienteId: string; destinatario: { nome: string; telefone: string }
  endereco: Endereco; regiao?: Regiao; volume: Volume; dataDesejada: string; status: Status
  parceiraId?: string; pendencias: string[]; historico: EventoStatus[]; comprovante?: Comprovante
  decisao?: 'reentrega' | 'devolucao'; statusAtualizadoEm: string
}
export interface Pedido { id: string; clienteId: string; canalOrigem: Canal; criadoEm: string; entregaIds: string[] }
