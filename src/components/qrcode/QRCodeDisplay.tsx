'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QRCodeDisplayProps {
  value: string
  size?: number
  className?: string
}

export function QRCodeDisplay({ value, size = 200, className = '' }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        })
        setQrDataUrl(url)
      } catch (err) {
        setError('Failed to generate QR code')
        console.error(err)
      }
    }

    if (value) {
      generateQR()
    }
  }, [value, size])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 text-red-500 ${className}`}>
        {error}
      </div>
    )
  }

  if (!qrDataUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-slate-100 animate-pulse ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-slate-400">Loading...</span>
      </div>
    )
  }

  return (
    <img
      src={qrDataUrl}
      alt="QR Code"
      className={className}
      style={{ width: size, height: size }}
    />
  )
}
