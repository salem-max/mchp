"use client"

interface ErrorBoundaryProps {
  children: ReactNode
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return <>{children}</>
}
