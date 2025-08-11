import { prisma } from '@/lib/db'
import { currentMonthBounds, computeLateFees, isPastDue } from '@/lib/rent'
export const runtime = 'nodejs'

export default async function DashboardPage() {
  const now = new Date()
  const { start, end } = currentMonthBounds(now)
  
  const household = await prisma.household.findFirst({ 
    select: { 
      name: true, 
      address: true,
      leases: { 
        where: { startAt: { lte: now }, endAt: { gte: now } }, 
        include: { 
          lateFeePolicy: true,
          members: {
            include: {
              shares: true
            }
          },
          pets: true,
          shares: true
        }, 
        take: 1 
      } 
    } 
  })
  
  if (!household || household.leases.length === 0) { 
    return <div><h1 className="text-2xl font-semibold">Dashboard</h1><div className="mt-4 border rounded-lg p-4">No active lease.</div></div> 
  }
  
  const lease = household.leases[0]
  const payments = await prisma.payment.findMany({ 
    where: { createdAt: { gte: start, lte: end }, status: 'SUCCEEDED' }, 
    orderBy: { createdAt: 'desc' } 
  })
  const expenses = await prisma.expense.findMany({ 
    where: { createdAt: { gte: start, lte: end } }, 
    orderBy: { createdAt: 'desc' } 
  })
  
  const totalPaid = payments.reduce((s: number, p: any) => s + p.amount, 0)
  const totalDue = lease.shares.reduce((sum, share) => sum + (share.amountCents || 0), 0) // Total of all custom amounts
  const lateFees = computeLateFees(lease.lateFeePolicy, lease as any, totalPaid, now)
  const status = isPastDue(lease as any, now) ? 'Past Due' : totalPaid >= totalDue ? 'All Set' : 'Due Soon'
  const remaining = totalDue + lateFees - totalPaid
  
  // Calculate who has paid and who hasn't using custom shares
  const memberPayments = lease.members.map(member => {
    const memberShare = member.shares[0]?.amountCents || 0
    const memberPaid = payments
      .filter((p: any) => p.memberId === member.id || p.payerName?.includes(member.name.split(' ')[0]))
      .reduce((sum, p) => sum + p.amount, 0)
    return {
      name: member.name,
      share: memberShare,
      paid: memberPaid,
      owed: memberShare - memberPaid
    }
  })
  
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-500">{household.address || household.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={"px-2 py-1 rounded text-xs " + (status === 'Past Due' ? 'bg-red-100 text-red-700' : status === 'All Set' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>{status}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Stat title="Lease Rent" value={`$${(lease.rent/100).toLocaleString()}`} />
        <Stat title="Total Due" value={`$${(totalDue/100).toLocaleString()}`} />
        <Stat title="Paid" value={`$${(totalPaid/100).toLocaleString()}`} />
        <Stat title="Late Fees" value={`$${(lateFees/100).toLocaleString()}`} />
        <Stat title="Remaining" value={`$${(remaining/100).toLocaleString()}`} />
      </div>

      {/* Tenant Payment Status with Custom Amounts */}
      <div className="border rounded-lg p-4">
        <div className="font-semibold mb-3">Tenant Payment Status - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {memberPayments
            .sort((a, b) => b.share - a.share) // Sort by amount owed (highest first)
            .map((member, i) => (
            <div key={i} className="border rounded-md p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-500">
                    {member.share === 0 ? 'No rent' : `Owes: $${(member.share/100).toFixed(2)}`}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  member.share === 0 ? 'bg-gray-100 text-gray-600' :
                  member.owed <= 0 ? 'bg-green-100 text-green-700' : 
                  'bg-red-100 text-red-700'
                }`}>
                  {member.share === 0 ? 'Exempt' :
                   member.owed <= 0 ? 'Paid' : 
                   `Due $${(member.owed/100).toFixed(2)}`}
                </span>
              </div>
              {member.paid > 0 && (
                <div className="text-xs text-gray-500 mt-1">Paid: ${(member.paid/100).toFixed(2)}</div>
              )}
            </div>
          ))}
        </div>
        
        {/* Summary of rent distribution */}
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            <div className="font-medium mb-1">Rent Distribution:</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div>Base Rent to Landlord: ${((lease.baseRent || 550000)/100).toFixed(2)}</div>
              <div>Pet Rent: ${((lease.petRent || 4000)/100).toFixed(2)}</div>
              <div>Total Collected from Tenants: ${(totalDue/100).toFixed(2)}</div>
              <div>Surplus for Utilities: ${((totalDue - (lease.baseRent || 550000) - (lease.petRent || 4000))/100).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <div className="font-semibold mb-2">Lease Details</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Base Rent to Landlord:</span>
              <span>${((lease.baseRent || lease.rent)/100).toLocaleString()}</span>
            </div>
            {lease.petRent && lease.petRent > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Pet Rent ({lease.pets.length} pets):</span>
                <span>${(lease.petRent/100)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Due Date:</span>
              <span>{lease.dueDay}st of each month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Late After:</span>
              <span>Day {lease.graceThroughDay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tenants:</span>
              <span>{lease.members.length} people</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="font-semibold mb-2">Recent Activity</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {[...payments.map((p: any)=>({
              label:`💰 ${p.payerName ?? 'Payment'}`, 
              amount:p.amount/100,
              date: p.createdAt
            })), ...expenses.map((e: any)=>({
              label:`📝 ${e.label}`, 
              amount:e.amount/100,
              date: e.createdAt
            }))]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0,5)
            .map((a,i)=>(
              <div key={i} className="flex items-center justify-between border rounded-md px-3 py-2">
                <div className="text-sm">{a.label}</div>
                <div className="text-sm tabular-nums">${a.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ title, value }: { title: string; value: string }) { 
  return (
    <div className="border rounded-lg p-4 shadow-card">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}