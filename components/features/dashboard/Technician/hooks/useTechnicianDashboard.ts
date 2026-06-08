import { useState } from 'react'

export function useTechnicianDashboard() {
  const [status] = useState({ available: true })
  return { status }
}
