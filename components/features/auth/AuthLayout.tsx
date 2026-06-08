"use client"

import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
  className?: string
}

export function AuthLayout({
  title,
  description,
  children,
  className
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50/50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="mt-6 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
              {title}
            </CardTitle>
            <CardDescription className="mt-2 text-sm text-muted-foreground">
              {description}
            </CardDescription>
          </div>
        </div>
        <Card className={cn("w-full", className)}>
          <CardContent className="p-8">
            {children}
          </CardContent>
        </Card>
        <div className="text-center text-sm text-muted-foreground">
          © 2024 Malaysia Co (Maintenance Services). All rights reserved.
        </div>
      </div>
    </div>
  )
}
