import type { ReactNode } from 'react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ListChecks, Truck, Search, LogOut, AlertTriangle, Wallet, Users } from 'lucide-react'
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
  { to:'/portal', label:'Minhas entregas', icon:ListChecks, perfis:['cliente'] }]
export const Logo = ({ h = 'h-14' }: { h?: string }) => <img src="/logo.png" alt="SEALog — Operador logístico" className={`${h} w-auto mix-blend-multiply`}/>
const Waves = () => <svg viewBox="0 0 200 40" className="w-full" aria-hidden><path d="M0 22 Q25 4 50 22 T100 22 T150 22 T200 22 V40 H0Z" fill="#5A5C80"/><path d="M0 30 Q25 14 50 30 T100 30 T150 30 T200 30 V40 H0Z" fill="#1B1F4A"/></svg>
export function Layout() {
  const { user, logout } = useStore(); const nav = useNavigate()
  if (!user) return <Navigate to="/login" replace/>
  const items = NAV.filter(n => n.perfis.includes(user.perfil))
  const link = ({ isActive }: { isActive: boolean }) => `flex items-center gap-2 rounded-xl px-3 min-h-[44px] ${isActive ? 'bg-navy text-creme' : 'hover:bg-salmao/40'}`
  const sair = () => { logout(); nav('/login') }
  return <div className="md:flex min-h-screen">
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-borda bg-white sticky top-0 h-screen">
      <div className="p-3"><Logo/></div>
      <nav className="px-3 space-y-1 flex-1">{items.map(i => <NavLink key={i.to} to={i.to} className={link}><i.icon size={20} strokeWidth={1.75}/>{i.label}</NavLink>)}</nav>
      <button className="mx-3 mb-2 flex items-center gap-2 min-h-[44px] px-3" onClick={sair}><LogOut size={20} strokeWidth={1.75}/>Sair ({user.perfil})</button><Waves/></aside>
    <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 min-w-0">{NAV.find(n => n.to === '/entregas')?.perfis.includes(user.perfil) && <BuscaGlobal/>}<Outlet/></main>
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-borda flex justify-around z-40">{items.map(i =>
      <NavLink key={i.to} to={i.to} className={({ isActive }) => `flex flex-col items-center justify-center min-h-[56px] min-w-[64px] text-xs ${isActive ? 'text-rosa font-bold' : ''}`}><i.icon size={22} strokeWidth={1.75}/>{i.label}</NavLink>)}
      <button className="flex flex-col items-center justify-center min-h-[56px] min-w-[64px] text-xs" onClick={sair}><LogOut size={22} strokeWidth={1.75}/>Sair</button></nav>
    <EntregaSheet/></div>
}
export const PageHeader = ({ children, action }: { children: ReactNode; action?: ReactNode }) =>
  <div className="flex items-center justify-between gap-3 mb-5"><h1 className="font-mono font-bold text-2xl md:text-3xl text-rosa">{children}</h1>{action}</div>
export const EmptyState = ({ text }: { text: string }) => <div className="selo border border-borda rounded-2xl p-10 text-center text-ardosia"><Waves/>{text}</div>
export const KpiCard = ({ label, value, tone = '' }: { label: string; value: number; tone?: string }) =>
  <div className={`card p-4 ${tone}`}><p className="font-mono font-bold text-3xl">{value}</p><p className="text-sm">{label}</p></div>
