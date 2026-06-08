"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsSent(true)
      toast.success('Password reset link sent to your email!')
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <>
        <CardHeader className="space-y-1">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            We sent a password reset link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              The link expires in 1 hour. Didn't receive the email? Check your spam folder.
            </p>
            <Button 
              variant="link" 
              onClick={() => {
                setIsSent(false)
                setEmail('')
              }}
              className="p-0 h-auto text-sm"
            >
              Send another link
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center pt-0">
          <Link href="/login" className="text-sm text-primary hover:underline">
            Back to login
          </Link>
        </CardFooter>
      </>
    )
  }

  return (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Reset password</CardTitle>
        <CardDescription>
          Enter your email address and we will send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send reset link
          </Button>
        </CardContent>
      </form>
      
      <CardFooter className="justify-center pt-0">
        <Link href="/login" className="text-sm text-primary hover:underline">
          Back to login
        </Link>
      </CardFooter>
    </>
  )
}
