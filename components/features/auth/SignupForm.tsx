"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, User, Shield, Wrench, Users, Building } from 'lucide-react'
import { toast } from 'sonner'

interface SignupFormProps {
  role?: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN'
}

export default function SignupForm({ role }: SignupFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect based on role
      if (role === 'CUSTOMER') {
        router.push('/dashboard/customer')
      } else if (role === 'TECHNICIAN') {
        router.push('/dashboard/technician')
      } else {
        router.push('/dashboard/admin')
      }
      
      toast.success('Account created successfully!')
    } catch (error) {
      toast.error('Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const roleConfig = {
    CUSTOMER: { icon: Users, title: 'Customer', subtitle: 'Post jobs & hire technicians' },
    TECHNICIAN: { icon: Wrench, title: 'Technician', subtitle: 'Find jobs & earn money' },
    ADMIN: { icon: Shield, title: 'Admin', subtitle: 'Platform management' }
  }[role || 'CUSTOMER']

  return (
    <>
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
            <roleConfig.icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">{roleConfig.title} Signup</CardTitle>
            <CardDescription>{roleConfig.subtitle}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
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

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+60 123 456 789"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create {roleConfig.title} Account
          </Button>
        </div>
      </form>

      <CardFooter className="flex flex-col gap-4 pt-0">
        <div className="text-xs text-center text-muted-foreground py-4">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </div>
        
        <Button variant="outline" className="w-full">
          Sign up with Google
        </Button>
        
        <div className="text-center">
          <Link href="/login" className="text-sm text-primary hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </CardFooter>
    </>
  )
}
