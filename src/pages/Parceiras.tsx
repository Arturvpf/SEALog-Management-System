import { useState } from 'react'
import { toast } from 'sonner'
import { useStore } from '../store'
import { PageHeader } from '../components/Layout'
import type { Parceira, Regiao } from '../types'
const REGIOES: Regiao[] = ['Zona Sul', 'Zona Norte', 'Centro', 'Zona Oeste', 'Jaboatão', 'Olinda']
const Chip = ({ children }: { children: string }) => <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{children}</span>
function Editor({ inicial, onClose }: { inicial: Parceira | null; onClose: () => void }) {
  const salvar = useStore(s => s.salvarParceira)
  const [nome, setNome] = useState(inicial?.nome ?? ''); const [cap, setCap] = useState(String(inicial?.capacidadeDiaria ?? 10))
  const [canal, setCanal] = useState(inicial?.canalPreferido ?? ''); const [regs, setRegs] = useState<Regiao[]>(inicial?.regioes ?? [])
  const toggle = (r: Regiao) => setRegs(s => s.includes(r) ? s.filter(x => x !== r) : [...s, r])
  const ok = () => {
    const c = Number(cap)
    if (!nome.trim()) return toast.error('Informe o nome da parceira')
    if (!Number.isInteger(c) || c < 1) return toast.error('Capacidade diária deve ser um número maior que zero')
    if (regs.length === 0) return toast.error('Selecione ao menos uma região')
    if (!canal.trim()) return toast.error('Informe o canal preferido')
    salvar({ id: inicial?.id ?? `p${Date.now()}`, nome: nome.trim(), regioes: regs, capacidadeDiaria: c, canalPreferido: canal.trim() })
    toast.success(inicial ? 'Parceira atualizada' : 'Parceira cadastrada'); onClose() }
  return <div className="card p-4 border-navy space-y-3">
    <h2 className="font-display font-semibold">{inicial ? `Editar ${inicial.nome}` : 'Nova parceira'}</h2>
    <label className="block text-sm">Nome<input className="inp" value={nome} onChange={e => setNome(e.target.value)}/></label>
    <div className="grid grid-cols-2 gap-3">
      <label className="block text-sm">Capacidade diária<input type="number" min={1} className="inp" value={cap} onChange={e => setCap(e.target.value)}/></label>
      <label className="block text-sm">Canal preferido<input className="inp" value={canal} onChange={e => setCanal(e.target.value)}/></label></div>
    <fieldset><legend className="text-sm mb-1">Regiões atendidas</legend><div className="flex flex-wrap gap-2">{REGIOES.map(r =>
      <button key={r} type="button" aria-pressed={regs.includes(r)} onClick={() => toggle(r)} className={`rounded-full px-4 min-h-[44px] text-sm ${regs.includes(r) ? 'bg-accent font-semibold' : 'border border-navy'}`}>{r}</button>)}</div></fieldset>
    <div className="flex gap-2"><button className="btn-cta" onClick={ok}>Salvar</button><button className="btn-out" onClick={onClose}>Cancelar</button></div></div>
}
export default function Parceiras() {
  const parceiras = useStore(s => s.parceiras); const [ed, setEd] = useState<Parceira | 'nova' | null>(null)
  return <><PageHeader description="Gerencie a cobertura, a capacidade e os canais das empresas parceiras." action={ed === null ? <button className="btn-cta" onClick={() => setEd('nova')}>+ Nova parceira</button> : undefined}>Parceiras e regiões</PageHeader>
    <div className="grid md:grid-cols-2 gap-4">
      {ed === 'nova' && <Editor inicial={null} onClose={() => setEd(null)}/>}
      {parceiras.map(p => ed !== null && ed !== 'nova' && ed.id === p.id ? <Editor key={p.id} inicial={p} onClose={() => setEd(null)}/> :
        <section key={p.id} className="card p-4"><div className="flex justify-between items-start gap-2"><h2 className="font-display font-semibold text-lg">{p.nome}</h2>
          <button className="btn-out" onClick={() => setEd(p)}>Editar</button></div>
          <div className="flex flex-wrap gap-2 mt-3">{p.regioes.map(r => <Chip key={r}>{r}</Chip>)}</div>
          <p className="text-sm mt-3">Capacidade diária: <b>{p.capacidadeDiaria}</b> entregas</p>
          <p className="text-sm text-ardosia">Canal preferido: {p.canalPreferido}</p></section>)}</div></>
}
