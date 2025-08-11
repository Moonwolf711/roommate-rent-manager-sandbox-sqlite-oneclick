export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function GET() {
  const now = new Date()
  const lease = await prisma.lease.findFirst({ where: { startAt: { lte: now }, endAt: { gte: now } }, include: { members: true, shares: true } })
  if (!lease) return NextResponse.json({ error: 'No active lease' }, { status: 404 })
  return NextResponse.json({ method: lease.allocationMethod, members: lease.members, shares: lease.shares, leaseRentCents: lease.rent })
}
export async function POST(req: Request) {
  const data = await req.json()
  const now = new Date()
  const lease = await prisma.lease.findFirst({ where: { startAt: { lte: now }, endAt: { gte: now } }, include: { members: true, shares: true } })
  if (!lease) return NextResponse.json({ error: 'No active lease' }, { status: 404 })
  await prisma.$transaction(async (tx: any) => {
    await tx.lease.update({ where: { id: lease.id }, data: { allocationMethod: data.method } })
    await tx.leaseShare.deleteMany({ where: { leaseId: lease.id } })
    if (Array.isArray(data.shares)) {
      await tx.leaseShare.createMany({ data: data.shares.map((s: any) => ({ leaseId: lease.id, memberId: s.memberId, percentBps: s.percentBps ?? null, amountCents: s.amountCents ?? null })) })
    }
  })
  return NextResponse.json({ ok: true })
}
