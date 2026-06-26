import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_ENGINE_URL}/qr/${clientId}`, {
      headers: { 'x-engine-secret': process.env.ENGINE_SECRET! }
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Engine unreachable' }, { status: 500 })
  }
}