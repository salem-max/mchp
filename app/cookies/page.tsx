export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-responsive py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex rounded-full bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
            Cookies Policy
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Our cookie policy explained.
          </h1>
          <p className="text-lg leading-8 text-slate-700 dark:text-slate-300">
            Malaysia Co (Maintenance Services) uses cookies to improve your experience, personalize content, and support analytics.
          </p>
        </div>

        <div className="mt-12 space-y-10 text-sm leading-7 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">What cookies are</h2>
            <p className="mt-4">Cookies are small files stored on your browser that help the site remember preferences and improve performance.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">How we use cookies</h2>
            <p className="mt-4">We use cookies for session management, analytics, performance monitoring, and personalized content delivery.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Managing cookies</h2>
            <p className="mt-4">You can control or delete cookies through your browser settings. Disabling cookies may affect site functionality.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Contact</h2>
            <p className="mt-4">For questions about cookies, email <a href="mailto:privacy@fixswift.com" className="text-cyan-500 hover:text-cyan-400">privacy@fixswift.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}

