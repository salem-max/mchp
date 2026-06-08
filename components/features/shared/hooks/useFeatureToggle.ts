import { useState } from 'react'

export function useFeatureToggle(flag: string) {
  const [enabled] = useState(false)
  return enabled
}
