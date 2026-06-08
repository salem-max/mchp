import { useState } from 'react'

export function useCustomerDashboard() {
  const [widgetState] = useState({ activeJobs: 0 })
  return { widgetState }
}
