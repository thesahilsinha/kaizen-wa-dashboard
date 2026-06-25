import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { clientId } = await req.json()
  const res = await fetch(`${process.env.NEXT_PUBLIC_ENGINE_URL}/connect/${clientId}`, {
    method: 'POST',
    headers: { 'x-engine-secret': process.env.ENGINE_SECRET! }
  })
  const data = await res.json()
  return NextResponse.json(data)
}