"use client"

import { Mic, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VoiceControl() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Mic className="h-4 w-4" />
        Voice Assistant
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">Microphone active</span>
        <Button size="sm">Mute</Button>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Volume2 className="h-4 w-4" />
        Speech output and transcription support
      </div>
    </div>
  )
}
