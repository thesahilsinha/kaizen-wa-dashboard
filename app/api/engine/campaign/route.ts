import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { clientId, campaignId } = await req.json()
  const res = await fetch(`${process.env.NEXT_PUBLIC_ENGINE_URL}/campaign/${clientId}/${campaignId}`, {
    method: 'POST',
    headers: { 'x-engine-secret': process.env.ENGINE_SECRET! }
  })
  const data = await res.json()
  return NextResponse.json(data)
}