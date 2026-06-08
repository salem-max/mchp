'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function CallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    if (!code) {
      router.replace('/login?error=missing-code');
      return;
    }

    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
      if (error || !data.session) {
        console.error('Callback exchange failed:', error);
        router.replace('/login?error=auth-failed');
        return;
      }

      const user = data.session.user;
      const role = (user.user_metadata?.role as string | undefined)?.toLowerCase() || 'customer';
      const roleMap: Record<string, string> = {
        'customer': '/dashboard/customer',
        'technician': '/dashboard/technician',
        'admin': '/dashboard/admin',
      };
      router.replace(roleMap[role] || '/dashboard/customer');
    });
  }, [code, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
        <div>
          <p className="text-white text-lg font-medium">Signing you in...</p>
          <p className="text-gray-400 text-sm mt-1">Processing your magic link</p>
        </div>
      </div>
    </div>
  );
}
