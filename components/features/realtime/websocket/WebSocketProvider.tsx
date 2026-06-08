"use client"

import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface WebSocketProviderProps {
  children: ReactNode
}

export default function WebSocketProvider({ children }: WebSocketProviderProps) {
  useEffect(() => {
    const socket = new WebSocket('wss://example.com/socket')
    socket.addEventListener('open', () => {
      console.log('WebSocket connected')
    })
    return () => socket.close()
  }, [])

  return <>{children}</>
}
