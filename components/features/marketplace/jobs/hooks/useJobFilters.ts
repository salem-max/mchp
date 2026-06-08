import { useState } from 'react'

export function useJobFilters() {
  const [status, setStatus] = useState<'open' | 'closed' | 'all'>('all')
  return { status, setStatus }
}
