import ForgotPasswordForm from '@/components/features/auth/ForgotPassword';
import { Card } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-md">
        <Card className="border border-white/10 bg-white/4 backdrop-blur-xl">
          <ForgotPasswordForm />
        </Card>
      </div>
    </div>
  );
}
