const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL
const ENGINE_SECRET = process.env.ENGINE_SECRET

export async function enginePost(path: string, body?: object) {
  const res = await fetch(`${ENGINE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-engine-secret': ENGINE_SECRET!
    },
    body: body ? JSON.stringify(body) : undefined
  })
  return res.json()
}

export async function engineGet(path: string) {
  const res = await fetch(`${ENGINE_URL}${path}`, {
    headers: { 'x-engine-secret': ENGINE_SECRET! }
  })
  return res.json()
}