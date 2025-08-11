export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function GET() {
  const payments = await prisma.payment.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { member: true } })
  return NextResponse.json({ payments })
}
export async function POST(req: Request) {
  const data = await req.json()
  const created = await prisma.payment.create({ data: { householdId: 'household_1', amount: Math.round(Number(data.amount) * 100), status: 'SUCCEEDED', payerName: data.payerName ?? null, memberId: data.memberId ?? null, method: data.method ?? 'manual', note: data.note ?? null } })
  return NextResponse.json({ ok: true, id: created.id })
}
