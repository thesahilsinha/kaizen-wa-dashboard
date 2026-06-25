'use client'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import QRCode from 'qrcode'

export default function QRModal({ clientId, onConnected }: { clientId: string, onConnected: () => void }) {
  const [qrImage, setQrImage] = useState('')
  const [status, setStatus] = useState('Initializing...')

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_ENGINE_URL!)
    socket.emit('join', clientId)

    socket.on('qr', async (qrString: string) => {
      setStatus('Scan QR with WhatsApp')
      const img = await QRCode.toDataURL(qrString)
      setQrImage(img)
    })

    socket.on('connected', () => {
      setStatus('Connected!')
      setQrImage('')
      onConnected()
    })

    // Trigger connect
    fetch(`/api/engine/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId })
    })

    return () => { socket.disconnect() }
  }, [clientId])

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-[#111] border border-zinc-800 rounded-2xl">
      <h2 className="font-bold text-lg">Connect WhatsApp</h2>
      <p className="text-zinc-400 text-sm text-center">{status}</p>
      {qrImage && (
        <div className="bg-white p-3 rounded-xl">
          <img src={qrImage} alt="QR Code" className="w-48 h-48" />
        </div>
      )}
      {!qrImage && status !== 'Connected!' && (
        <div className="w-48 h-48 bg-zinc-900 rounded-xl flex items-center justify-center">
          <div className="animate-spin text-[#25D366] text-2xl">⟳</div>
        </div>
      )}
      {status === 'Connected!' && (
        <div className="text-[#25D366] text-xl font-bold">✅ WhatsApp Connected!</div>
      )}
    </div>
  )
}