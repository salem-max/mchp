export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-responsive py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
            Privacy Policy
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Malaysia Co (Maintenance Services) is committed to protecting your privacy.
          </h1>
          <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">
            This policy explains how we collect, use, and protect personal data when you use our platform.
          </p>
        </div>

        <div className="mt-12 space-y-10 text-sm leading-7 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Information we collect</h2>
            <p className="mt-4">We gather contact information, service requests, payment details, and account preferences when you register or use our application.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">How we use data</h2>
            <p className="mt-4">Your information helps us deliver service recommendations, manage jobs, communicate with technicians, and improve the platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Data sharing</h2>
            <p className="mt-4">We do not sell your personal data. We may share information with service providers needed to fulfill jobs, manage payments, or comply with legal obligations.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Security</h2>
            <p className="mt-4">We implement industry-standard security practices to protect your account and personal data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Questions</h2>
            <p className="mt-4">For privacy questions, contact <a href="mailto:privacy@fixswift.com" className="text-cyan-500 hover:text-cyan-400">privacy@fixswift.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}

