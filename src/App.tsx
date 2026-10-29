import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Layout, NAV } from './components/Layout'
import { useStore } from './store'
import Login, { HOME } from './pages/Login'
import Lista from './pages/Lista'
import NovoPedido from './pages/NovoPedido'
import Decisoes from './pages/Decisoes'
import Financeiro from './pages/Financeiro'
import Parceiras from './pages/Parceiras'
import Painel from './pages/Painel'
import Distribuicao from './pages/Distribuicao'
function Guard({ to, children }: { to: string; children: ReactNode }) {
  const user = useStore(s => s.user); const ok = !!user && NAV.find(n => n.to===to)?.perfis.includes(user.perfil)
  return ok ? <>{children}</> : <Navigate to={user ? HOME[user.perfil] : '/login'} replace/>
}
export default function App() {
  return <BrowserRouter><Toaster richColors position="top-center"/><Routes>
    <Route path="/login" element={<Login/>}/>
    <Route element={<Layout/>}>
      <Route path="/painel" element={<Guard to="/painel"><Painel/></Guard>}/>
      <Route path="/pedidos" element={<Guard to="/pedidos"><Lista modo="pedidos"/></Guard>}/>
      <Route path="/pedidos/novo" element={<Guard to="/pedidos"><NovoPedido/></Guard>}/>
      <Route path="/decisoes" element={<Guard to="/decisoes"><Decisoes/></Guard>}/>
      <Route path="/financeiro" element={<Guard to="/financeiro"><Financeiro/></Guard>}/>
      <Route path="/parceiras" element={<Guard to="/parceiras"><Parceiras/></Guard>}/>
      <Route path="/distribuicao" element={<Guard to="/distribuicao"><Distribuicao/></Guard>}/>
      <Route path="/entregas" element={<Guard to="/entregas"><Lista modo="consulta"/></Guard>}/>
      <Route path="/portal" element={<Guard to="/portal"><Lista modo="portal"/></Guard>}/></Route>
    <Route path="*" element={<Navigate to="/login" replace/>}/></Routes></BrowserRouter>
}
