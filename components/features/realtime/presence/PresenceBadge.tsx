"use client"

export default function PresenceBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
      Online
    </div>
  )
}
