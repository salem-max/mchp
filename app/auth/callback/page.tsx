

import { Suspense } from 'react';
import CallbackClient from './CallbackClient';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
          <div>
            <p className="text-white text-lg font-medium">Signing you in...</p>
            <p className="text-gray-400 text-sm mt-1">Processing your magic link</p>
          </div>
        </div>
      </div>
    }>
      <CallbackClient />
    </Suspense>
  );
}

