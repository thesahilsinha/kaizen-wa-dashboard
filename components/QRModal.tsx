'use client'
import { useEffect, useState, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRModal({ clientId, onConnected }: { clientId: string, onConnected: () => void }) {
  const [qrImage, setQrImage] = useState('')
  const [status, setStatus] = useState('Initializing...')
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Start connection
    fetch('/api/engine/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId })
    })

    // Poll for QR and status
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/engine/qr?clientId=${clientId}`)
        const data = await res.json()

        if (data.status === 'connected') {
          setStatus('Connected!')
          setQrImage('')
          if (pollRef.current) clearInterval(pollRef.current)
          onConnected()
          return
        }

        if (data.qr) {
          setStatus('Scan with WhatsApp')
          const img = await QRCode.toDataURL(data.qr, { width: 256, margin: 2 })
          setQrImage(img)
        } else {
          setStatus('Waiting for QR...')
        }
      } catch (e) {
        setStatus('Engine unreachable...')
      }
    }, 3000)

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [clientId])

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-[#111] border border-zinc-800 rounded-2xl w-full">
      <h2 className="font-bold text-lg">Connect WhatsApp</h2>
      <p className="text-zinc-400 text-sm text-center">{status}</p>
      {qrImage && (
        <div className="bg-white p-3 rounded-xl">
          <img src={qrImage} alt="QR Code" className="w-56 h-56" />
        </div>
      )}
      {!qrImage && status !== 'Connected!' && (
        <div className="w-56 h-56 bg-zinc-900 rounded-xl flex items-center justify-center">
          <div className="animate-spin text-[#25D366] text-3xl">↻</div>
        </div>
      )}
      {status === 'Connected!' && (
        <div className="text-[#25D366] text-xl font-bold">✅ WhatsApp Connected!</div>
      )}
    </div>
  )
}