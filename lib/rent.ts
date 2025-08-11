import { addDays, startOfMonth, endOfMonth, isAfter } from 'date-fns'
import type { Lease, LateFeePolicy } from '@prisma/client'

export function currentMonthBounds(now = new Date()) { 
  return { start: startOfMonth(now), end: endOfMonth(now) } 
}

export function isPastDue(lease: Lease, now = new Date()) { 
  const lateEdge = new Date(now.getFullYear(), now.getMonth(), lease.graceThroughDay)
  return isAfter(now, lateEdge) 
}

export function computeLateFees(policy: LateFeePolicy | null, lease: Lease, totalPaidThisMonth: number, now = new Date()) {
  if (!policy) return 0
  const lateEdge = new Date(now.getFullYear(), now.getMonth(), lease.graceThroughDay)
  if (!isAfter(now, lateEdge)) return 0
  
  // For the actual lease: late fee is higher of $50 or 5% of rent
  if (policy.type === 'FLAT') {
    const minFee = 5000 // $50 minimum
    const percentageFee = Math.floor(lease.rent * 0.05) // 5% of rent
    return Math.max(minFee, percentageFee)
  }
  
  // Per day late fees
  const daysLate = Math.max(0, Math.floor((+now - +addDays(lateEdge, 1)) / 86_400_000) + 1)
  return Math.max(0, daysLate * policy.amount)
}

// Calculate individual tenant's share based on allocation method
export function calculateTenantShare(lease: Lease, memberCount: number): number {
  if (lease.allocationMethod === 'EQUAL') {
    return Math.floor(lease.rent / memberCount)
  }
  // Add other allocation methods as needed
  return Math.floor(lease.rent / memberCount)
}

// Calculate pet rent per tenant if pets are assigned to specific tenants
export function calculatePetRentShare(petRent: number, memberCount: number): number {
  // Assuming pet rent is split equally among all tenants
  return Math.floor(petRent / memberCount)
}
