import type { ReactNode } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { BAIRRO_REGIAO } from '../data/mock'
import { maskTel, type EntregaForm, type PedidoForm } from '../lib/entregas'
const F = ({ label, erro, children }: { label: string; erro?: string; children: ReactNode }) =>
  <label className="block text-sm">{label}{children}{erro && <span role="alert" className="block text-xs text-red-600 mt-0.5">{erro}</span>}</label>
export function EntregaFields({ i, register, errors }: { i: number; register: UseFormRegister<PedidoForm>; errors: FieldErrors<PedidoForm> }) {
  const er = errors.entregas?.[i]; const m = (k: keyof EntregaForm) => er?.[k]?.message
  return <div className="grid md:grid-cols-2 gap-3">
    <F label="Nome do destinatário" erro={m('nome')}><input className="inp" {...register(`entregas.${i}.nome`)}/></F>
    <F label="Telefone" erro={m('telefone')}><input className="inp" inputMode="tel" placeholder="(81) 99999-9999" {...register(`entregas.${i}.telefone`, { onChange: ev => { ev.target.value = maskTel(ev.target.value) } })}/></F>
    <F label="Logradouro" erro={m('logradouro')}><input className="inp" {...register(`entregas.${i}.logradouro`)}/></F>
    <F label="Número" erro={m('numero')}><input className="inp" {...register(`entregas.${i}.numero`)}/></F>
    <F label="Complemento (opcional)"><input className="inp" {...register(`entregas.${i}.complemento`)}/></F>
    <F label="Ponto de referência" erro={m('referencia')}><input className="inp" {...register(`entregas.${i}.referencia`)}/></F>
    <F label="Bairro" erro={m('bairro')}><input className="inp" list="bairros" {...register(`entregas.${i}.bairro`)}/></F>
    <F label="Cidade" erro={m('cidade')}><input className="inp" {...register(`entregas.${i}.cidade`)}/></F>
    <F label="Volume"><select className="inp" {...register(`entregas.${i}.volume`)}><option value="pequeno">Pequeno</option><option value="medio">Médio</option><option value="grande">Grande</option></select></F>
    <F label="Data desejada" erro={m('dataDesejada')}><input type="date" className="inp" {...register(`entregas.${i}.dataDesejada`)}/></F>
    <datalist id="bairros">{Object.keys(BAIRRO_REGIAO).map(b => <option key={b} value={b}/>)}</datalist></div>
}
