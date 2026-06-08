import { useState } from 'react'

export function useTechnicianSearch() {
  const [query, setQuery] = useState('')
  return { query, setQuery }
}
