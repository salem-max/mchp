'use client'

import { useState, useCallback } from 'react'
import { useServerAction } from './useServerAction'
import { z } from 'zod'

const jobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  location: z.object({ lat: z.number(), lng: z.number() }),
  images: z.array(z.string()).min(1),
  budget: z.number().min(1)
})

export type Job = {
  id: string
  title: string
  description: string
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'
  customerId: string
  technicianId?: string
  location: { lat: number; lng: number }
  budget: number
  images: string[]
}

export function useJob() {
  const [jobs, setJobs] = useState<Job[]>([])

  const [postJobState, postJobPending, postJobExecute] = useServerAction(async (prev, formData: FormData) => {
    const validated = jobSchema.parse({
      title: formData.get('title'),
      description: formData.get('description'),
      location: JSON.parse(formData.get('location') as string),
      images: formData.getAll('images'),
      budget: Number(formData.get('budget'))
    })
    // Server action: return new job
    const newJob: Job = { id: 'temp', ...validated, status: 'OPEN' as const, customerId: 'temp' }
    return newJob
  })

  const [acceptJobState, acceptJobPending, acceptJobExecute] = useServerAction(async (_prev, jobId: string) => {
    // Server action (placeholder; implement acceptJob server action)
    const updatedJob: Job = { id: jobId, title: 'Updated', status: 'ASSIGNED' as const, technicianId: 'temp', description: '', location: { lat: 0, lng: 0 }, budget: 0, images: [], customerId: 'temp' }
    setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j))
    return updatedJob
  })

  // Fetch jobs, update status, etc.

  return {
    jobs,
    postJob: postJobExecute,
    acceptJob: acceptJobExecute,
    isPosting: postJobPending,
    postJobError: postJobState
  }
}

