import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create household with the actual address
  const household = await prisma.household.upsert({
    where: { id: 'household_1' },
    update: {
      name: '2577 Eaton St',
      address: '2577 Eaton St, Edgewater, CO 80214'
    },
    create: { 
      id: 'household_1', 
      name: '2577 Eaton St',
      address: '2577 Eaton St, Edgewater, CO 80214'
    },
  })

  // Create lease with actual details from PDF
  const lease = await prisma.lease.create({
    data: {
      householdId: household.id,
      rent: 630000, // Total of all individual amounts: $6,300 (exceeds lease amount to cover utilities)
      baseRent: 550000, // $5,500.00 in cents
      petRent: 4000, // $40.00 in cents (2 pets @ $20 each)
      securityDeposit: 550000, // $5,500.00 in cents
      dueDay: 1,
      graceThroughDay: 7, // Rent is late on the 8th day
      landlords: 'Sarah and Nathan Harrison',
      propertyManager: 'Focused Property Management, LLC',
      maxOccupants: 8,
      allocationMethod: 'CUSTOM', // Changed to CUSTOM for individual amounts
      startAt: new Date('2025-07-01'),
      endAt: new Date('2027-06-30'),
    }
  })

  // Create late fee policy (higher of $50 or 5%)
  await prisma.lateFeePolicy.create({
    data: { 
      leaseId: lease.id, 
      type: 'FLAT', 
      amount: 27700 // 5% of $554 = $27.70, but minimum is $50, so we'll use $277 (5% of $5540)
    }
  })

  // Create the actual roommates with their specific rent amounts
  const tyler = await prisma.leaseMember.create({
    data: { leaseId: lease.id, name: 'Tyler Y' }
  })
  
  const nickT = await prisma.leaseMember.create({
    data: { leaseId: lease.id, name: 'Nick T' }
  })
  
  const nickL = await prisma.leaseMember.create({
    data: { leaseId: lease.id, name: 'Nick L' }
  })
  
  const austin = await prisma.leaseMember.create({
    data: { leaseId: lease.id, name: 'Austin L' }
  })
  
  const phill = await prisma.leaseMember.create({
    data: { leaseId: lease.id, name: 'Phill A' }
  })
  
  const olivia = await prisma.leaseMember.create({
    data: { leaseId: lease.id, name: 'Olivia O' }
  })
  
  const corey = await prisma.leaseMember.create({
    data: { leaseId: lease.id, name: 'Corey L' }
  })

  // Create lease shares with specific amounts for each member
  await prisma.leaseShare.createMany({
    data: [
      { leaseId: lease.id, memberId: tyler.id, amountCents: 0 }, // Tyler pays $0
      { leaseId: lease.id, memberId: nickT.id, amountCents: 100000 }, // Nick T pays $1000
      { leaseId: lease.id, memberId: nickL.id, amountCents: 100000 }, // Nick L pays $1000
      { leaseId: lease.id, memberId: austin.id, amountCents: 100000 }, // Austin pays $1000
      { leaseId: lease.id, memberId: phill.id, amountCents: 150000 }, // Phill pays $1500
      { leaseId: lease.id, memberId: olivia.id, amountCents: 100000 }, // Olivia pays $1000
      { leaseId: lease.id, memberId: corey.id, amountCents: 80000 }, // Corey pays $800
    ]
  })

  // Create pets
  await prisma.pet.createMany({
    data: [
      {
        leaseId: lease.id,
        type: 'Dog',
        breed: 'Pit Terrier',
        weight: '20 lbs',
        isNeuteredSpayed: true,
        monthlyFee: 2000, // $20 per month
      },
      {
        leaseId: lease.id,
        type: 'Cat',
        breed: 'Tabby',
        weight: '5 lbs',
        isNeuteredSpayed: true,
        monthlyFee: 2000, // $20 per month
      }
    ]
  })

  // Create utilities configuration
  await prisma.utility.createMany({
    data: [
      {
        leaseId: lease.id,
        type: 'ELECTRICITY',
        responsibility: 'TENANT',
        provider: 'Direct to provider',
      },
      {
        leaseId: lease.id,
        type: 'GAS',
        responsibility: 'TENANT',
        provider: 'Direct to provider',
      },
      {
        leaseId: lease.id,
        type: 'WATER_SEWER',
        responsibility: 'LANDLORD_BILLED',
        provider: 'City of Edgewater',
        notes: 'Landlord pays City of Edgewater, then bills tenant via RENT CAFE'
      },
      {
        leaseId: lease.id,
        type: 'TRASH_RECYCLING',
        responsibility: 'LANDLORD_BILLED',
        provider: 'City of Edgewater',
        notes: 'Landlord pays City of Edgewater, then bills tenant via RENT CAFE'
      },
      {
        leaseId: lease.id,
        type: 'INTERNET',
        responsibility: 'TENANT',
        provider: 'Optional - Direct to provider',
      },
      {
        leaseId: lease.id,
        type: 'CABLE_TV',
        responsibility: 'TENANT',
        provider: 'Optional - Direct to provider',
      }
    ]
  })

  // Create sample payments for the current month with correct amounts
  const now = new Date()
  await prisma.payment.createMany({
    data: [
      { 
        householdId: household.id, 
        amount: 100000, // Nick T pays $1000
        payerName: 'Nick T', 
        memberId: nickT.id,
        method: 'manual', 
        status: 'SUCCEEDED', 
        createdAt: new Date(now.getFullYear(), now.getMonth(), 2) 
      },
      { 
        householdId: household.id, 
        amount: 100000, // Austin pays $1000
        payerName: 'Austin L',
        memberId: austin.id, 
        method: 'manual', 
        status: 'SUCCEEDED', 
        createdAt: new Date(now.getFullYear(), now.getMonth(), 3) 
      },
      { 
        householdId: household.id, 
        amount: 150000, // Phill pays $1500
        payerName: 'Phill A',
        memberId: phill.id, 
        method: 'manual', 
        status: 'SUCCEEDED', 
        createdAt: new Date(now.getFullYear(), now.getMonth(), 4) 
      }
    ]
  })

  // Create sample expense for utilities that are billed by landlord
  await prisma.expense.create({
    data: { 
      householdId: household.id, 
      amount: 15000, // $150 for water/sewer/trash
      label: 'Water/Sewer/Trash (City of Edgewater)', 
      splitMethod: 'CUSTOM', // Use custom split based on individual shares
      createdAt: new Date(now.getFullYear(), now.getMonth(), 15) 
    }
  })

  // Create house rules based on lease and common living standards
  await prisma.houseRule.createMany({
    data: [
      {
        householdId: household.id,
        category: 'QUIET_HOURS',
        title: 'Quiet Hours',
        description: 'Maintain quiet hours from 11:00 PM to 8:00 AM. No loud music, noise, or disturbances.',
        icon: '🕚',
        order: 1
      },
      {
        householdId: household.id,
        category: 'CLEANLINESS',
        title: 'Cleanliness Standards',
        description: 'Keep common areas clean and tidy. Clean up immediately after cooking or using shared spaces.',
        icon: '🧹',
        order: 2
      },
      {
        householdId: household.id,
        category: 'GUESTS',
        title: 'Guest Policy',
        description: 'Guests allowed for max 3 consecutive nights and 5 days per month. No overnight guests without prior notice.',
        icon: '👥',
        order: 3
      },
      {
        householdId: household.id,
        category: 'PETS',
        title: 'Pet Policy',
        description: '2 pets registered (1 dog, 1 cat). Clean up after pets immediately. Keep pets from disturbing neighbors.',
        icon: '🐾',
        order: 4
      },
      {
        householdId: household.id,
        category: 'PARKING',
        title: 'Parking',
        description: 'Use attached 3-car tandem garage. Do not block driveways or park on lawns.',
        icon: '🚗',
        order: 5
      },
      {
        householdId: household.id,
        category: 'MAINTENANCE',
        title: 'Maintenance',
        description: 'Report any maintenance issues immediately in writing. Maintain lawn and landscaping.',
        icon: '🔧',
        order: 6
      },
      {
        householdId: household.id,
        category: 'SMOKING',
        title: 'No Smoking',
        description: 'No smoking of any kind inside the premises or buildings. This includes cigarettes, vaping, and marijuana.',
        icon: '🚭',
        order: 7
      },
      {
        householdId: household.id,
        category: 'RENT',
        title: 'Rent Payment',
        description: 'Individual rent amounts: Tyler $0, Nick T $1000, Nick L $1000, Austin $1000, Phill $1500, Olivia $1000, Corey $800',
        icon: '💰',
        order: 8
      }
    ]
  })
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})