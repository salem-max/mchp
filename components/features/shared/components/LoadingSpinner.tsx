"use client"

export default function LoadingSpinner() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )
}
