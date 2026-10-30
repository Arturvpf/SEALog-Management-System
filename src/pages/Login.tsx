import { Navigate, useNavigate } from 'react-router-dom'
import { ClipboardList, Table2, Wallet, Truck, Users, Building2 } from 'lucide-react'
import { useStore } from '../store'
import { CLIENTES } from '../data/mock'
import { Logo } from '../components/Layout'
import type { Perfil } from '../types'

export const HOME: Record<Perfil,string> = { atendente:'/pedidos', analista:'/painel', operacao:'/painel', coordenador:'/painel', financeiro:'/financeiro', cliente:'/portal' }
const profiles = [
  { perfil: 'atendente', icon: ClipboardList, title: 'Atendente', desc: 'Registrar e acompanhar pedidos' },
  { perfil: 'analista', icon: Table2, title: 'Analista', desc: 'Entregas do dia e distribuição' },
  { perfil: 'financeiro', icon: Wallet, title: 'Financeiro', desc: 'Cobranças, repasses e fechamento' },
  { perfil: 'operacao', icon: Truck, title: 'Empresas parceiras', desc: 'Coletas, rotas e status das entregas' },
  { perfil: 'coordenador', icon: Users, title: 'Coordenação', desc: 'Ocorrências, parceiras e gestão' },
] as const

export default function Login() {
  const { login, user } = useStore()
  const nav = useNavigate()
  if (user) return <Navigate to={HOME[user.perfil]} replace/>
  const entrar = (perfil: Perfil, clienteId?: string) => { login({ perfil, clienteId }); nav(HOME[perfil]) }
  return <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:py-12">
    <Logo h="h-44"/>
    <h1 className="mt-2 text-center text-2xl font-semibold">Bem-vindo(a) ao SEALog!</h1>
    <p className="mt-1 text-center text-muted-foreground">Escolha o perfil de acesso para entrar</p>
    <div className="mt-8 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
      {profiles.map(p => <button key={p.perfil} className="profile-card" onClick={() => entrar(p.perfil)}>
        <span className="profile-icon"><p.icon size={24} strokeWidth={1.75}/></span>
        <span><span className="block font-semibold">{p.title}</span><span className="mt-1 block text-sm text-muted-foreground">{p.desc}</span></span>
      </button>)}
      <div className="flex items-start gap-4 rounded-xl border bg-card p-5">
        <span className="profile-icon"><Building2 size={24} strokeWidth={1.75}/></span>
        <label className="min-w-0 flex-1"><span className="block font-semibold">Portal do cliente</span>
          <span className="mt-1 block text-sm text-muted-foreground">Acompanhar minhas entregas</span>
          <select aria-label="Selecionar cliente" className="inp mt-3" defaultValue="" onChange={e => e.target.value && entrar('cliente', e.target.value)}>
            <option value="">Selecione seu negócio…</option>{CLIENTES.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </label>
      </div>
    </div>
  </main>
}
