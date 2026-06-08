"use client"

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function PromptEditor() {
  const [prompt, setPrompt] = useState('')

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <Textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Write a prompt for the AI assistant..."
        className="min-h-[120px]"
      />
      <Button onClick={() => console.log('Prompt submitted:', prompt)}>Submit Prompt</Button>
    </div>
  )
}
