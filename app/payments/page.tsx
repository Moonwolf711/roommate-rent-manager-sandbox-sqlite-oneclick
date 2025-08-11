'use client'
import useSWR from 'swr'
import { useState } from 'react'
import { toast } from 'sonner'
const fetcher = (url: string) => fetch(url).then(r => r.json())
export default function PaymentsPage() {
  const { data, mutate } = useSWR('/api/payments', fetcher)
  const [amount, setAmount] = useState(''); const [payerName, setPayerName] = useState(''); const [method, setMethod] = useState<'manual'|'cash'|'venmo'|'zelle'>('manual'); const [note, setNote] = useState('')
  const addManual = async () => { if (!amount) return toast.error('Enter an amount'); const res = await fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Number(amount), payerName, method, note }) }); if (!res.ok) return toast.error('Could not save payment'); toast.success('Payment recorded'); setAmount(''); setPayerName(''); setNote(''); mutate() }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Payments</h1>
      <div className="border rounded-lg p-4 shadow-card">
        <div className="font-semibold mb-3">Add payment</div>
        <div className="grid gap-3 md:grid-cols-5">
          <input className="border rounded-md px-3 py-2" type="number" min={1} placeholder="Amount (USD)" value={amount} onChange={e=>setAmount(e.target.value)} />
          <input className="border rounded-md px-3 py-2" placeholder="Payer name (optional)" value={payerName} onChange={e=>setPayerName(e.target.value)} />
          <select className="border rounded-md px-3 py-2 text-sm" value={method} onChange={e=>setMethod(e.target.value as any)}><option value="manual">Manual</option><option value="cash">Cash</option><option value="venmo">Venmo</option><option value="zelle">Zelle</option></select>
          <input className="border rounded-md px-3 py-2" placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} />
          <button className="px-3 py-2 rounded-md bg-brand text-white" onClick={addManual}>Save</button>
        </div>
      </div>
      <div className="border rounded-lg p-4 shadow-card">
        <div className="font-semibold mb-2">History</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm"><thead className="text-left text-gray-500"><tr><th className="py-2">Who</th><th className="py-2">Amount</th><th className="py-2">Date</th><th className="py-2">Method</th><th className="py-2">Status</th></tr></thead><tbody>{(data?.payments ?? []).map((p: any) => (<tr key={p.id} className="border-t"><td className="py-2">{p.payerName ?? p.member?.name ?? '—'}</td><td className="py-2 tabular-nums">${(p.amount/100).toFixed(2)}</td><td className="py-2">{new Date(p.createdAt).toLocaleDateString()}</td><td className="py-2">{p.method ?? 'manual'}</td><td className="py-2"><span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700">{p.status.toLowerCase()}</span></td></tr>))}</tbody></table>
        </div>
      </div>
    </div>
  )
}
