import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useStore } from '../store'
import { pedidoSchema, type PedidoForm } from '../lib/entregas'
import type { Entrega } from '../types'
import { EntregaFields } from './EntregaFields'
export function CompletarForm({ e }: { e: Entrega }) {
  const completar = useStore(s => s.completar)
  const f = useForm<PedidoForm>({ resolver: zodResolver(pedidoSchema), mode: 'onChange', defaultValues: { clienteId: e.clienteId, canalOrigem: 'painel',
    entregas: [{ nome:e.destinatario.nome, telefone:e.destinatario.telefone, logradouro:e.endereco.logradouro, numero:e.endereco.numero, complemento:e.endereco.complemento ?? '', referencia:e.endereco.referencia, bairro:e.endereco.bairro, cidade:e.endereco.cidade, volume:e.volume, dataDesejada:e.dataDesejada }] } })
  useEffect(() => { void f.trigger() }, [f])
  return <form className="space-y-3" onSubmit={f.handleSubmit(v => { completar(e.id, v.entregas[0]); toast.success('Entrega pronta para distribuição') })}>
    <p className="text-sm bg-amber-100 rounded-xl p-3">Pendências: {e.pendencias.join(', ') || 'nenhuma'}</p>
    <EntregaFields i={0} register={f.register} errors={f.formState.errors}/>
    <button className="btn-cta w-full" disabled={!f.formState.isValid}>Salvar e marcar como pronta</button></form>
}
