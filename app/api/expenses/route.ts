export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function GET() {
  const expenses = await prisma.expense.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { payer: true } })
  return NextResponse.json({ expenses })
}
export async function POST(req: Request) {
  const body = await req.json()
  const created = await prisma.expense.create({ data: { householdId: 'household_1', label: body.desc, amount: Math.round(Number(body.amount) * 100), payerMemberId: body.payerMemberId ?? null, splitMethod: body.splitMethod ?? 'EQUAL' } })
  return NextResponse.json({ ok: true, id: created.id })
}
