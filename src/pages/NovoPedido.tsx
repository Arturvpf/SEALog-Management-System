import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useStore } from '../store'
import { CLIENTES } from '../data/mock'
import { contarPendencias, montarEntrega, pedidoSchema, proximoDiaUtil, type EntregaForm, type PedidoForm } from '../lib/entregas'
import { EntregaFields } from '../components/EntregaFields'
import { PageHeader } from '../components/Layout'
import { StatusBadge } from '../components/StatusBadge'
import type { Entrega } from '../types'
const vazio = (): EntregaForm => ({ nome:'', telefone:'', logradouro:'', numero:'', complemento:'', referencia:'', bairro:'', cidade:'Recife', volume:'pequeno', dataDesejada:proximoDiaUtil() })
export default function NovoPedido() {
  const { user, addPedido } = useStore(); const [resumo, setResumo] = useState<Entrega[]|null>(null)
  const f = useForm<PedidoForm>({ resolver: zodResolver(pedidoSchema), mode: 'onChange', defaultValues: { clienteId:'', canalOrigem:'whatsapp_atendimento', entregas:[vazio()] } })
  const { fields, append, remove } = useFieldArray({ control: f.control, name: 'entregas' })
  const pend = contarPendencias(f.watch()); const erros = f.formState.errors
  const salvar = (v: PedidoForm) => {
    const cli = CLIENTES.find(c => c.id === v.clienteId); if (!cli) return toast.error('Selecione o cliente')
    const st = useStore.getState(); const pedidoId = `P-${600 + st.pedidos.length}`
    const novas = v.entregas.map((d, i) => montarEntrega({ id:`E-${1001 + st.entregas.length + i}`, pedidoId, clienteId:cli.id, dados:d, canal:v.canalOrigem, informadoPor:cli.nome, registradoPor:user?.perfil ?? 'atendente' }))
    addPedido({ id:pedidoId, clienteId:cli.id, canalOrigem:v.canalOrigem, criadoEm:new Date().toISOString(), entregaIds:novas.map(n => n.id) }, novas)
    setResumo(novas); toast.success(`Pedido ${pedidoId} registrado`)
  }
  if (resumo) return <><PageHeader>Pedido <span className="hl text-navy">registrado</span></PageHeader>
    <div className="space-y-2">{resumo.map(e => <div key={e.id} className="card p-4 flex justify-between"><span><b>{e.id}</b> · {e.destinatario.nome}<span className="block text-sm text-ardosia">{e.endereco.bairro} · {e.regiao ?? 'região não identificada'}</span></span><StatusBadge status={e.status}/></div>)}</div>
    <div className="flex gap-2 mt-4"><button className="btn-cta" onClick={() => { setResumo(null); f.reset({ clienteId:'', canalOrigem:'whatsapp_atendimento', entregas:[vazio()] }) }}>Novo pedido</button><Link to="/pedidos" className="btn-out grid place-items-center">Ver pedidos</Link></div></>
  return <><PageHeader>Novo <span className="hl text-navy">pedido</span></PageHeader>
    <form onSubmit={f.handleSubmit(salvar)} className="space-y-4">
      <div className="card p-4 grid md:grid-cols-2 gap-3">
        <label className="block text-sm">Cliente<select className="inp" {...f.register('clienteId')}><option value="">Selecione…</option>{CLIENTES.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
          {erros.clienteId && <span role="alert" className="text-xs text-red-600">{erros.clienteId.message}</span>}</label>
        <label className="block text-sm">Canal de origem<select className="inp" {...f.register('canalOrigem')}><option value="whatsapp_atendimento">WhatsApp do atendimento</option><option value="telefone">Telefone</option><option value="planilha">Planilha</option><option value="portal">Portal</option></select></label></div>
      {fields.map((fd, i) => <section key={fd.id} className="card p-4"><div className="flex justify-between mb-3"><h2 className="font-mono font-bold">Entrega {i+1}</h2>
        {fields.length > 1 && <button type="button" className="btn-out" onClick={() => remove(i)}>Remover</button>}</div><EntregaFields i={i} register={f.register} errors={erros}/></section>)}
      <button type="button" className="btn-out" onClick={() => append(vazio())}>+ Adicionar entrega</button>
      <div className="flex flex-wrap items-center gap-3"><button className="btn-cta" disabled={pend > 0}>Registrar pedido</button>
        <span className="text-sm text-ardosia" aria-live="polite">{pend} campos pendentes</span>
        <button type="button" className="text-sm underline text-ardosia min-h-[44px]" onClick={() => salvar(f.getValues())}>Salvar entrega como incompleta</button></div></form></>
}
