import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

export default async function LeasePage() {
  const now = new Date()
  const household = await prisma.household.findFirst({
    include: {
      houseRules: {
        orderBy: { order: 'asc' }
      }
    }
  })
  
  const lease = await prisma.lease.findFirst({ 
    where: { startAt: { lte: now }, endAt: { gte: now } }, 
    include: { 
      lateFeePolicy: true,
      members: {
        include: {
          shares: true
        }
      },
      pets: true,
      shares: true,
      utilities: {
        orderBy: { type: 'asc' }
      }
    } 
  })
  
  if (!lease) return <div><h1 className="text-2xl font-semibold">Lease</h1><div className="mt-4 border rounded-lg p-4">No active lease.</div></div>
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Lease Information</h1>
      
      {/* Property Details */}
      <div className="border rounded-lg p-4 shadow-card">
        <h2 className="text-lg font-semibold mb-3">Property Details</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Fact label="Address" value={household?.address || '2577 Eaton St, Edgewater, CO 80214'} />
          <Fact label="Landlords" value={lease.landlords || 'Sarah and Nathan Harrison'} />
          <Fact label="Property Manager" value={lease.propertyManager || 'Focused Property Management'} />
        </div>
      </div>

      {/* Lease Terms */}
      <div className="border rounded-lg p-4 shadow-card">
        <h2 className="text-lg font-semibold mb-3">Lease Terms</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Fact label="Total Monthly Rent" value={`$${(lease.rent/100).toLocaleString()}`} />
          <Fact label="Base Rent" value={`$${((lease.baseRent || lease.rent)/100).toLocaleString()}`} />
          <Fact label="Pet Rent" value={lease.petRent ? `$${(lease.petRent/100)}` : '—'} />
          <Fact label="Security Deposit" value={lease.securityDeposit ? `$${(lease.securityDeposit/100).toLocaleString()}` : '—'} />
          <Fact label="Due Day" value={`${lease.dueDay}st of each month`} />
          <Fact label="Grace Period" value={`Through day ${lease.graceThroughDay}`} />
          <Fact label="Late Fee" value={lease.lateFeePolicy ? (lease.lateFeePolicy.type==='FLAT'?`$${(lease.lateFeePolicy.amount/100)} or 5% (whichever is higher)`:`$${(lease.lateFeePolicy.amount/100)}/day`) : '—'} />
          <Fact label="Lease Term" value={`${lease.startAt.toISOString().slice(0,10)} to ${lease.endAt.toISOString().slice(0,10)}`} />
          <Fact label="Max Occupants" value={`${lease.maxOccupants || 8} people`} />
        </div>
      </div>

      {/* Tenants */}
      <div className="border rounded-lg p-4 shadow-card">
        <h2 className="text-lg font-semibold mb-3">Tenants ({lease.members.length}) - Custom Rent Split</h2>
        <div className="grid gap-3 md:grid-cols-4">
          {lease.members
            .sort((a, b) => {
              const aShare = a.shares?.[0]?.amountCents || 0
              const bShare = b.shares?.[0]?.amountCents || 0
              return bShare - aShare
            })
            .map(member => {
              const share = member.shares?.[0]?.amountCents || 0
              return (
                <div key={member.id} className="p-3 border rounded-md">
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-600">
                    {share === 0 ? (
                      <span className="text-green-600">No rent (exempt)</span>
                    ) : (
                      <span>Monthly: ${(share/100).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
        <div className="mt-3 pt-3 border-t text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Total collected from tenants:</span>
            <span className="font-medium">${(lease.shares.reduce((sum, s) => sum + (s.amountCents || 0), 0)/100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Pets */}
      {lease.pets.length > 0 && (
        <div className="border rounded-lg p-4 shadow-card">
          <h2 className="text-lg font-semibold mb-3">Registered Pets ({lease.pets.length})</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {lease.pets.map(pet => (
              <div key={pet.id} className="p-3 border rounded-md">
                <div className="font-medium">{pet.type} - {pet.breed}</div>
                <div className="text-sm text-gray-600">
                  Weight: {pet.weight} • {pet.isNeuteredSpayed ? 'Neutered/Spayed' : 'Not fixed'}
                  {pet.monthlyFee && <span> • Monthly fee: ${(pet.monthlyFee/100)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Utilities */}
      <div className="border rounded-lg p-4 shadow-card">
        <h2 className="text-lg font-semibold mb-3">Utilities Responsibility</h2>
        <div className="space-y-2">
          {lease.utilities.map(utility => (
            <div key={utility.id} className="flex justify-between items-center p-3 border rounded-md">
              <div>
                <div className="font-medium">{utility.type.replace(/_/g, ' ')}</div>
                {utility.notes && <div className="text-xs text-gray-500">{utility.notes}</div>}
              </div>
              <div className="text-sm">
                <span className={`px-2 py-1 rounded text-white ${
                  utility.responsibility === 'TENANT' ? 'bg-blue-500' :
                  utility.responsibility === 'LANDLORD' ? 'bg-green-500' :
                  'bg-orange-500'
                }`}>
                  {utility.responsibility === 'LANDLORD_BILLED' ? 'Landlord bills tenant' : utility.responsibility}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* House Rules */}
      {household?.houseRules && household.houseRules.length > 0 && (
        <div className="border rounded-lg p-4 shadow-card">
          <h2 className="text-lg font-semibold mb-3">House Rules & Guidelines</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {household.houseRules.map(rule => (
              <div key={rule.id} className="p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{rule.icon}</span>
                  <div className="font-medium">{rule.title}</div>
                </div>
                <div className="text-sm text-gray-600 mt-1">{rule.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) { 
  return (
    <div className="p-3 border rounded-md">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  )
}