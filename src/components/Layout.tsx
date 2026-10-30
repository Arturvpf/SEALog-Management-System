import type { ReactNode } from 'react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft, LayoutDashboard, ListChecks, Truck, Search, LogOut, AlertTriangle, Wallet, Users, PackageOpen } from 'lucide-react'
import { useStore } from '../store'
import type { Perfil } from '../types'
import { EntregaSheet } from './EntregaSheet'
import { BuscaGlobal } from './BuscaGlobal'

export const NAV: { to: string; label: string; icon: typeof Search; perfis: Perfil[] }[] = [
  { to:'/painel', label:'Painel', icon:LayoutDashboard, perfis:['operacao','analista','coordenador'] },
  { to:'/pedidos', label:'Pedidos', icon:ListChecks, perfis:['atendente','analista','coordenador'] },
  { to:'/distribuicao', label:'Distribuição', icon:Truck, perfis:['operacao','coordenador','analista'] },
  { to:'/entregas', label:'Consulta', icon:Search, perfis:['atendente','analista','operacao','coordenador'] },
  { to:'/decisoes', label:'Decisões', icon:AlertTriangle, perfis:['coordenador'] },
  { to:'/financeiro', label:'Financeiro', icon:Wallet, perfis:['financeiro','coordenador'] },
  { to:'/parceiras', label:'Parceiras', icon:Users, perfis:['coordenador'] },
  { to:'/portal', label:'Minhas entregas', icon:ListChecks, perfis:['cliente'] },
]
export const PERFIS: Record<Perfil, string> = {
  atendente: 'Atendente', analista: 'Analista', operacao: 'Empresas parceiras',
  coordenador: 'Coordenação', financeiro: 'Financeiro', cliente: 'Cliente',
}
export const Logo = ({ h = 'h-36' }: { h?: string }) =>
  <img src="/sealog-logo.png" alt="SEALog — Operador Logístico" className={`${h} w-auto object-contain`}/>

export function Layout() {
  const { user, logout } = useStore()
  const nav = useNavigate()
  if (!user) return <Navigate to="/login" replace/>
  const items = NAV.filter(n => n.perfis.includes(user.perfil))
  const sair = () => { logout(); nav('/login') }
  return <div className="min-h-screen md:flex">
    <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:p-3">Ir para o conteúdo</a>
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex justify-center"><Logo/></div>
      <p className="px-6 pb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Gestão de entregas</p>
      <nav aria-label="Navegação principal" className="flex-1 space-y-1 overflow-y-auto px-3">
        {items.map(i => <NavLink key={i.to} to={i.to} className={({ isActive }) => `flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
          <i.icon size={18} strokeWidth={1.75}/>{i.label}
        </NavLink>)}
      </nav>
      <div className="m-3 mt-6 border-t pt-4">
        <div className="mb-2 flex items-center gap-3 px-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-muted text-sm font-semibold">{PERFIS[user.perfil].slice(0, 2).toUpperCase()}</span>
          <div><p className="text-sm font-semibold">{PERFIS[user.perfil]}</p><p className="text-xs text-muted-foreground">SEALog Logística</p></div>
        </div>
        <button className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground" onClick={sair}><LogOut size={18}/>Trocar perfil</button>
      </div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="border-b bg-card md:hidden">
        <div className="flex items-center justify-between px-4"><div className="flex items-center gap-2"><Logo h="h-20"/><span className="font-display font-semibold">{PERFIS[user.perfil]}</span></div><button className="btn-out flex items-center gap-2" onClick={sair}><LogOut size={16}/>Sair</button></div>
        <nav aria-label="Navegação principal" className="flex gap-1 overflow-x-auto px-3 pb-3">
          {items.map(i => <NavLink key={i.to} to={i.to} className={({ isActive }) => `flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-medium ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><i.icon size={16}/>{i.label}</NavLink>)}
        </nav>
      </header>
      <main id="conteudo" className="mx-auto max-w-[1440px] p-4 md:p-8">
        <button type="button" className="btn-out mb-5 inline-flex items-center gap-2" onClick={sair}><ArrowLeft size={16} aria-hidden="true"/>Voltar ao início</button>
        {NAV.find(n => n.to === '/entregas')?.perfis.includes(user.perfil) && <BuscaGlobal/>}
        <Outlet/>
      </main>
    </div>
    <EntregaSheet/>
  </div>
}

export const PageHeader = ({ children, action, description }: { children: ReactNode; action?: ReactNode; description?: string }) =>
  <div className="page-header"><div><h1 className="page-title">{children}</h1>{description && <p className="page-description">{description}</p>}</div>{action}</div>
export const EmptyState = ({ text }: { text: string }) =>
  <div className="card flex flex-col items-center gap-3 p-10 text-center text-muted-foreground"><span className="grid h-12 w-12 place-items-center rounded-full bg-muted"><PackageOpen size={24} strokeWidth={1.5}/></span><p className="text-sm">{text}</p></div>
export const KpiCard = ({ label, value, tone = '' }: { label: string; value: number; tone?: string }) =>
  <div className={`card p-5 ${tone}`}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 font-display text-3xl font-semibold tabular-nums">{value}</p></div>
