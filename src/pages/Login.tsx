import { Navigate, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { CLIENTES } from '../data/mock'
import { Logo } from '../components/Layout'
import type { Perfil } from '../types'
export const HOME: Record<Perfil,string> = { atendente:'/pedidos', analista:'/painel', operacao:'/painel', coordenador:'/painel', financeiro:'/financeiro', cliente:'/portal' }
export default function Login() {
  const { login, user } = useStore(); const nav = useNavigate()
  if (user) return <Navigate to={HOME[user.perfil]} replace/>
  const entrar = (perfil: Perfil, clienteId?: string) => { login({ perfil, clienteId }); nav(HOME[perfil]) }
  return <div className="min-h-screen grid place-items-center p-4"><div className="selo border border-borda rounded-3xl p-8 w-full max-w-md shadow-sm">
    <div className="flex justify-center"><Logo h="h-28"/></div>
    <h1 className="font-mono font-bold text-xl text-center mt-2">Entrar como <span className="hl">perfil</span></h1>
    <div className="grid grid-cols-2 gap-2 mt-5">{(['atendente','analista','operacao','coordenador','financeiro'] as const).map(p => <button key={p} className="btn capitalize" onClick={() => entrar(p)}>{p === 'operacao' ? 'Operação' : p}</button>)}</div>
    <label className="block mt-4 text-sm">Cliente<select className="inp" defaultValue="" onChange={e => e.target.value && entrar('cliente', e.target.value)}>
      <option value="">Selecione um cliente…</option>{CLIENTES.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></label></div></div>
}
