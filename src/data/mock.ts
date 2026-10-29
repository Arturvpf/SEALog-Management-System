import type { Cliente, Entrega, EventoStatus, Parceira, Regiao, Status, TipoOcorrencia } from '../types'
export const BAIRRO_REGIAO: Record<string, Regiao> = { 'Boa Viagem':'Zona Sul', Pina:'Zona Sul', Imbiribeira:'Zona Sul', Piedade:'Zona Sul', 'Graças':'Centro', Derby:'Centro', 'Casa Amarela':'Zona Norte', Paulista:'Olinda', 'Jaboatão':'Jaboatão', Olinda:'Olinda', 'Várzea':'Zona Oeste' }
export const CLIENTES: Cliente[] = [['Farmácia Bom Preço','farmácia'],['Floricultura Jardim','floricultura'],['Loja Estilo','roupa'],['Papelaria Central','papelaria'],['Ateliê Mãos de Fada','e-commerce Instagram'],['Teclas Gigantes Store','e-commerce de periféricos'],['Pet Shop Patinhas','pet shop'],['Livraria Maré','livraria']]
  .map(([nome,tipo],i)=>({ id:`c${i+1}`, nome, tipo, telefone:`(81) 3000-00${10+i}` }))
export const PARCEIRAS: Parceira[] = [
  { id:'p1', nome:'Refactor Express', regioes:['Zona Sul','Centro','Zona Norte'], capacidadeDiaria:25, canalPreferido:'Planilha + grupo de WhatsApp' },
  { id:'p2', nome:'Fretes do Seu Zé', regioes:['Zona Oeste','Jaboatão','Olinda','Centro'], capacidadeDiaria:15, canalPreferido:'Telefone e WhatsApp' }]
const SEQ: Status[] = ['incompleta','incompleta',...Array<Status>(4).fill('pronta'),...Array<Status>(4).fill('aguardando_coleta'),...Array<Status>(3).fill('coletada'),...Array<Status>(4).fill('em_rota'),...Array<Status>(6).fill('entregue'),'ocorrencia','ocorrencia','devolvida']
const FIRST = ['Ana','Bruno','Carla','Diego','Elisa','Felipe','Gabriela','Hugo','Isabela','João','Karen','Lucas','Marina']
const LAST = ['Souza','Lima','Albuquerque','Barros','Cavalcanti','Medeiros','Pereira','Tavares','Vasconcelos','Nunes','Farias']
const BASE: Status[] = ['pronta','aguardando_coleta','coletada','em_rota']
const bairros = Object.keys(BAIRRO_REGIAO)
const now = Date.now()
const today = new Date().toISOString().slice(0,10)
function build(st: Status, i: number): Entrega {
  const path: Status[] = st==='incompleta' ? ['incompleta'] : st==='devolvida' ? [...BASE,'ocorrencia','devolvida']
    : st==='entregue'||st==='ocorrencia' ? [...BASE,st] : BASE.slice(0, BASE.indexOf(st)+1)
  const ocIdx = SEQ.indexOf('ocorrencia'); const bairro = bairros[i % bairros.length]; const regiao = BAIRRO_REGIAO[bairro]
  const cliente = i===ocIdx+1 ? CLIENTES[1] : CLIENTES[i%8]
  const parc = path.includes('aguardando_coleta') ? (PARCEIRAS[0].regioes.includes(regiao) ? PARCEIRAS[0] : PARCEIRAS[1]) : undefined
  const T = st==='em_rota' && i%4<2 ? 4 : 0.5 + (i%3)*0.4
  const hist: EventoStatus[] = path.map((s, j) => {
    const oc = now - (T + (path.length-1-j)*0.8)*3600e3
    const reg = Math.min(now, oc + (j===0 ? 0.1 : 1.3)*3600e3)
    const tipo: TipoOcorrencia|undefined = s==='ocorrencia' ? (i===ocIdx ? 'destinatario_ausente' : 'endereco_nao_localizado') : undefined
    return { id:`h${i}-${j}`, status:s, canal: j===0 ? 'whatsapp_atendimento' : 'whatsapp_parceira', informadoPor: j===0 ? cliente.nome : parc?.nome ?? 'SEALog',
      registradoPor: j===0 ? 'atendente' : 'operacao', ocorridoEm:new Date(oc).toISOString(), registradoEm:new Date(reg).toISOString(),
      tipoOcorrencia:tipo, observacao: tipo==='endereco_nao_localizado' ? 'Buquê de sábado: rua sem placa, destinatário não atendeu' : undefined } })
  return { id:`E-${1001+i}`, pedidoId:`P-${500+Math.floor(i/2)}`, clienteId:cliente.id,
    destinatario:{ nome:`${FIRST[i%13]} ${LAST[(i*3)%11]}`, telefone: i===0 ? '' : `(81) 9${8000+i*37}-${1000+i*13}` },
    endereco:{ logradouro:`Rua ${LAST[(i*5)%11]}`, numero: i===1 ? '' : String(40+i*7), referencia:'Próximo à praça', bairro, cidade: ['Olinda','Paulista','Jaboatão'].includes(bairro) ? bairro : 'Recife' },
    regiao, volume:(['pequeno','medio','grande'] as const)[i%3], dataDesejada:today, status:st, parceiraId:parc?.id,
    pendencias: st==='incompleta' ? [i===0 ? 'telefone do destinatário' : 'número do endereço'] : [], historico:hist,
    comprovante: st==='entregue' ? { recebidoPor:`${FIRST[(i+2)%13]} (recepção)`, horario:hist[hist.length-1].ocorridoEm } : undefined,
    statusAtualizadoEm: hist[hist.length-1].registradoEm }
}
export const ENTREGAS_INICIAIS: Entrega[] = SEQ.map(build)
