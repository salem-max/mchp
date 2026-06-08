'use client';

import { useState, forwardRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, CheckCircle2, Lock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { Shimmer } from '@/components/ai-elements/shimmer';

const magicSchema = z.object({ email: z.string().email('Invalid email') });
const passwordSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});
type MagicForm = z.infer<typeof magicSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'password' | 'magic'>('password');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSentLink, setHasSentLink] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const magicForm = useForm<MagicForm>({ resolver: zodResolver(magicSchema), defaultValues: { email: '' } });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema), defaultValues: { email: '', password: '' } });

  const onMagicSubmit = async (data: MagicForm) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email.toLowerCase(),
        options: { emailRedirectTo: `${window.location.origin}/api/auth/callback`, shouldCreateUser: false },
      });
      if (error) throw error;
      setSentTo(data.email);
      setHasSentLink(true);
      toast.success('Magic link sent!');
    } catch (err) {
      toast.error((err as Error).message || 'Unable to send login link.');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Login failed');
      toast.success('Welcome back!');
      const roleMap: Record<string, string> = { CUSTOMER: '/dashboard/customer', TECHNICIAN: '/dashboard/technician', ADMIN: '/dashboard/admin', BOTH: '/dashboard/customer' };
      router.push(roleMap[result.role?.toUpperCase()] ?? '/dashboard/customer');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden">
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-20 bg-[#00d4ff] -top-20 -left-20 pointer-events-none" />
        <div className="absolute w-[300px] h-[300px] rounded-full blur-[100px] opacity-15 bg-[#7b61ff] bottom-10 right-0 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00d4ff, #00ffa3)' }}>
            <Zap className="w-5 h-5 text-[#0a0a0f]" />
          </div>
          <span className="text-xl font-bold text-white">Malaysia Co (Maintenance Services)</span>
        </div>

        <div className="relative z-10 space-y-6">
          <Shimmer className="text-4xl font-extrabold text-white leading-tight" duration={4}>
            Your home. Fixed fast.
          </Shimmer>
          <p className="text-white/40 text-base leading-relaxed max-w-sm">
            Connect with 2,400+ vetted technicians for electrical, plumbing, AC, and more - on demand.
          </p>

          <div className="flex gap-6 pt-2">
            {[['2.4k+', 'Technicians'], ['4.9 stars', 'Avg Rating'], ['12k+', 'Jobs Done']].map(([val, label]) => (
              <div key={label}>
                <div className="text-xl font-bold" style={{ background: 'linear-gradient(90deg, #00d4ff, #00ffa3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
                <div className="text-xs text-white/30">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-4 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-sm text-white/50 italic">"Got my AC fixed in 2 hours. Incredible service."</p>
          <p className="text-xs text-white/25 mt-1">-- Sarah K., Customer</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative z-10 w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00d4ff, #00ffa3)' }}>
              <Zap className="w-4 h-4 text-[#0a0a0f]" />
            </div>
            <span className="text-lg font-bold text-white">Malaysia Co (Maintenance Services)</span>
          </div>

          <div className="rounded-3xl p-8 border border-white/10" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(0,212,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-white/40 text-sm mb-6">Sign in to your Malaysia Co (Maintenance Services) account</p>

            <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {(['password', 'magic'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={tab === t
                    ? { background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,163,0.2))', color: '#fff', border: '1px solid rgba(0,212,255,0.3)' }
                    : { color: 'rgba(255,255,255,0.4)' }}
                >
                  {t === 'password' ? <><Lock className="w-3.5 h-3.5" /> Password</> : <><Mail className="w-3.5 h-3.5" /> Magic link</>}
                </button>
              ))}
            </div>

            {tab === 'password' && (
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <Field label="Email" error={passwordForm.formState.errors.email?.message}>
                  <AuthInput type="email" placeholder="your@email.com" autoComplete="email" {...passwordForm.register('email')} />
                </Field>
                <Field label="Password" error={passwordForm.formState.errors.password?.message}>
                  <AuthInput type="password" placeholder="Min 8 characters" autoComplete="current-password" {...passwordForm.register('password')} />
                </Field>
                <GradientButton type="submit" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign in'}
                </GradientButton>
              </form>
            )}

            {tab === 'magic' && (
              hasSentLink ? (
                <div className="rounded-2xl border border-[#00ffa3]/20 p-6 text-center space-y-3" style={{ background: 'rgba(0,255,163,0.05)' }}>
                  <CheckCircle2 className="w-10 h-10 text-[#00ffa3] mx-auto" />
                  <p className="font-semibold text-white">Check your inbox</p>
                  <p className="text-sm text-white/40">Magic link sent to <strong className="text-white/70">{sentTo}</strong>. Expires in 60 min.</p>
                  <button onClick={() => { setHasSentLink(false); magicForm.reset(); }} className="text-xs text-[#00ffa3] underline underline-offset-2">
                    Use a different email
                  </button>
                </div>
              ) : (
                <form onSubmit={magicForm.handleSubmit(onMagicSubmit)} className="space-y-4">
                  <Field label="Email" error={magicForm.formState.errors.email?.message}>
                    <AuthInput type="email" placeholder="your@email.com" autoComplete="email" {...magicForm.register('email')} />
                  </Field>
                  <GradientButton type="submit" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send magic link'}
                  </GradientButton>
                </form>
              )
            )}

            <p className="text-center text-sm text-white/30 mt-6">
              No account?{' '}
              <Link href="/signup" className="text-[#00d4ff] hover:text-[#00ffa3] transition-colors font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shared sub-components

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/50 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const AuthInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => (
    <input
      ref={ref}
      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all duration-200"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.08)'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
      {...props}
    />
  )
);
AuthInput.displayName = 'AuthInput';

function GradientButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="w-full py-3 rounded-xl font-semibold text-sm text-[#0a0a0f] transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      style={{ background: 'linear-gradient(135deg, #00d4ff, #00ffa3)', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}
      {...props}
    >
      {children}
    </button>
  );
}
