import { useState } from 'react'

export function useCustomerSearch() {
  const [query, setQuery] = useState('')
  return { query, setQuery }
}
