'use client'

import { useActionState } from 'react'
import { toast } from 'sonner' // Add to UI or replace with console.error

export function useServerAction<State, Payload>(
  action: (prevState: State | undefined, formData: Payload) => Promise<State>
) {
  const [state, submitAction, isPending] = useActionState(action, undefined)

  const execute = (payload: Payload) => {
    submitAction(payload)
  }

  return [state, isPending, execute] as const
}


