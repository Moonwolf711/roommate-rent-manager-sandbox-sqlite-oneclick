'use client'
import useSWR from 'swr'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
const fetcher = (u:string)=>fetch(u).then(r=>r.json())
export default function ExpensesPage() {
  const { data, mutate } = useSWR('/api/expenses', fetcher)
  const [desc, setDesc] = useState(''); const [amount, setAmount] = useState(''); const [splitMethod, setSplitMethod] = useState<'EQUAL'|'PERCENT'|'ROOM_RENT'>('EQUAL')
  const save = async () => { if (!desc || !amount) return toast.error('Add description and amount'); const res = await fetch('/api/expenses', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ desc, amount: Number(amount), splitMethod }) }); if (!res.ok) return toast.error('Could not save expense'); toast.success('Expense saved'); setDesc(''); setAmount(''); mutate() }
  const total = useMemo(()=> (data?.expenses ?? []).reduce((s:any,e:any)=>s+e.amount,0)/100, [data])
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Expenses</h1>
      <div className="border rounded-lg p-4 shadow-card">
        <div className="font-semibold mb-3">Log an expense</div>
        <div className="grid gap-3 md:grid-cols-4">
          <input className="border rounded-md px-3 py-2" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Internet, utilities, supplies..." />
          <input className="border rounded-md px-3 py-2" type="number" min={0} step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" />
          <select className="border rounded-md px-3 py-2 text-sm" value={splitMethod} onChange={e=>setSplitMethod(e.target.value as any)}><option value="EQUAL">Split equally</option><option value="PERCENT">Split by percent</option><option value="ROOM_RENT">Split by room rent</option></select>
          <button className="px-3 py-2 rounded-md bg-brand text-white" onClick={save}>Save</button>
        </div>
      </div>
      <div className="border rounded-lg p-4 shadow-card">
        <div className="font-semibold mb-2">History</div>
        <div className="mb-3 text-sm text-gray-500">Month total: ${total.toFixed(2)}</div>
        <ul className="divide-y">{(data?.expenses ?? []).map((i:any) => (<li key={i.id} className="py-3 flex items-center justify-between"><div><div className="font-medium">{i.label}</div><div className="text-xs text-gray-500">{new Date(i.createdAt).toLocaleDateString()} • Split: {i.splitMethod.toLowerCase()}</div></div><div className="tabular-nums">${(i.amount/100).toFixed(2)}</div></li>))}</ul>
      </div>
    </div>
  )
}
