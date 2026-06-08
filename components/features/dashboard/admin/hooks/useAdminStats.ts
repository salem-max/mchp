import { useState } from 'react'

export function useAdminStats() {
  const [metrics] = useState({ users: 0, jobs: 0, uptime: 100 })
  return { metrics }
}
